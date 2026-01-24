import { ObstacleDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const obstaclesApi = baseApi.injectEndpoints({
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
        return `/Obstacle/search?${params.toString()}`;
      },
    }),
    getObstaclesByState: builder.query<
      ObstacleDto[],
      { stateCode: string; minHeightAgl?: number; limit?: number }
    >({
      query: ({ stateCode, minHeightAgl, limit = 1000 }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        if (minHeightAgl !== undefined) {
          params.append('minHeightAgl', minHeightAgl.toString());
        }
        return `/Obstacle/state/${stateCode}?${params.toString()}`;
      },
    }),
    getObstacleByOasNumber: builder.query<ObstacleDto, string>({
      query: (oasNumber) => `/Obstacle/${oasNumber}`,
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
      query: ({ minLat, maxLat, minLon, maxLon, minHeightAgl, limit = 1000 }) => {
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
        return `/Obstacle/bbox?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useSearchObstaclesNearbyQuery,
  useGetObstaclesByStateQuery,
  useGetObstacleByOasNumberQuery,
  useGetObstaclesByBoundingBoxQuery,
} = obstaclesApi;
