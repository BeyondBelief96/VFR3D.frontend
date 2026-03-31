import type {
  BearingAndDistanceRequestDto,
  BearingAndDistanceResponseDto,
  NavlogRequestDto,
  NavlogResponseDto,
} from './types';
import { preflightApi } from './preflightApiSlice';

export const navlogApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    calculateNavLog: builder.mutation<NavlogResponseDto, NavlogRequestDto>({
      query: (navLogRequest) => ({
        url: `/navlog/calculate`,
        method: 'POST',
        body: navLogRequest,
      }),
    }),
    calcBearingAndDistance: builder.mutation<
      BearingAndDistanceResponseDto,
      BearingAndDistanceRequestDto
    >({
      query: (bearingAndDistanceRequest) => ({
        url: `/navlog/bearing-and-distance`,
        method: 'POST',
        body: bearingAndDistanceRequest,
      }),
    }),
  }),
});

export const { useCalculateNavLogMutation, useCalcBearingAndDistanceMutation } = navlogApi;
