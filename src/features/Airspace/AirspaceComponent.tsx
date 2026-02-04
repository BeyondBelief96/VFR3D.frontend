import React, { useEffect, useCallback, useMemo } from 'react';
import { Color, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, Entity } from 'cesium';
import { useDispatch, useSelector } from 'react-redux';
import { useCesium } from 'resium';
import {
  useGetAirspacesByClassQuery,
  useGetSpecialUseAirspacesByTypeCodeQuery,
  useGetAirspacesByGlobalIdsQuery,
  useGetSpecialUseAirspacesByGlobalIdsQuery,
  useGetAirspacesByIcaoOrIdentQuery,
} from '@/redux/api/vfr3d/airspaces.api';
import { PolygonEntity } from '@/components/Cesium';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getAirspacePolygonHeights, simplifyPolygon } from '@/utility/cesiumUtils';
import { AirspaceClass, SpecialUseAirspaceTypeCode } from '@/redux/slices/airspacesSlice';
import { AirspaceDto, SpecialUseAirspaceDto } from '@/redux/api/vfr3d/dtos';
import { useGetFlightQuery } from '@/redux/api/vfr3d/flights.api';
import { useAuth0 } from '@auth0/auth0-react';
import { FlightDisplayMode } from '@/utility/enums';
import type { RootState } from '@/redux/store';
import { Center, Loader } from '@mantine/core';

