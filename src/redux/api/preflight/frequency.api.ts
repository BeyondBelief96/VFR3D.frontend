import type { CommunicationFrequencyDto, PaginatedResponse } from './types';
import { preflightApi } from './preflightApiSlice';

export const frequencyApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    getFrequenciesByServicedFacility: builder.query<CommunicationFrequencyDto[], string>({
      query: (servicedFacility: string) =>
        `/communication-frequencies/${servicedFacility}?limit=500`,
      transformResponse: (response: PaginatedResponse<CommunicationFrequencyDto>) =>
        response.data ?? [],
      providesTags: (_result, _error, servicedFacility) => [
        { type: 'frequencies', id: servicedFacility },
        { type: 'frequencies', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetFrequenciesByServicedFacilityQuery } = frequencyApi;
