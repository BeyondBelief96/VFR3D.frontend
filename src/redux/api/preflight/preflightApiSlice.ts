import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Tag types for PreflightAPI cache invalidation
export const preflightTagTypes = [
  'airports',
  'airspaces',
  'weather',
  'pireps',
  'sigmets',
  'gairmets',
  'notams',
  'performance',
  'frequencies',
  'runways',
  'obstacles',
] as const;

/**
 * PreflightAPI base query with subscription key authentication.
 * Uses Ocp-Apim-Subscription-Key header for Azure API Management.
 */
const preflightBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_PREFLIGHT_API_BASE_URL,
  prepareHeaders: (headers) => {
    const apiKey = import.meta.env.VITE_PREFLIGHT_API_KEY;
    if (apiKey) {
      headers.set('Ocp-Apim-Subscription-Key', apiKey);
    }
    return headers;
  },
});

// PreflightAPI base configuration
export const preflightApi = createApi({
  reducerPath: 'preflightApi',
  baseQuery: preflightBaseQuery,
  tagTypes: preflightTagTypes,
  keepUnusedDataFor: 180, // Cache for 3 minutes
  endpoints: () => ({}), // Endpoints will be injected from separate files
});
