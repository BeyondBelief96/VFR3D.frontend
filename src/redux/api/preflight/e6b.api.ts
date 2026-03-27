import type {
  AirportCrosswindResponseDto,
  CrosswindCalculationRequestDto,
  CrosswindCalculationResponseDto,
  DensityAltitudeRequestDto,
  DensityAltitudeResponseDto,
} from './types';
import { preflightApi } from './preflightApiSlice';

export interface AirportDensityAltitudeRequestDto {
  temperatureCelsius?: number;
  altimeterInHg?: number;
}

export const e6bApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getCrosswindForAirport: builder.query<AirportCrosswindResponseDto, string>({
      query: (icaoCodeOrIdent) => `/e6b/crosswind/${icaoCodeOrIdent}`,
      providesTags: (_result, _error, icaoCodeOrIdent) => [
        { type: 'performance', id: `crosswind-${icaoCodeOrIdent}` },
        { type: 'performance', id: 'LIST' },
      ],
    }),
    calculateCrosswind: builder.mutation<
      CrosswindCalculationResponseDto,
      CrosswindCalculationRequestDto
    >({
      query: (request) => ({
        url: `/e6b/crosswind/calculate`,
        method: 'POST',
        body: request,
      }),
    }),
    getDensityAltitudeForAirport: builder.query<
      DensityAltitudeResponseDto,
      { icaoCodeOrIdent: string; request?: AirportDensityAltitudeRequestDto }
    >({
      query: ({ icaoCodeOrIdent, request }) => {
        const params = new URLSearchParams();
        if (request?.temperatureCelsius !== undefined) {
          params.append('temperatureCelsiusOverride', request.temperatureCelsius.toString());
        }
        if (request?.altimeterInHg !== undefined) {
          params.append('altimeterInHgOverride', request.altimeterInHg.toString());
        }
        const queryString = params.toString();
        return `/e6b/density-altitude/${icaoCodeOrIdent}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (_result, _error, { icaoCodeOrIdent }) => [
        { type: 'performance', id: `density-${icaoCodeOrIdent}` },
        { type: 'performance', id: 'LIST' },
      ],
    }),
    calculateDensityAltitude: builder.mutation<DensityAltitudeResponseDto, DensityAltitudeRequestDto>(
      {
        query: (request) => ({
          url: `/e6b/density-altitude/calculate`,
          method: 'POST',
          body: request,
        }),
      }
    ),
  }),
});

export const {
  useGetCrosswindForAirportQuery,
  useCalculateCrosswindMutation,
  useGetDensityAltitudeForAirportQuery,
  useCalculateDensityAltitudeMutation,
} = e6bApi;
