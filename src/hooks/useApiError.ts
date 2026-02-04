import {
  parseApiError,
  extractValidationErrors,
  ParsedApiError,
} from '@/utility/apiErrors';
import {
  notifyError,
  notifySuccess,
  NotifyErrorOptions,
} from '@/utility/notifications';

/**
 * Hook for handling API errors in components
 *
 * Provides utilities for parsing errors, displaying notifications,
 * and extracting validation errors for form display.
 *
 * @example
 * const { notifyError } = useApiError();
 *
 * const handleSubmit = async () => {
 *   try {
 *     await mutation(args).unwrap();
 *     notifySuccess('Saved', 'Your changes have been saved.');
 *   } catch (error) {
 *     notifyError({ error, operation: 'save changes' });
 *   }
 * };
 */
export function useApiError() {
  return {
    /**
     * Parse an error into a structured format
     */
    parseError: (error: unknown): ParsedApiError => parseApiError(error),

    /**
     * Display an error notification with automatic parsing
     */
    notifyError: (options: NotifyErrorOptions): void => notifyError(options),

    /**
     * Display a success notification
     */
    notifySuccess: (title: string, message: string): void => notifySuccess(title, message),

    /**
     * Extract validation errors from an error for form field display
     */
    getFieldErrors: (error: unknown): Record<string, string[]> | undefined =>
      extractValidationErrors(error),

    /**
     * Whether to show detailed error information (dev mode)
     */
    shouldShowDetails: import.meta.env.DEV,
  };
}
