import { AirspaceDto, SpecialUseAirspaceDto } from './dtos';
import { baseApi } from './vfr3dSlice';

export const airspacesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAirspacesByClass: builder.query<AirspaceDto[], string[]>({
      query: (classes) => `Airspace/by-classes?classes=${classes.join(',')}`,
    }),
    getAirspacesByCity: builder.query<AirspaceDto[], string[]>({
      query: (cities) => `Airspace/by-cities?cities=${cities.join(',')}`,
    }),
    getAirspacesByState: builder.query<AirspaceDto[], string[]>({
      query: (states) => `Airspace/by-states?states=${states.join(',')}`,
    }),
    getSpecialUseAirspacesByTypeCode: builder.query<SpecialUseAirspaceDto[], string[]>({
      query: (typeCodes) => `Airspace/special-use/by-type-codes?typeCodes=${typeCodes.join(',')}`,
    }),
    getAirspacesByIcaoOrIdent: builder.query<AirspaceDto[], string[]>({
      query: (icaoOrIdents) => `Airspace/by-icao-or-idents?icaoOrIdents=${icaoOrIdents.join(',')}`,
    }),
    getAirspacesByGlobalIds: builder.query<AirspaceDto[], string[]>({
      query: (globalIds) => `Airspace/by-global-ids?globalIds=${globalIds.join(',')}`,
    }),
    getSpecialUseAirspacesByGlobalIds: builder.query<SpecialUseAirspaceDto[], string[]>({
      query: (globalIds) => `Airspace/special-use/by-global-ids?globalIds=${globalIds.join(',')}`,
    }),
  }),
});

export const {
  useGetAirspacesByClassQuery,
  useGetAirspacesByCityQuery,
  useGetAirspacesByStateQuery,
  useGetSpecialUseAirspacesByTypeCodeQuery,
  useGetAirspacesByIcaoOrIdentQuery,
  useGetAirspacesByGlobalIdsQuery,
  useGetSpecialUseAirspacesByGlobalIdsQuery,
} = airspacesApi;
