import { ScreenSpaceEventHandler, ScreenSpaceEventType, Entity } from 'cesium';
import React, { useEffect, useRef, useMemo } from 'react';
import { useCesium } from 'resium';
import { useDispatch, useSelector } from 'react-redux';
import ObstacleEntity from './ObstacleEntity';
import { useGetObstaclesByOasNumbersQuery } from '@/redux/api/vfr3d/obstacles.api';
import { useGetFlightQuery } from '@/redux/api/vfr3d/flights.api';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getObstacleEntityId } from '@/utility/entityIdUtils';
import { FlightDisplayMode } from '@/utility/enums';
import { useAuth0 } from '@auth0/auth0-react';
import type { RootState } from '@/redux/store';

const HOVER_OVERLAY_NAME = '__hover_overlay__';

export const RouteObstacles: React.FC = () => {
  const dispatch = useDispatch();
  const { viewer } = useCesium();
  const { user } = useAuth0();
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  const { showRouteObstacles, heightExaggeration, showObstacleLabels } = useSelector(
    (state: RootState) => state.obstacles
  );
  const { navlogPreview, displayMode, activeFlightId } = useSelector(
    (state: RootState) => state.flightPlanning
  );

  // Fetch loaded flight for VIEWING mode
  const { data: loadedFlight } = useGetFlightQuery(
    { userId: user?.sub || '', flightId: activeFlightId || '' },
    { skip: !user || !user.sub || !activeFlightId }
  );

  // Get obstacle OAS numbers from navlog preview or loaded flight
  const routeObstacleIds: string[] = useMemo(() => {
    if (navlogPreview?.obstacleOasNumbers && displayMode === FlightDisplayMode.PREVIEW) {
      return Array.from(new Set(navlogPreview.obstacleOasNumbers));
    }
    if (displayMode === FlightDisplayMode.VIEWING && loadedFlight?.obstacleOasNumbers) {
      return Array.from(new Set(loadedFlight.obstacleOasNumbers));
    }
    return [];
  }, [navlogPreview, displayMode, loadedFlight]);

  // Determine if we should show route obstacles
  const shouldShowRouteObstacles =
    showRouteObstacles &&
    (displayMode === FlightDisplayMode.PREVIEW || displayMode === FlightDisplayMode.VIEWING) &&
    routeObstacleIds.length > 0;

  // Fetch obstacles by OAS numbers
  const { data: routeObstacles, isSuccess } = useGetObstaclesByOasNumbersQuery(routeObstacleIds, {
    skip: !shouldShowRouteObstacles || routeObstacleIds.length === 0,
  });

  // Create a map for quick obstacle lookup by entity ID
  const obstacleMap = useMemo(() => {
    if (!routeObstacles) return new Map();
    return new Map(routeObstacles.map((obs) => [getObstacleEntityId(obs), obs]));
  }, [routeObstacles]);

  // Click handler for route obstacles
  useEffect(() => {
    if (!viewer || !viewer.cesiumWidget || viewer.isDestroyed() || !routeObstacles?.length) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

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
          const clickedObstacle = obstacleMap.get(entityId);
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
  }, [viewer, obstacleMap, dispatch, routeObstacles]);

  if (!isSuccess || !shouldShowRouteObstacles || !routeObstacles) return null;

  return (
    <>
      {routeObstacles.map((obstacle) => (
        <ObstacleEntity
          key={`route-${obstacle.oasNumber}`}
          obstacle={obstacle}
          heightExaggeration={heightExaggeration}
          showLabel={showObstacleLabels}
        />
      ))}
    </>
  );
};

export default RouteObstacles;
