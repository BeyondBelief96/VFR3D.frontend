import type { AirportDto, PaginatedResponse, RunwayDto } from './types';
import { preflightApi } from './preflightApiSlice';

export const airportsApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAirports: builder.query<AirportDto[], string>({
      query: (searchOrState = '') => {
        if (!searchOrState) return `/airports?limit=500`;
        return `/airports?search=${encodeURIComponent(searchOrState)}&limit=500`;
      },
      transformResponse: (response: PaginatedResponse<AirportDto>) => response.data ?? [],
      keepUnusedDataFor: 300,
    }),
    getAirportByIcaoCodeOrIdent: builder.query<AirportDto, string>({
      query: (icaoCodeOrIdent) => `/airports/${icaoCodeOrIdent}`,
      keepUnusedDataFor: 300,
      transformResponse: (response: AirportDto) => {
        if (!response || Object.keys(response).length === 0) {
          return null as unknown as AirportDto;
        }
        return response;
      },
    }),
    getAirportsByState: builder.query<AirportDto[], string>({
      query: (stateCode) => `/airports?state=${stateCode}&limit=500`,
      transformResponse: (response: PaginatedResponse<AirportDto>) => response.data ?? [],
      keepUnusedDataFor: 300,
    }),
    getAirportsByStates: builder.query<AirportDto[], string[]>({
      query: (states) => `/airports?state=${states.join(',')}&limit=500`,
      transformResponse: (response: PaginatedResponse<AirportDto>) => response.data ?? [],
      keepUnusedDataFor: 300,
    }),
    getAirportsByIcaoCodesOrIdents: builder.query<AirportDto[], string[]>({
      query: (icaoCodesOrIdents) => `/airports/batch?ids=${icaoCodesOrIdents.join(',')}`,
      keepUnusedDataFor: 300,
    }),
    getAirportsByPrefix: builder.query<AirportDto[], string>({
      query: (prefix) => `/airports?search=${encodeURIComponent(prefix)}&limit=20`,
      transformResponse: (response: PaginatedResponse<AirportDto>) => response.data ?? [],
      keepUnusedDataFor: 300,
    }),
    searchAirports: builder.query<AirportDto[], string>({
      query: (searchQuery) => `/airports?search=${encodeURIComponent(searchQuery)}&limit=50`,
      transformResponse: (response: PaginatedResponse<AirportDto>) => response.data ?? [],
      keepUnusedDataFor: 300,
    }),
    getRunwaysByAirportCode: builder.query<RunwayDto[], string>({
      query: (icaoCodeOrIdent) => `/runways/airport/${icaoCodeOrIdent}`,
      keepUnusedDataFor: 300,
      providesTags: (_result, _error, icaoCodeOrIdent) => [
        { type: 'runways', id: icaoCodeOrIdent },
        { type: 'runways', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllAirportsQuery,
  useGetAirportByIcaoCodeOrIdentQuery,
  useGetAirportsByStateQuery,
  useGetAirportsByStatesQuery,
  useGetAirportsByIcaoCodesOrIdentsQuery,
  useLazyGetAirportByIcaoCodeOrIdentQuery,
  useGetAirportsByPrefixQuery,
  useSearchAirportsQuery,
  useGetRunwaysByAirportCodeQuery,
} = airportsApi;
