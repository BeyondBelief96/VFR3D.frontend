import { AirsigmetDto, MetarDto, PirepDto, TafDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const weatherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet`,
    }),
    getMetarForAirport: builder.query<MetarDto, string>({
      query: (icaoCode) => `/metar/${icaoCode}`,
    }),
    getMetarsByState: builder.query<MetarDto[], string>({
      query: (stateCode) => `/Metar/state/${stateCode}`,
    }),
    getMetarsByStates: builder.query<MetarDto[], string[]>({
      query: (states) => {
        const stateCodesParam = states.join(',');
        return `/Metar/states/${stateCodesParam}`;
      },
    }),
    getAllPireps: builder.query<PirepDto[], void>({
      query: () => `/Pirep`,
    }),
    getTafForAirport: builder.query<TafDto, string>({
      query: (icaoCode) => `/Taf/${icaoCode}`,
    }),
  }),
});

export const {
  useGetAllAirsigmetsQuery,
  useGetMetarForAirportQuery,
  useGetMetarsByStateQuery,
  useGetMetarsByStatesQuery,
  useGetAllPirepsQuery,
  useGetTafForAirportQuery,
} = weatherApi;
