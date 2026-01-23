import { baseApi } from './vfr3dSlice';

export const airportDiagramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAirportDiagramUrlByAirportCode: builder.query<{ pdfUrl: string }, string>({
      query: (airportCode) => ({
        url: `/AirportDiagram/${airportCode}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetAirportDiagramUrlByAirportCodeQuery } = airportDiagramApi;
