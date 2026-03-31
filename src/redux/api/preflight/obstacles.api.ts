import type { ObstacleDto, PaginatedResponse } from './types';
import { preflightApi } from './preflightApiSlice';

export const obstaclesApi = preflightApi.injectEndpoints({
  endpoints: (builder) => ({
    searchObstaclesNearby: builder.query<
      ObstacleDto[],
      { lat: number; lon: number; radiusNm?: number; minHeightAgl?: number; limit?: number }
    >({
      query: ({ lat, lon, radiusNm = 5, minHeightAgl, limit = 100 }) => {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          radiusNm: radiusNm.toString(),
          limit: limit.toString(),
        });
        if (minHeightAgl !== undefined) {
          params.append('minHeightAgl', minHeightAgl.toString());
        }
        return `/obstacles/search?${params.toString()}`;
      },
      transformResponse: (response: PaginatedResponse<ObstacleDto>) => response.data ?? [],
    }),
    getObstaclesByState: builder.query<
      ObstacleDto[],
      { stateCode: string; minHeightAgl?: number; limit?: number }
    >({
      query: ({ stateCode, minHeightAgl, limit = 500 }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        if (minHeightAgl !== undefined) {
          params.append('minHeightAgl', minHeightAgl.toString());
        }
        return `/obstacles/state/${stateCode}?${params.toString()}`;
      },
      transformResponse: (response: PaginatedResponse<ObstacleDto>) => response.data ?? [],
    }),
    getObstacleByOasNumber: builder.query<ObstacleDto, string>({
      query: (oasNumber) => `/obstacles/${oasNumber}`,
    }),
    getObstaclesByBoundingBox: builder.query<
      ObstacleDto[],
      {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
        minHeightAgl?: number;
        limit?: number;
      }
    >({
      query: ({ minLat, maxLat, minLon, maxLon, minHeightAgl, limit = 500 }) => {
        const params = new URLSearchParams({
          minLat: minLat.toString(),
          maxLat: maxLat.toString(),
          minLon: minLon.toString(),
          maxLon: maxLon.toString(),
          limit: limit.toString(),
        });
        if (minHeightAgl !== undefined) {
          params.append('minHeightAgl', minHeightAgl.toString());
        }
        return `/obstacles/bbox?${params.toString()}`;
      },
      transformResponse: (response: PaginatedResponse<ObstacleDto>) => response.data ?? [],
    }),
    getObstaclesByOasNumbers: builder.query<ObstacleDto[], string[]>({
      query: (oasNumbers) => ({
        url: `/obstacles/by-oas-numbers`,
        method: 'POST',
        body: oasNumbers,
      }),
    }),
  }),
});

export const {
  useSearchObstaclesNearbyQuery,
  useGetObstaclesByStateQuery,
  useGetObstacleByOasNumberQuery,
  useGetObstaclesByBoundingBoxQuery,
  useGetObstaclesByOasNumbersQuery,
} = obstaclesApi;