export const AirspaceComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { viewer } = useCesium();
  const { user } = useAuth0();
  const visibleClasses = useSelector((state: RootState) => state.airspaces.visibleClasses);
  const visibleTypeCodes = useSelector((state: RootState) => state.airspaces.visibleTypeCodes);
  const showRouteAirspaces = useSelector((state: RootState) => state.airspaces.showRouteAirspaces);
  const airspaceAirports = useSelector((state: RootState) => state.airspaces.airspaceAirports);
  const { navlogPreview, displayMode } = useSelector((state: RootState) => state.flightPlanning);
  const { activeFlightId } = useSelector((state: RootState) => state.flightPlanning);

  // Get array of ICAO/idents for airports with airspaces
  const airportIdentifiers = useMemo(
    () => airspaceAirports.map((a) => a.icaoOrIdent),
    [airspaceAirports]
  );

  const selectedClasses = useMemo(
    () =>
      Object.entries(visibleClasses)
        .filter(([, isVisible]) => isVisible)
        .map(([className]) => className as AirspaceClass),
    [visibleClasses]
  );

  const selectedTypeCodes = useMemo(
    () =>
      Object.entries(visibleTypeCodes)
        .filter(([, isVisible]) => isVisible)
        .map(([typeCode]) => typeCode as SpecialUseAirspaceTypeCode),
    [visibleTypeCodes]
  );

  const { data: airspacesByClass, isFetching: isFetchingByClass } = useGetAirspacesByClassQuery(
    selectedClasses,
    {
      skip: selectedClasses.length === 0,
    }
  );

  const { data: specialUseAirspaces, isFetching: isFetchingSpecialUse } =
    useGetSpecialUseAirspacesByTypeCodeQuery(selectedTypeCodes, {
      skip: selectedTypeCodes.length === 0,
    });

  // Route-specific airspaces using global IDs from navlog preview or loaded flight
  const { data: loadedFlight } = useGetFlightQuery(
    { userId: user?.sub || '', flightId: activeFlightId || '' },
    { skip: !user || !user.sub || !activeFlightId }
  );

  const routeAirspaceIds: string[] = useMemo(() => {
    if (navlogPreview?.airspaceGlobalIds && displayMode === FlightDisplayMode.PREVIEW) {
      return Array.from(new Set(navlogPreview.airspaceGlobalIds));
    }
    if (displayMode === FlightDisplayMode.VIEWING) {
      return Array.from(new Set(loadedFlight?.airspaceGlobalIds || []));
    }
    return [];
  }, [navlogPreview, displayMode, loadedFlight]);

  const routeSpecialUseIds: string[] = useMemo(() => {
    if (navlogPreview?.specialUseAirspaceGlobalIds && displayMode === FlightDisplayMode.PREVIEW) {
      return Array.from(new Set(navlogPreview.specialUseAirspaceGlobalIds));
    }
    if (displayMode === FlightDisplayMode.VIEWING) {
      return Array.from(new Set(loadedFlight?.specialUseAirspaceGlobalIds || []));
    }
    return [];
  }, [navlogPreview, displayMode, loadedFlight]);

  const { data: routeAirspaces } = useGetAirspacesByGlobalIdsQuery(routeAirspaceIds, {
    skip:
      !showRouteAirspaces ||
      !(displayMode === FlightDisplayMode.PREVIEW || displayMode === FlightDisplayMode.VIEWING) ||
      routeAirspaceIds.length === 0,
  });

  const { data: routeSpecialUseAirspaces } = useGetSpecialUseAirspacesByGlobalIdsQuery(
    routeSpecialUseIds,
    {
      skip:
        !showRouteAirspaces ||
        !(displayMode === FlightDisplayMode.PREVIEW || displayMode === FlightDisplayMode.VIEWING) ||
        routeSpecialUseIds.length === 0,
    }
  );

  // Multi-airport context airspaces - query with array of identifiers
  const { data: airportContextAirspaces } = useGetAirspacesByIcaoOrIdentQuery(
    airportIdentifiers,
    {
      skip: airportIdentifiers.length === 0,
    }
  );

  const routeAirspacesVisible =
    showRouteAirspaces &&
    (displayMode === FlightDisplayMode.PREVIEW || displayMode === FlightDisplayMode.VIEWING);

  const getColorForClass = useCallback((airspaceClass: string): Color => {
    switch (airspaceClass) {
      case 'B':
        return Color.BLUE.withAlpha(0.2);
      case 'C':
        return Color.PURPLE.withAlpha(0.2);
      case 'D':
        return Color.CYAN.withAlpha(0.2);
      case 'E':
        return Color.MAGENTA.withAlpha(0.2);
      default:
        return Color.WHITE.withAlpha(0.2);
    }
  }, []);

  const getColorForTypeCode = useCallback((typeCode: string): Color => {
    switch (typeCode) {
      case 'MOA':
        return Color.ORANGE.withAlpha(0.5);
      case 'R':
        return Color.RED.withAlpha(0.5);
      case 'W':
        return Color.INDIGO.withAlpha(0.5);
      case 'A':
        return Color.GREEN.withAlpha(0.5);
      case 'P':
        return Color.PINK.withAlpha(0.5);
      case 'D':
        return Color.BROWN.withAlpha(0.5);
      default:
        return Color.GRAY.withAlpha(0.2);
    }
  }, []);

  const convertAirspaceToPolygonProps = useCallback(
    (airspace: AirspaceDto | SpecialUseAirspaceDto, isSpecialUse: boolean) => {
      const simplifiedCoordinates = simplifyPolygon(
        airspace.geometry?.coordinates?.[0] || [],
        0.001
      );
      const points = simplifiedCoordinates.map((coord) =>
        Cartesian3.fromDegrees(coord[0], coord[1])
      );
      const color = isSpecialUse
        ? getColorForTypeCode(airspace.typeCode || '')
        : getColorForClass(airspace.class || '');

      const { minHeight, maxHeight } = getAirspacePolygonHeights(airspace);

      return {
        points,
        minHeight,
        maxHeight,
        color,
        outlineColor: Color.WHITE,
        id: isSpecialUse
          ? `sua-${airspace.globalId}-${airspace.typeCode}`
          : `airspace-${airspace.globalId}-${airspace.class}`,
      };
    },
    [getColorForClass, getColorForTypeCode]
  );

  const buildEntityId = useCallback(
    (airspace: AirspaceDto | SpecialUseAirspaceDto, isSpecialUse: boolean) =>
      isSpecialUse
        ? `sua-${airspace.globalId}-${(airspace as SpecialUseAirspaceDto).typeCode}`
        : `airspace-${airspace.globalId}-${(airspace as AirspaceDto).class}`,
    []
  );

  const routeEntityIds = useMemo(() => {
    const ids = new Set<string>();
    (routeAirspaces || []).forEach((a) => ids.add(buildEntityId(a, false)));
    (routeSpecialUseAirspaces || []).forEach((a) => ids.add(buildEntityId(a, true)));
    return ids;
  }, [routeAirspaces, routeSpecialUseAirspaces, buildEntityId]);

  // Airport context entity IDs for deduplication
  // IMPORTANT: Only include airspaces if there are currently airports in the list
  // This ensures that when an airport is removed, class-based airspaces can show again
  const airportContextEntityIds = useMemo(() => {
    const ids = new Set<string>();
    // Only build the dedup set if we have airports selected
    if (airportIdentifiers.length > 0 && airportContextAirspaces) {
      airportContextAirspaces.forEach((a) => ids.add(buildEntityId(a, false)));
    }
    return ids;
  }, [airportIdentifiers.length, airportContextAirspaces, buildEntityId]);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || viewer.isDestroyed()) return;

      const isEntity = (value: unknown): value is Entity => value instanceof Entity;
      const hasId = (value: unknown): value is { id: unknown } =>
        typeof value === 'object' && value !== null && 'id' in (value as object);
      const getEntityFromPick = (pick: unknown): Entity | null => {
        if (isEntity(pick)) return pick;
        if (hasId(pick)) {
          const candidate = (pick as { id: unknown }).id;
          if (isEntity(candidate)) return candidate;
        }
        return null;
      };

      let pickedEntity: Entity | null = getEntityFromPick(viewer.scene.pick(movement.position));
      if (pickedEntity && pickedEntity.name === '__hover_overlay__') {
        const results = viewer.scene.drillPick(movement.position) as unknown[];
        pickedEntity = null;
        for (const r of results) {
          const ent = getEntityFromPick(r);
          if (ent && ent.name !== '__hover_overlay__') {
            pickedEntity = ent;
            break;
          }
        }
      }

      if (pickedEntity) {
        const pickedId = String(pickedEntity.id);
        const allAirspaces: (AirspaceDto | SpecialUseAirspaceDto)[] = [
          ...(airspacesByClass || []),
          ...(specialUseAirspaces || []),
          ...(routeAirspaces || []),
          ...(routeSpecialUseAirspaces || []),
          ...(airportContextAirspaces || []),
        ];
        const clickedAirspace = allAirspaces.find((a) => {
          const suaId = `sua-${a.globalId}-${(a as SpecialUseAirspaceDto).typeCode}`;
          const clsId = `airspace-${a.globalId}-${(a as AirspaceDto).class}`;
          return pickedId === suaId || pickedId === clsId;
        });
        if (clickedAirspace) {
          const type = 'timesOfUse' in clickedAirspace ? 'SpecialUseAirspace' : 'Airspace';
          dispatch(setSelectedEntity({ entity: clickedAirspace, type }));
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, airspacesByClass, specialUseAirspaces, routeAirspaces, routeSpecialUseAirspaces, airportContextAirspaces, dispatch]);

  const nothingSelectedForGeneralLayers =
    selectedClasses.length === 0 && selectedTypeCodes.length === 0;

  if (isFetchingByClass || isFetchingSpecialUse) {
    return (
      <Center style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <>
      {/* Route-specific airspaces (independent toggle) */}
      {routeAirspacesVisible && routeAirspaces?.map((airspace) => (
        <PolygonEntity
          key={`route-${airspace.globalId}-${airspace.class}`}
          {...convertAirspaceToPolygonProps(airspace, false)}
        />
      ))}
      {routeAirspacesVisible && routeSpecialUseAirspaces?.map((airspace) => (
        <PolygonEntity
          key={`route-special-${airspace.globalId}-${airspace.typeCode}`}
          {...convertAirspaceToPolygonProps(airspace, true)}
        />
      ))}

      {/* Multi-airport context airspaces (filter out route duplicates) */}
      {airportIdentifiers.length > 0 &&
        airportContextAirspaces
          ?.filter((airspace) => !routeEntityIds.has(buildEntityId(airspace, false)))
          .map((airspace) => (
            <PolygonEntity
              key={`airport-context-${airspace.globalId}-${airspace.class}`}
              {...convertAirspaceToPolygonProps(airspace, false)}
            />
          ))}

      {/* General class/type layers */}
      {!nothingSelectedForGeneralLayers &&
        airspacesByClass
          ?.filter((airspace) => selectedClasses.includes(airspace.class as AirspaceClass))
          .filter(
            (airspace, index, self) =>
              index === self.findIndex((t) => t.globalId === airspace.globalId)
          )
          .filter((airspace) => !routeEntityIds.has(buildEntityId(airspace, false)))
          .filter((airspace) => !airportContextEntityIds.has(buildEntityId(airspace, false)))
          .map((airspace) => (
            <PolygonEntity
              key={`class-${airspace.globalId}-${airspace.class}`}
              {...convertAirspaceToPolygonProps(airspace, false)}
            />
          ))}
      {!nothingSelectedForGeneralLayers &&
        specialUseAirspaces
          ?.filter((airspace) =>
            selectedTypeCodes.includes(airspace.typeCode as SpecialUseAirspaceTypeCode)
          )
          .filter(
            (airspace, index, self) =>
              index === self.findIndex((t) => t.globalId === airspace.globalId)
          )
          .filter((airspace) => !routeEntityIds.has(buildEntityId(airspace, true)))
          .map((airspace) => (
            <PolygonEntity
              key={`special-${airspace.globalId}-${airspace.typeCode}`}
              {...convertAirspaceToPolygonProps(airspace, true)}
            />
          ))}
    </>
  );
};

export default AirspaceComponent;
