import { aircraftPerformanceProfileTag, flightsTag } from '../rtkQuery.tags';
import {
  AircraftPerformanceProfileDto,
  SaveAircraftPerformanceProfileRequestDto,
  UpdateAircraftPerformanceProfileRequestDto,
} from './dtos';
import { baseApi } from './vfr3dSlice';

export const performanceProfilesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveAircraftPerformanceProfile: builder.mutation<
      AircraftPerformanceProfileDto,
      SaveAircraftPerformanceProfileRequestDto
    >({
      query: (aircraftPerformanceDTO) => ({
        url: `/AircraftPerformanceProfile`,
        method: 'POST',
        body: aircraftPerformanceDTO,
      }),
      invalidatesTags: [aircraftPerformanceProfileTag, flightsTag],
    }),
    getAircraftPerformanceProfiles: builder.query<AircraftPerformanceProfileDto[], string>({
      query: (userId) => ({
        url: `/AircraftPerformanceProfile/${userId}`,
        method: 'GET',
      }),
      providesTags: [aircraftPerformanceProfileTag],
    }),
    updateAircraftPerformanceProfile: builder.mutation<
      AircraftPerformanceProfileDto,
      { id: string; request: UpdateAircraftPerformanceProfileRequestDto }
    >({
      query: ({ id, request }) => ({
        url: `/AircraftPerformanceProfile/${id}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: [aircraftPerformanceProfileTag, flightsTag],
    }),
    deleteAircraftPerformanceProfile: builder.mutation<
      void,
      { userId: string; aircraftPerformanceProfileId: string }
    >({
      query: ({ userId, aircraftPerformanceProfileId: profileId }) => ({
        url: `/AircraftPerformanceProfile/${userId}/${profileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [aircraftPerformanceProfileTag, flightsTag],
    }),
  }),
});

export const {
  useSaveAircraftPerformanceProfileMutation,
  useGetAircraftPerformanceProfilesQuery,
  useUpdateAircraftPerformanceProfileMutation,
  useDeleteAircraftPerformanceProfileMutation,
} = performanceProfilesApi;
