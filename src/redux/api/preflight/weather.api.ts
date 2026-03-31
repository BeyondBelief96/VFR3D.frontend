import type {
  GAirmetDto,
  MetarDto,
  PaginatedResponse,
  PirepDto,
  SigmetDto,
  TafDto,
} from './types';
import { preflightApi } from './preflightApiSlice';

export const weatherApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── SIGMETs (was Airsigmet) ───────────────────────────────────────
    getAllAirsigmets: builder.query<SigmetDto[], void>({
      query: () => `/sigmets?limit=500`,
      transformResponse: (response: PaginatedResponse<SigmetDto>) => response.data ?? [],
    }),
    getConvectiveAirsigmets: builder.query<SigmetDto[], void>({
      query: () => `/sigmets/hazard/CONVECTIVE?limit=500`,
      transformResponse: (response: PaginatedResponse<SigmetDto>) => response.data ?? [],
    }),
    getIceAirsigmets: builder.query<SigmetDto[], void>({
      query: () => `/sigmets/hazard/ICE?limit=500`,
      transformResponse: (response: PaginatedResponse<SigmetDto>) => response.data ?? [],
    }),
    getTurbAirsigmets: builder.query<SigmetDto[], void>({
      query: () => `/sigmets/hazard/TURB?limit=500`,
      transformResponse: (response: PaginatedResponse<SigmetDto>) => response.data ?? [],
    }),
    getIfrAirsigmets: builder.query<SigmetDto[], void>({
      query: () => `/sigmets/hazard/IFR?limit=500`,
      transformResponse: (response: PaginatedResponse<SigmetDto>) => response.data ?? [],
    }),
    getMtnObscnAirsigmets: builder.query<SigmetDto[], void>({
      query: () => `/sigmets/hazard/MTN_OBSCN?limit=500`,
      transformResponse: (response: PaginatedResponse<SigmetDto>) => response.data ?? [],
    }),

    // ── G-AIRMETs ─────────────────────────────────────────────────────
    getAllGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getMtObscGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/MT_OBSC?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getIfrGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/IFR?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getTurbLoGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/TURB_LO?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getTurbHiGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/TURB_HI?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getLlwsGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/LLWS?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getSfcWindGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/SFC_WIND?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getIceGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/ICE?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getFzlvlGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/FZLVL?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),
    getMFzlvlGAirmets: builder.query<GAirmetDto[], void>({
      query: () => `/g-airmets/hazard/M_FZLVL?limit=500`,
      transformResponse: (response: PaginatedResponse<GAirmetDto>) => response.data ?? [],
    }),

    // ── METARs ────────────────────────────────────────────────────────
    getMetarForAirport: builder.query<MetarDto, string>({
      query: (icaoCode) => `/metars/${icaoCode}`,
      providesTags: (_result, _error, icaoCode) => [
        { type: 'weather', id: `metar-${icaoCode}` },
        { type: 'weather', id: 'LIST' },
      ],
    }),
    getMetarsByState: builder.query<MetarDto[], string>({
      query: (stateCode) => `/metars?state=${stateCode}&limit=500`,
      transformResponse: (response: PaginatedResponse<MetarDto>) => response.data ?? [],
      providesTags: ['weather'],
    }),
    getMetarsByStates: builder.query<MetarDto[], string[]>({
      query: (states) => `/metars?state=${states.join(',')}&limit=500`,
      transformResponse: (response: PaginatedResponse<MetarDto>) => response.data ?? [],
      providesTags: ['weather'],
    }),

    // ── PIREPs ────────────────────────────────────────────────────────
    getAllPireps: builder.query<PirepDto[], void>({
      query: () => `/pireps?limit=500`,
      transformResponse: (response: PaginatedResponse<PirepDto>) => response.data ?? [],
      providesTags: ['pireps'],
    }),

    // ── TAFs ──────────────────────────────────────────────────────────
    getTafForAirport: builder.query<TafDto, string>({
      query: (icaoCode) => `/tafs/${icaoCode}`,
      providesTags: (_result, _error, icaoCode) => [
        { type: 'weather', id: `taf-${icaoCode}` },
        { type: 'weather', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  // SIGMETs (keeping legacy hook names for backward compatibility)
  useGetAllAirsigmetsQuery,
  useGetConvectiveAirsigmetsQuery,
  useGetIceAirsigmetsQuery,
  useGetTurbAirsigmetsQuery,
  useGetIfrAirsigmetsQuery,
  useGetMtnObscnAirsigmetsQuery,
  // G-AIRMETs
  useGetAllGAirmetsQuery,
  useGetMtObscGAirmetsQuery,
  useGetIfrGAirmetsQuery,
  useGetTurbLoGAirmetsQuery,
  useGetTurbHiGAirmetsQuery,
  useGetLlwsGAirmetsQuery,
  useGetSfcWindGAirmetsQuery,
  useGetIceGAirmetsQuery,
  useGetFzlvlGAirmetsQuery,
  useGetMFzlvlGAirmetsQuery,
  // METARs
  useGetMetarForAirportQuery,
  useGetMetarsByStateQuery,
  useGetMetarsByStatesQuery,
  // PIREPs
  useGetAllPirepsQuery,
  // TAFs
  useGetTafForAirportQuery,
} = weatherApi;
