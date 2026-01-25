import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

/**
 * Generates a user-friendly error message for weather API errors.
 * Handles common error scenarios like 404 (no data) and 429 (rate limiting).
 */
export const getWeatherErrorMessage = (
  error: FetchBaseQueryError | SerializedError | string
): string => {
  // Handle string error messages
  if (typeof error === 'string') {
    return error;
  }

  // Handle FetchBaseQueryError
  if ('status' in error) {
    if (error.status === 404) {
      return 'Weather information is not available for this airport. Some airports do not provide METAR or TAF reports.';
    }
    if (error.status === 429) {
      return 'Too many requests. Please try again later.';
    }
  }

  // Default error message
  return 'Unable to load weather information. Some airports do not provide METAR or TAF reports; otherwise, please try again later.';
};
