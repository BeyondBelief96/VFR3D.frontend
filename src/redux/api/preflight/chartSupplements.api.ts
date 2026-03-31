import type { ChartSupplementsResponseDto } from './types';
import { preflightApi } from './preflightApiSlice';

export const chartSupplementApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getChartSupplementUrlByAirportCode: builder.query<ChartSupplementsResponseDto, string>({
      query: (airportCode) => `/chart-supplements/${airportCode}`,
    }),
  }),
});

export const { useGetChartSupplementUrlByAirportCodeQuery } = chartSupplementApi;
