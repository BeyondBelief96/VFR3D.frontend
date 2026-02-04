import { baseApi } from './vfr3dSlice';
import { AirportDiagramsResponseDto } from './dtos';

export const airportDiagramApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAirportDiagramUrlByAirportCode: builder.query<AirportDiagramsResponseDto, string>({
      query: (airportCode) => ({
        url: `/AirportDiagram/${airportCode}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetAirportDiagramUrlByAirportCodeQuery } = airportDiagramApi;
