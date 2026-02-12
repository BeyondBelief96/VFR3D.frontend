import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getAccessToken } from '@/utility/auth';

// Tag types for cache invalidation
export const tagTypes = [
  'flights',
  'aircraft',
  'aircraftPerformanceProfile',
  'airports',
  'airspaces',
  'weather',
  'pireps',
  'airsigmets',
  'weightBalance',
  'weightBalanceCalculation',
  'notams',
  'performance',
  'frequencies',
  'runways',
  'aircraftDocuments',
] as const;

/**
 * Base query that gets a fresh token from Auth0 for each request.
 * Auth0 handles caching internally - it returns the cached token instantly if valid,
 * or refreshes it automatically if expired.
 */
const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Get token from Auth0 (cached or refreshed automatically)
  const token = await getAccessToken();

  // Create the base query with the token
  const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_VFR3D_BASE_URL,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  return baseQuery(args, api, extraOptions);
};

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuth,
  tagTypes,
  keepUnusedDataFor: 180, // Cache for 3 minutes
  endpoints: () => ({}), // Endpoints will be injected from separate files
});
