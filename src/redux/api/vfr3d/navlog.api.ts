import {
  BearingAndDistanceRequestDto,
  BearingAndDistanceResponseDto,
  NavlogRequestDto,
  NavlogResponseDto,
} from './dtos';
import { baseApi } from './vfr3dSlice';

export const navlogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    calculateNavLog: builder.mutation<NavlogResponseDto, NavlogRequestDto>({
      query: (navLogRequest) => ({
        url: `/Navlog/CalculateNavlog`,
        method: 'POST',
        body: navLogRequest,
      }),
    }),
    calcBearingAndDistance: builder.mutation<
      BearingAndDistanceResponseDto,
      BearingAndDistanceRequestDto
    >({
      query: (bearingAndDistanceRequest) => ({
        url: `/Navlog/CalculateBearingAndDistance`,
        method: 'POST',
        body: bearingAndDistanceRequest,
      }),
    }),
  }),
});

export const { useCalculateNavLogMutation, useCalcBearingAndDistanceMutation } = navlogApi;
