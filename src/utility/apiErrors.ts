import { ApiErrorResponse } from '@/redux/api/vfr3d/dtos';

/**
 * Error categories that determine how errors are displayed and handled
 */
export type ErrorCategory =
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'service_error'
  | 'network'
  | 'unknown';

/**
 * Parsed error structure with all relevant information extracted
 */
export interface ParsedApiError {
  category: ErrorCategory;
  message: string;
  code?: string;
  status?: number;
  validationErrors?: Record<string, string[]>;
  traceId?: string;
  details?: string;
  isRetryable: boolean;
}

/**
 * RTK Query FetchBaseQueryError shape
 */
interface FetchBaseQueryError {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR';
  data?: unknown;
  error?: string;
}

/**
 * Type guard for RTK Query FetchBaseQueryError
 */
export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (typeof (error as FetchBaseQueryError).status === 'number' ||
      (error as FetchBaseQueryError).status === 'FETCH_ERROR' ||
      (error as FetchBaseQueryError).status === 'PARSING_ERROR' ||
      (error as FetchBaseQueryError).status === 'TIMEOUT_ERROR' ||
      (error as FetchBaseQueryError).status === 'CUSTOM_ERROR')
  );
}

/**
 * Type guard for backend ApiErrorResponse
 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('code' in data || 'message' in data || 'validationErrors' in data)
  );
}

/**
 * Map HTTP status code to error category
 */
function getErrorCategory(status: number | string): ErrorCategory {
  if (typeof status === 'string') {
    switch (status) {
      case 'FETCH_ERROR':
      case 'TIMEOUT_ERROR':
        return 'network';
      case 'PARSING_ERROR':
        return 'service_error';
      default:
        return 'unknown';
    }
  }

  switch (status) {
    case 400:
      return 'validation';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    case 429:
      return 'rate_limited';
    default:
      if (status >= 500) {
        return 'service_error';
      }
      return 'unknown';
  }
}

/**
 * Determine if an error is retryable
 */
function isRetryableCategory(category: ErrorCategory): boolean {
  return category === 'network' || category === 'service_error' || category === 'rate_limited';
}

/**
 * Get a default fallback message based on error category and optional operation
 */
export function getDefaultMessage(category: ErrorCategory, operation?: string): string {
  const operationText = operation ? ` ${operation}` : '';

  switch (category) {
    case 'not_found':
      return `The requested resource was not found.`;
    case 'validation':
      return `Please check your input and try again.`;
    case 'conflict':
      return `This operation conflicts with existing data.`;
    case 'unauthorized':
      return `Please log in to continue.`;
    case 'forbidden':
      return `You don't have permission to${operationText || ' perform this action'}.`;
    case 'rate_limited':
      return `Too many requests. Please wait and try again.`;
    case 'service_error':
      return `A server error occurred. Please try again later.`;
    case 'network':
      return `Unable to connect to the server. Please check your internet connection.`;
    case 'unknown':
    default:
      return operation
        ? `Unable to ${operation}. Please try again.`
        : `An unexpected error occurred. Please try again.`;
  }
}

/**
 * Extract a user-friendly message from the error
 */
function extractMessage(
  data: unknown,
  category: ErrorCategory,
  errorString?: string
): string {
  // Try to get message from ApiErrorResponse
  if (isApiErrorResponse(data)) {
    if (data.message) {
      return data.message;
    }
  }

  // Try common error response formats
  if (typeof data === 'object' && data !== null) {
    const errorData = data as Record<string, unknown>;

    // ProblemDetails format (title/detail)
    if (typeof errorData.title === 'string') {
      return errorData.title;
    }
    if (typeof errorData.detail === 'string') {
      return errorData.detail;
    }

    // Simple message field
    if (typeof errorData.message === 'string') {
      return errorData.message;
    }

    // Error field
    if (typeof errorData.error === 'string') {
      return errorData.error;
    }
  }

  // Plain string response
  if (typeof data === 'string' && data.length > 0 && data.length < 200) {
    return data;
  }

  // Error string from FetchBaseQueryError
  if (errorString) {
    return errorString;
  }

  // Fall back to category-based default
  return getDefaultMessage(category);
}

/**
 * Main error parsing function
 * Extracts structured information from any error thrown by RTK Query mutations
 */
export function parseApiError(error: unknown): ParsedApiError {
  // Handle FetchBaseQueryError from RTK Query
  if (isFetchBaseQueryError(error)) {
    const status = error.status;
    const category = getErrorCategory(status);
    const data = error.data;

    // Extract validation errors if present
    let validationErrors: Record<string, string[]> | undefined;
    if (isApiErrorResponse(data) && data.validationErrors) {
      validationErrors = data.validationErrors;
    }

    // Extract other fields from ApiErrorResponse
    const apiError = isApiErrorResponse(data) ? data : undefined;

    return {
      category,
      message: extractMessage(data, category, error.error),
      code: apiError?.code,
      status: typeof status === 'number' ? status : undefined,
      validationErrors,
      traceId: apiError?.traceId,
      details: apiError?.details,
      isRetryable: isRetryableCategory(category),
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check if it's a network error
    const isNetworkError =
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.name === 'TypeError';

    const category: ErrorCategory = isNetworkError ? 'network' : 'unknown';

    return {
      category,
      message: error.message || getDefaultMessage(category),
      isRetryable: isRetryableCategory(category),
    };
  }

  // Handle objects with data property (unwrapped RTK Query errors)
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const errorWithData = error as { data: unknown; status?: number };
    const status = errorWithData.status ?? 500;
    const category = getErrorCategory(status);
    const data = errorWithData.data;

    let validationErrors: Record<string, string[]> | undefined;
    if (isApiErrorResponse(data) && data.validationErrors) {
      validationErrors = data.validationErrors;
    }

    const apiError = isApiErrorResponse(data) ? data : undefined;

    return {
      category,
      message: extractMessage(data, category),
      code: apiError?.code,
      status,
      validationErrors,
      traceId: apiError?.traceId,
      details: apiError?.details,
      isRetryable: isRetryableCategory(category),
    };
  }

  // Handle plain string errors
  if (typeof error === 'string') {
    return {
      category: 'unknown',
      message: error,
      isRetryable: false,
    };
  }

  // Unknown error shape
  return {
    category: 'unknown',
    message: getDefaultMessage('unknown'),
    isRetryable: false,
  };
}

/**
 * Extract validation errors from an error, useful for form field display
 */
export function extractValidationErrors(
  error: unknown
): Record<string, string[]> | undefined {
  const parsed = parseApiError(error);
  return parsed.validationErrors;
}
