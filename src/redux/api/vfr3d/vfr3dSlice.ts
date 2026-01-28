import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

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
] as const;

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_VFR3D_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth slice
      const token = (getState() as RootState).auth.accessToken;
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes,
  keepUnusedDataFor: 180, // Cache for 3 minutes
  endpoints: () => ({}), // Endpoints will be injected from separate files
});
