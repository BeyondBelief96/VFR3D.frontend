import {
  AirportCrosswindResponseDto,
  CrosswindCalculationRequestDto,
  CrosswindCalculationResponseDto,
  DensityAltitudeRequestDto,
  DensityAltitudeResponseDto,
} from './dtos';
import { baseApi } from './vfr3dSlice';

export interface AirportDensityAltitudeRequestDto {
  temperatureCelsius?: number;
  altimeterInHg?: number;
}

export const performanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCrosswindForAirport: builder.query<AirportCrosswindResponseDto, string>({
      query: (icaoCodeOrIdent) => `/Performance/crosswind/${icaoCodeOrIdent}`,
    }),
    calculateCrosswind: builder.mutation<
      CrosswindCalculationResponseDto,
      CrosswindCalculationRequestDto
    >({
      query: (request) => ({
        url: `/Performance/crosswind/calculate`,
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
          params.append('temperatureCelsius', request.temperatureCelsius.toString());
        }
        if (request?.altimeterInHg !== undefined) {
          params.append('altimeterInHg', request.altimeterInHg.toString());
        }
        const queryString = params.toString();
        return `/Performance/density-altitude/${icaoCodeOrIdent}${queryString ? `?${queryString}` : ''}`;
      },
    }),
    calculateDensityAltitude: builder.mutation<DensityAltitudeResponseDto, DensityAltitudeRequestDto>(
      {
        query: (request) => ({
          url: `/Performance/density-altitude/calculate`,
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
} = performanceApi;
