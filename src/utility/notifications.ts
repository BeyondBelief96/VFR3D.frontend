import { notifications } from '@mantine/notifications';
import { parseApiError, ErrorCategory, getDefaultMessage } from './apiErrors';

/**
 * Options for displaying error notifications
 */
export interface NotifyErrorOptions {
  /** The error object from a catch block or RTK Query */
  error: unknown;
  /** Optional operation description for context (e.g., "upload document") */
  operation?: string;
  /** Whether to show the trace ID in the notification (defaults to true in dev) */
  showTraceId?: boolean;
  /** Override the notification title */
  title?: string;
  /** Auto-close timeout in milliseconds (default varies by category) */
  autoClose?: number | false;
}

/**
 * Get icon name and color based on error category
 */
function getCategoryStyle(category: ErrorCategory): { color: string; autoClose: number } {
  switch (category) {
    case 'validation':
      return { color: 'orange', autoClose: 6000 };
    case 'conflict':
      return { color: 'orange', autoClose: 8000 };
    case 'not_found':
      return { color: 'red', autoClose: 5000 };
    case 'unauthorized':
      return { color: 'red', autoClose: 5000 };
    case 'forbidden':
      return { color: 'red', autoClose: 6000 };
    case 'rate_limited':
      return { color: 'yellow', autoClose: 8000 };
    case 'service_error':
      return { color: 'red', autoClose: 8000 };
    case 'network':
      return { color: 'red', autoClose: 10000 };
    case 'unknown':
    default:
      return { color: 'red', autoClose: 5000 };
  }
}

/**
 * Get a user-friendly title based on error category
 */
function getCategoryTitle(category: ErrorCategory, operation?: string): string {
  switch (category) {
    case 'validation':
      return 'Validation Error';
    case 'conflict':
      return 'Conflict';
    case 'not_found':
      return 'Not Found';
    case 'unauthorized':
      return 'Authentication Required';
    case 'forbidden':
      return 'Access Denied';
    case 'rate_limited':
      return 'Rate Limited';
    case 'service_error':
      return 'Server Error';
    case 'network':
      return 'Connection Error';
    case 'unknown':
    default:
      return operation ? `Failed to ${operation}` : 'Error';
  }
}

/**
 * Display an error notification with intelligent parsing and formatting
 *
 * @example
 * try {
 *   await mutation(args).unwrap();
 * } catch (error) {
 *   notifyError({ error, operation: 'save flight' });
 * }
 */
export function notifyError(options: NotifyErrorOptions): void {
  const { error, operation, title: titleOverride, autoClose: autoCloseOverride } = options;

  // Parse the error to extract structured information
  const parsed = parseApiError(error);
  const { category, message, traceId, validationErrors } = parsed;

  // Get styling based on category
  const style = getCategoryStyle(category);

  // Build the message
  let displayMessage = message;

  // If we have validation errors but no specific message, build one
  if (validationErrors && Object.keys(validationErrors).length > 0 && !message) {
    displayMessage = getDefaultMessage('validation', operation);
  }

  // Use operation context if message is generic
  if (displayMessage === getDefaultMessage(category) && operation) {
    displayMessage = getDefaultMessage(category, operation);
  }

  // Add trace ID in dev mode or if explicitly requested
  const showTraceId = options.showTraceId ?? import.meta.env.DEV;
  if (showTraceId && traceId) {
    displayMessage = `${displayMessage}\n\nTrace ID: ${traceId}`;
  }

  // Determine title
  const title = titleOverride ?? getCategoryTitle(category, operation);

  // Show the notification
  notifications.show({
    title,
    message: displayMessage,
    color: style.color,
    autoClose: autoCloseOverride ?? style.autoClose,
  });
}

/**
 * Display a success notification
 *
 * @example
 * notifySuccess('Flight Saved', 'Your flight has been saved successfully.');
 */
export function notifySuccess(title: string, message: string): void {
  notifications.show({
    title,
    message,
    color: 'green',
    autoClose: 4000,
  });
}

/**
 * Display an info notification
 *
 * @example
 * notifyInfo('Processing', 'Your request is being processed.');
 */
export function notifyInfo(title: string, message: string): void {
  notifications.show({
    title,
    message,
    color: 'blue',
    autoClose: 4000,
  });
}

/**
 * Display a warning notification
 *
 * @example
 * notifyWarning('Low Fuel', 'Consider adding a fuel stop.');
 */
export function notifyWarning(title: string, message: string, autoClose: number = 6000): void {
  notifications.show({
    title,
    message,
    color: 'orange',
    autoClose,
  });
}
