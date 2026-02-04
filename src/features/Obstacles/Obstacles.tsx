import { ScreenSpaceEventHandler, ScreenSpaceEventType, Entity } from 'cesium';
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useCesium } from 'resium';
import { useDispatch, useSelector } from 'react-redux';
import AirportContextObstacles from './AirportContextObstacles';
import { useGetFlightQuery } from '@/redux/api/vfr3d/flights.api';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getObstacleEntityId } from '@/utility/entityIdUtils';
import { FlightDisplayMode } from '@/utility/enums';
import { useAuth0 } from '@auth0/auth0-react';
import type { RootState } from '@/redux/store';
import { ObstacleDto } from '@/redux/api/vfr3d/dtos';

const HOVER_OVERLAY_NAME = '__hover_overlay__';

export const Obstacles: React.FC = () => {
  const {
    minHeightFilter,
    heightExaggeration,
    showObstacleLabels,
    showRouteObstacles,
    airportObstacleRadiusNm,
    obstacleAirports,
  } = useAppSelector((state) => state.obstacles);

  const { user } = useAuth0();
  const { navlogPreview, displayMode, activeFlightId } = useSelector(
    (state: RootState) => state.flightPlanning
  );
  const { viewer } = useCesium();
  const dispatch = useDispatch();

  // Store obstacles from all children for click handling
  const obstacleMapRef = useRef<Map<string, ObstacleDto>>(new Map());

  // Fetch loaded flight for VIEWING mode to get route obstacle IDs
  const { data: loadedFlight } = useGetFlightQuery(
    { userId: user?.sub || '', flightId: activeFlightId || '' },
    { skip: !user || !user.sub || !activeFlightId }
  );

  // Get route obstacle OAS numbers to exclude from airport-based rendering
  const routeObstacleOasNumbers = useMemo(() => {
    if (!showRouteObstacles) return new Set<string>();

    if (navlogPreview?.obstacleOasNumbers && displayMode === FlightDisplayMode.PREVIEW) {
      return new Set(navlogPreview.obstacleOasNumbers);
    }
    if (displayMode === FlightDisplayMode.VIEWING && loadedFlight?.obstacleOasNumbers) {
      return new Set(loadedFlight.obstacleOasNumbers);
    }
    return new Set<string>();
  }, [navlogPreview, displayMode, loadedFlight, showRouteObstacles]);

  // Callback for children to register their obstacles
  const handleObstaclesLoaded = useCallback((obstacles: ObstacleDto[]) => {
    obstacles.forEach((obs) => {
      const entityId = getObstacleEntityId(obs);
      obstacleMapRef.current.set(entityId, obs);
    });
  }, []);

  // Click handler for obstacles
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

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

    const handleClick = (movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || viewer.isDestroyed()) return;

      // Get the picked object, drilling through hover overlays if needed
      let pickedEntity: Entity | null = getEntityFromPick(viewer.scene.pick(movement.position));

      // If we picked a hover overlay, drill through to find the actual entity
      if (pickedEntity && pickedEntity.name === HOVER_OVERLAY_NAME) {
        const results = viewer.scene.drillPick(movement.position) as unknown[];
        pickedEntity = null;
        for (const r of results) {
          const ent = getEntityFromPick(r);
          if (ent && ent.name !== HOVER_OVERLAY_NAME) {
            pickedEntity = ent;
            break;
          }
        }
      }

      if (pickedEntity) {
        const entityId = String(pickedEntity.id);

        // Check if this is an obstacle entity
        if (entityId && entityId.startsWith('obstacle-')) {
          const clickedObstacle = obstacleMapRef.current.get(entityId);
          if (clickedObstacle) {
            dispatch(setSelectedEntity({ entity: clickedObstacle, type: 'Obstacle' }));
          }
        }
      }
    };

    handler.setInputAction(handleClick, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer, dispatch]);

  // Clear obstacle map when airports change
  useEffect(() => {
    obstacleMapRef.current.clear();
  }, [obstacleAirports]);

  const hasObstacleAirports = obstacleAirports.length > 0;

  if (!hasObstacleAirports) return null;

  return (
    <>
      {/* Airport context obstacles (cyan) - one component per airport */}
      {obstacleAirports.map((airport) => (
        <AirportContextObstacles
          key={airport.icaoOrIdent}
          airport={airport}
          radiusNm={airportObstacleRadiusNm}
          minHeightFilter={minHeightFilter}
          heightExaggeration={heightExaggeration}
          showLabels={showObstacleLabels}
          excludeOasNumbers={routeObstacleOasNumbers}
          onObstaclesLoaded={handleObstaclesLoaded}
        />
      ))}
    </>
  );
};

export default Obstacles;
