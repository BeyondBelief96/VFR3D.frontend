import type { NotamQueryByRouteRequest, NotamResponseDto } from './types';
import { preflightApi } from './preflightApiSlice';

export const notamsApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotamsByRoute: builder.query<NotamResponseDto, NotamQueryByRouteRequest>({
      query: (request) => ({
        url: `/notams/route`,
        method: 'POST',
        body: request,
      }),
      providesTags: ['notams'],
    }),
    getNotamsForAirport: builder.query<NotamResponseDto, string>({
      query: (icaoCode) => `/notams/${icaoCode}`,
      providesTags: (_result, _error, icaoCode) => [
        { type: 'notams', id: icaoCode },
        { type: 'notams', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetNotamsByRouteQuery, useGetNotamsForAirportQuery } = notamsApi;
