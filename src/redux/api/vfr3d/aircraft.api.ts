import {
  AircraftDto,
  CreateAircraftRequestDto,
  UpdateAircraftRequestDto,
} from './dtos';
import { baseApi } from './vfr3dSlice';

export const aircraftTag = 'aircraft';
export const aircraftPerformanceProfileTag = 'aircraftPerformanceProfile';

export const aircraftApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAircraft: builder.query<AircraftDto[], string>({
      query: (userId) => ({
        url: `/Aircraft/${userId}`,
        method: 'GET',
      }),
      providesTags: [aircraftTag, aircraftPerformanceProfileTag],
    }),
    getAircraftById: builder.query<AircraftDto, { userId: string; aircraftId: string }>({
      query: ({ userId, aircraftId }) => ({
        url: `/Aircraft/${userId}/${aircraftId}`,
        method: 'GET',
      }),
      providesTags: [aircraftTag],
    }),
    createAircraft: builder.mutation<AircraftDto, { userId: string; request: CreateAircraftRequestDto }>({
      query: ({ userId, request }) => ({
        url: `/Aircraft/${userId}`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [aircraftTag],
    }),
    updateAircraft: builder.mutation<AircraftDto, { userId: string; aircraftId: string; request: UpdateAircraftRequestDto }>({
      query: ({ userId, aircraftId, request }) => ({
        url: `/Aircraft/${userId}/${aircraftId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: [aircraftTag],
    }),
    deleteAircraft: builder.mutation<void, { userId: string; aircraftId: string }>({
      query: ({ userId, aircraftId }) => ({
        url: `/Aircraft/${userId}/${aircraftId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [aircraftTag],
    }),
  }),
});

export const {
  useGetAircraftQuery,
  useGetAircraftByIdQuery,
  useCreateAircraftMutation,
  useUpdateAircraftMutation,
  useDeleteAircraftMutation,
} = aircraftApi;
