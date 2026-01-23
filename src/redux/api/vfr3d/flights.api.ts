import { flightsTag } from '../rtkQuery.tags';
import {
  CreateFlightRequestDto,
  CreateRoundTripFlightRequestDto,
  FlightDto,
  UpdateFlightRequestDto,
} from './dtos';
import { baseApi } from './vfr3dSlice';

export const flightsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFlight: builder.mutation<FlightDto, { userId: string; flight: CreateFlightRequestDto }>({
      query: ({ userId, flight }) => ({
        url: `/Flight?userId=${userId}`,
        method: 'POST',
        body: flight,
      }),
      invalidatesTags: [flightsTag],
    }),
    createRoundTripFlight: builder.mutation<
      { outbound: FlightDto; return: FlightDto },
      { userId: string; request: CreateRoundTripFlightRequestDto }
    >({
      query: ({ userId, request }) => ({
        url: `/Flight/roundtrip?userId=${userId}`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [flightsTag],
    }),
    getFlights: builder.query<FlightDto[], string>({
      query: (userId) => `/Flight/${userId}`,
      providesTags: [flightsTag],
    }),
    getFlight: builder.query<FlightDto, { userId: string; flightId: string }>({
      query: ({ userId, flightId }) => `/Flight/${userId}/${flightId}`,
      providesTags: (_result, _error, arg) => [{ type: flightsTag, id: arg.flightId }],
    }),
    updateFlight: builder.mutation<
      FlightDto,
      { userId: string; flightId: string; flight: UpdateFlightRequestDto }
    >({
      query: ({ userId, flightId, flight }) => ({
        url: `/Flight/${userId}/${flightId}`,
        method: 'PATCH',
        body: flight,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: flightsTag, id: arg.flightId },
        flightsTag,
      ],
    }),
    deleteFlight: builder.mutation<void, { userId: string; flightId: string }>({
      query: ({ userId, flightId }) => ({
        url: `/Flight/${userId}/${flightId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [flightsTag],
    }),
    regenerateNavlog: builder.mutation<FlightDto, { userId: string; flightId: string }>({
      query: ({ userId, flightId }) => ({
        url: `/Flight/RegenerateNavlog/${flightId}?userId=${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: flightsTag, id: arg.flightId },
        flightsTag,
      ],
    }),
  }),
});

export const {
  useCreateFlightMutation,
  useCreateRoundTripFlightMutation,
  useGetFlightsQuery,
  useGetFlightQuery,
  useUpdateFlightMutation,
  useDeleteFlightMutation,
  useRegenerateNavlogMutation,
} = flightsApi;
