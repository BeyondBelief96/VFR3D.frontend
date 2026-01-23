import { CommunicationFrequencyDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const frequencyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFrequenciesByServicedFacility: builder.query<CommunicationFrequencyDto[], string>({
      query: (servicedFacility: string) => `/CommunicationFrequency/${servicedFacility}`,
    }),
  }),
});

export const { useGetFrequenciesByServicedFacilityQuery } = frequencyApi;
