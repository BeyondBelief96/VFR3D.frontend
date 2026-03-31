import type { TerminalProceduresResponseDto } from './types';
import { preflightApi } from './preflightApiSlice';

export const terminalProceduresApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getTerminalProceduresByAirportCode: builder.query<
      TerminalProceduresResponseDto,
      { airportCode: string; chartCode?: string }
    >({
      query: ({ airportCode, chartCode }) => {
        const params = chartCode ? `?chartCode=${chartCode}` : '';
        return `/terminal-procedures/${airportCode}${params}`;
      },
    }),
    // Convenience endpoint that filters for APD (Airport Diagram) chart code only
    // This replaces the old getAirportDiagramUrlByAirportCode endpoint
    getAirportDiagramUrlByAirportCode: builder.query<TerminalProceduresResponseDto, string>({
      query: (airportCode) => `/terminal-procedures/${airportCode}?chartCode=APD`,
    }),
  }),
});

export const {
  useGetTerminalProceduresByAirportCodeQuery,
  useGetAirportDiagramUrlByAirportCodeQuery,
} = terminalProceduresApi;
