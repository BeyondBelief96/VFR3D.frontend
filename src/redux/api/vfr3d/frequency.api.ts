import { CommunicationFrequencyDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const frequencyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFrequenciesByServicedFacility: builder.query<CommunicationFrequencyDto[], string>({
      query: (servicedFacility: string) => `/CommunicationFrequency/${servicedFacility}`,
      providesTags: (_result, _error, servicedFacility) => [
        { type: 'frequencies', id: servicedFacility },
        { type: 'frequencies', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetFrequenciesByServicedFacilityQuery } = frequencyApi;
