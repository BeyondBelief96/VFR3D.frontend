import { NotamQueryByRouteRequest, NotamResponseDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const notamsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get NOTAMs by route (airports and waypoints)
    getNotamsByRoute: builder.query<NotamResponseDto, NotamQueryByRouteRequest>({
      query: (request) => ({
        url: `/notam/route`,
        method: 'POST',
        body: request,
      }),
      providesTags: ['notams'],
    }),

    // Get NOTAMs for a single airport
    getNotamsForAirport: builder.query<NotamResponseDto, string>({
      query: (icaoCode) => `/notam/airport/${icaoCode}`,
      providesTags: (_result, _error, icaoCode) => [
        { type: 'notams', id: icaoCode },
        { type: 'notams', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetNotamsByRouteQuery,
  useGetNotamsForAirportQuery,
} = notamsApi;
