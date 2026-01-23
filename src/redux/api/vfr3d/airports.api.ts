import { AirportDto, RunwayDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const airportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAirports: builder.query<AirportDto[], string>({
      query: (icaoIdOrIdent = '') => `/Airport?icaoIdOrIdent=${icaoIdOrIdent}`,
      keepUnusedDataFor: 300,
    }),
    getAirportByIcaoCodeOrIdent: builder.query<AirportDto, string>({
      query: (icaoCodeOrIdent) => `/Airport/${icaoCodeOrIdent}`,
      keepUnusedDataFor: 300,
      transformResponse: (response: AirportDto) => {
        if (!response || Object.keys(response).length === 0) {
          return null as unknown as AirportDto;
        }
        return response;
      },
    }),
    getAirportsByState: builder.query<AirportDto[], string>({
      query: (stateCode) => `/Airport/state/${stateCode}`,
      keepUnusedDataFor: 300,
    }),
    getAirportsByStates: builder.query<AirportDto[], string[]>({
      query: (states) =>
        `/Airport/states/${states.length > 1 ? states.join(',') : states[0] || ''}`,
      keepUnusedDataFor: 300,
    }),
    getAirportsByIcaoCodesOrIdents: builder.query<AirportDto[], string[]>({
      query: (icaoCodesOrIdents) => `/Airport/batch/${icaoCodesOrIdents.join(',')}`,
      keepUnusedDataFor: 300,
    }),
    getAirportsByPrefix: builder.query<AirportDto[], string>({
      query: (icaoCodeOrIdent) => `/Airport/prefix/${icaoCodeOrIdent}`,
      keepUnusedDataFor: 300,
    }),
    getRunwaysByAirportCode: builder.query<RunwayDto[], string>({
      query: (icaoCodeOrIdent) => `/Airport/${icaoCodeOrIdent}/runways`,
      keepUnusedDataFor: 300,
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
  useGetRunwaysByAirportCodeQuery,
} = airportsApi;
