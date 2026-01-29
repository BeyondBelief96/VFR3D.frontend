import { AirsigmetDto, GAirmetDto, MetarDto, PirepDto, TafDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const weatherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Legacy endpoint - fetch all AIRSIGMETs
    getAllAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet`,
    }),

    // SIGMET endpoints by hazard type
    getConvectiveAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet/convective`,
    }),
    getIceAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet/ice`,
    }),
    getTurbAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet/turb`,
    }),
    getIfrAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet/ifr`,
    }),
    getMtnObscnAirsigmets: builder.query<AirsigmetDto[], void>({
      query: () => `/Airsigmet/mtn-obscn`,
    }),

    // G-AIRMET endpoints - legacy (by product)
    getAllGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet`,
    }),

    // G-AIRMET endpoints by hazard type
    getMtObscGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/mt-obsc`,
    }),
    getIfrGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/ifr`,
    }),
    getTurbLoGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/turb-lo`,
    }),
    getTurbHiGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/turb-hi`,
    }),
    getLlwsGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/llws`,
    }),
    getSfcWindGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/sfc-wind`,
    }),
    getIceGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/ice`,
    }),
    getFzlvlGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/fzlvl`,
    }),
    getMFzlvlGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/GAirmet/hazard/m-fzlvl`,
    }),

    // METAR endpoints
    getMetarForAirport: builder.query<MetarDto, string>({
      query: (icaoCode) => `/metar/${icaoCode}`,
      providesTags: (_result, _error, icaoCode) => [
        { type: 'weather', id: `metar-${icaoCode}` },
        { type: 'weather', id: 'LIST' },
      ],
    }),
    getMetarsByState: builder.query<MetarDto[], string>({
      query: (stateCode) => `/Metar/state/${stateCode}`,
      providesTags: ['weather'],
    }),
    getMetarsByStates: builder.query<MetarDto[], string[]>({
      query: (states) => {
        const stateCodesParam = states.join(',');
        return `/Metar/states/${stateCodesParam}`;
      },
      providesTags: ['weather'],
    }),

    // PIREP endpoints
    getAllPireps: builder.query<PirepDto[], void>({
      query: () => `/Pirep`,
      providesTags: ['pireps'],
    }),

    // TAF endpoints
    getTafForAirport: builder.query<TafDto, string>({
      query: (icaoCode) => `/Taf/${icaoCode}`,
      providesTags: (_result, _error, icaoCode) => [
        { type: 'weather', id: `taf-${icaoCode}` },
        { type: 'weather', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  // Legacy AIRSIGMET
  useGetAllAirsigmetsQuery,
  // SIGMET by hazard type
  useGetConvectiveAirsigmetsQuery,
  useGetIceAirsigmetsQuery,
  useGetTurbAirsigmetsQuery,
  useGetIfrAirsigmetsQuery,
  useGetMtnObscnAirsigmetsQuery,
  // G-AIRMET legacy
  useGetAllGAirmetsQuery,
  // G-AIRMET by hazard type
  useGetMtObscGAirmetsQuery,
  useGetIfrGAirmetsQuery,
  useGetTurbLoGAirmetsQuery,
  useGetTurbHiGAirmetsQuery,
  useGetLlwsGAirmetsQuery,
  useGetSfcWindGAirmetsQuery,
  useGetIceGAirmetsQuery,
  useGetFzlvlGAirmetsQuery,
  useGetMFzlvlGAirmetsQuery,
  // METAR
  useGetMetarForAirportQuery,
  useGetMetarsByStateQuery,
  useGetMetarsByStatesQuery,
  // PIREP
  useGetAllPirepsQuery,
  // TAF
  useGetTafForAirportQuery,
} = weatherApi;
