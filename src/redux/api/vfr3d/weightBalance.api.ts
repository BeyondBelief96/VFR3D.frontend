import {
  WeightBalanceProfileDto,
  CreateWeightBalanceProfileRequestDto,
  UpdateWeightBalanceProfileRequestDto,
  WeightBalanceCalculationRequestDto,
  WeightBalanceCalculationResultDto,
} from './dtos';
import { baseApi } from './vfr3dSlice';
import { weightBalanceTag } from '../rtkQuery.tags';
import { aircraftTag } from './aircraft.api';

export const weightBalanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeightBalanceProfiles: builder.query<WeightBalanceProfileDto[], string>({
      query: (userId) => ({
        url: `/WeightBalance/${userId}`,
        method: 'GET',
      }),
      providesTags: [weightBalanceTag],
    }),
    getWeightBalanceProfile: builder.query<WeightBalanceProfileDto, { userId: string; profileId: string }>({
      query: ({ userId, profileId }) => ({
        url: `/WeightBalance/${userId}/${profileId}`,
        method: 'GET',
      }),
      providesTags: [weightBalanceTag],
    }),
    getWeightBalanceProfilesForAircraft: builder.query<WeightBalanceProfileDto[], { userId: string; aircraftId: string }>({
      query: ({ userId, aircraftId }) => ({
        url: `/WeightBalance/${userId}/aircraft/${aircraftId}`,
        method: 'GET',
      }),
      providesTags: [weightBalanceTag],
    }),
    createWeightBalanceProfile: builder.mutation<
      WeightBalanceProfileDto,
      { userId: string; request: CreateWeightBalanceProfileRequestDto }
    >({
      query: ({ userId, request }) => ({
        url: `/WeightBalance/${userId}`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: [weightBalanceTag, aircraftTag],
    }),
    updateWeightBalanceProfile: builder.mutation<
      WeightBalanceProfileDto,
      { userId: string; profileId: string; request: UpdateWeightBalanceProfileRequestDto }
    >({
      query: ({ userId, profileId, request }) => ({
        url: `/WeightBalance/${userId}/${profileId}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: [weightBalanceTag, aircraftTag],
    }),
    deleteWeightBalanceProfile: builder.mutation<void, { userId: string; profileId: string }>({
      query: ({ userId, profileId }) => ({
        url: `/WeightBalance/${userId}/${profileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [weightBalanceTag, aircraftTag],
    }),
    calculateWeightBalance: builder.mutation<
      WeightBalanceCalculationResultDto,
      { userId: string; profileId: string; request: WeightBalanceCalculationRequestDto }
    >({
      query: ({ userId, profileId, request }) => ({
        url: `/WeightBalance/${userId}/${profileId}/calculate`,
        method: 'POST',
        body: request,
      }),
    }),
  }),
});

export const {
  useGetWeightBalanceProfilesQuery,
  useGetWeightBalanceProfileQuery,
  useGetWeightBalanceProfilesForAircraftQuery,
  useCreateWeightBalanceProfileMutation,
  useUpdateWeightBalanceProfileMutation,
  useDeleteWeightBalanceProfileMutation,
  useCalculateWeightBalanceMutation,
} = weightBalanceApi;
