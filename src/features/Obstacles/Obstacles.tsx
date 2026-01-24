import { ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import React, { useEffect, useRef, useMemo } from 'react';
import { useCesium } from 'resium';
import { useDispatch } from 'react-redux';
import ObstacleEntity from './ObstacleEntity';
import { useGetObstaclesByStateQuery } from '@/redux/api/vfr3d/obstacles.api';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { getObstacleEntityId } from '@/utility/entityIdUtils';

export const Obstacles: React.FC = () => {
  const { showObstacles, selectedState, minHeightFilter } = useAppSelector(
    (state) => state.obstacles
  );

  const { data: obstacles, isSuccess } = useGetObstaclesByStateQuery(
    { stateCode: selectedState, minHeightAgl: minHeightFilter, limit: 2000 },
    {
      skip: !showObstacles || !selectedState,
    }
  );

  const { viewer } = useCesium();
  const dispatch = useDispatch();
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  // Create a map for quick obstacle lookup by entity ID
  const obstacleMap = useMemo(() => {
    if (!obstacles) return new Map();
    return new Map(obstacles.map((obs) => [getObstacleEntityId(obs), obs]));
  }, [obstacles]);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    const handleClick = (movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!viewer || viewer.isDestroyed()) return;

      const pickedObject = viewer.scene.pick(movement.position);

      if (pickedObject && pickedObject.id) {
        const entityId = pickedObject.id.id;
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
  }, [viewer, obstacleMap, dispatch]);

  if (!isSuccess || !showObstacles || !obstacles) return null;

  return (
    <>
      {obstacles.map((obstacle) => (
        <ObstacleEntity key={obstacle.oasNumber} obstacle={obstacle} />
      ))}
    </>
  );
};

export default Obstacles;
