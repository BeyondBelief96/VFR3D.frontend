import type { AirspaceDto, PaginatedResponse, SpecialUseAirspaceDto } from './types';
import { preflightApi } from './preflightApiSlice';

export const airspacesApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getAirspacesByClass: builder.query<AirspaceDto[], string[]>({
      query: (classes) => `/airspaces/by-classes?classes=${classes.join(',')}&limit=500`,
      transformResponse: (response: PaginatedResponse<AirspaceDto>) => response.data ?? [],
    }),
    getAirspacesByCity: builder.query<AirspaceDto[], string[]>({
      query: (cities) => `/airspaces/by-cities?cities=${cities.join(',')}&limit=500`,
      transformResponse: (response: PaginatedResponse<AirspaceDto>) => response.data ?? [],
    }),
    getAirspacesByState: builder.query<AirspaceDto[], string[]>({
      query: (states) => `/airspaces/by-states?states=${states.join(',')}&limit=500`,
      transformResponse: (response: PaginatedResponse<AirspaceDto>) => response.data ?? [],
    }),
    getSpecialUseAirspacesByTypeCode: builder.query<SpecialUseAirspaceDto[], string[]>({
      query: (typeCodes) =>
        `/airspaces/special-use/by-type-codes?typeCodes=${typeCodes.join(',')}&limit=500`,
      transformResponse: (response: PaginatedResponse<SpecialUseAirspaceDto>) =>
        response.data ?? [],
    }),
    getAirspacesByIcaoOrIdent: builder.query<AirspaceDto[], string[]>({
      query: (icaoOrIdents) => `/airspaces/by-icao-or-idents?icaoOrIdents=${icaoOrIdents.join(',')}`,
    }),
    getAirspacesByGlobalIds: builder.query<AirspaceDto[], string[]>({
      query: (globalIds) => `/airspaces/by-global-ids?globalIds=${globalIds.join(',')}`,
      transformResponse: (response: PaginatedResponse<AirspaceDto>) => response.data ?? [],
    }),
    getSpecialUseAirspacesByGlobalIds: builder.query<SpecialUseAirspaceDto[], string[]>({
      query: (globalIds) =>
        `/airspaces/special-use/by-global-ids?globalIds=${globalIds.join(',')}`,
      transformResponse: (response: PaginatedResponse<SpecialUseAirspaceDto>) =>
        response.data ?? [],
    }),
  }),
});

export const {
  useGetAirspacesByClassQuery,
  useGetAirspacesByCityQuery,
  useGetAirspacesByStateQuery,
  useGetSpecialUseAirspacesByTypeCodeQuery,
  useGetAirspacesByIcaoOrIdentQuery,
  useGetAirspacesByGlobalIdsQuery,
  useGetSpecialUseAirspacesByGlobalIdsQuery,
} = airspacesApi;
