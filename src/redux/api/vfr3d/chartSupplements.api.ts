import { baseApi } from './vfr3dSlice';

export const chartSupplementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChartSupplementUrlByAirportCode: builder.query<{ pdfUrl: string }, string>({
      query: (airportCode) => ({
        url: `/ChartSupplement/${airportCode}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetChartSupplementUrlByAirportCodeQuery } = chartSupplementApi;
