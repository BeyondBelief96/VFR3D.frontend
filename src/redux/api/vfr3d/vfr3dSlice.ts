import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../../store';
import { setAccessToken, clearAccessToken } from '../../slices/authSlice';
import { getFreshToken } from '@/utility/auth';

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

// Base fetch query configuration
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_VFR3D_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the auth slice
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Don't set Content-Type here - let endpoints handle it
    // FormData uploads need browser to set boundary automatically
    return headers;
  },
});

// Mutex to prevent concurrent token refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Get a fresh token, ensuring only one refresh happens at a time.
 * Multiple concurrent 401s will wait for the same refresh to complete.
 */
async function getTokenWithMutex(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    // Another refresh is in progress, wait for it
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = getFreshToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Wrapper around baseQuery that handles 401 errors by refreshing the token and retrying.
 * This follows the RTK Query re-authentication pattern.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 Unauthorized, try to refresh the token and retry
  if (result.error && result.error.status === 401) {
    console.log('[API] Received 401, attempting token refresh...');

    // Try to get a fresh token from Auth0 (with mutex to prevent concurrent refreshes)
    const newToken = await getTokenWithMutex();

    if (newToken) {
      // Store the new token in Redux
      api.dispatch(setAccessToken(newToken));
      console.log('[API] Token refreshed, retrying request...');

      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Token refresh failed - clear the token and let the UI handle the redirect
      console.log('[API] Token refresh failed, clearing auth state');
      api.dispatch(clearAccessToken());
    }
  }

  return result;
};

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  keepUnusedDataFor: 180, // Cache for 3 minutes
  endpoints: () => ({}), // Endpoints will be injected from separate files
});
