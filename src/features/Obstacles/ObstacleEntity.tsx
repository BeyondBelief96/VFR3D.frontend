import React, { memo } from 'react';
import { Color, HeightReference } from 'cesium';
import { CylinderEntity } from '@/components/Cesium';
import { mapObstacleToCartesian3, getObstacleHeightMeters } from '@/utility/cesiumUtils';
import { getObstacleEntityId } from '@/utility/entityIdUtils';
import { ObstacleDto, ObstacleLighting } from '@/redux/api/vfr3d/dtos';

interface ObstacleEntityProps {
  obstacle: ObstacleDto;
}

const ObstacleEntity: React.FC<ObstacleEntityProps> = memo(({ obstacle }) => {
  const position = mapObstacleToCartesian3(obstacle);

  if (!position) return null;

  const heightMeters = getObstacleHeightMeters(obstacle, true);

  // Skip obstacles with no meaningful height
  if (heightMeters < 3) return null;

  // Determine if the obstacle is lit (has any type of lighting)
  const isLit =
    obstacle.lighting !== undefined &&
    obstacle.lighting !== ObstacleLighting.None &&
    obstacle.lighting !== ObstacleLighting.Unknown;

  // Calculate cylinder radius based on height - taller obstacles get slightly wider cylinders
  const radius = Math.max(15, Math.min(50, heightMeters / 10));

  // Use striped pattern for lit obstacles, solid red for unlit
  const color = isLit
    ? Color.RED.withAlpha(0.85)
    : Color.RED.withAlpha(0.7);

  return (
    <CylinderEntity
      position={position}
      length={heightMeters}
      topRadius={radius}
      bottomRadius={radius}
      heightReference={HeightReference.CLAMP_TO_GROUND}
      color={color}
      outlineColor={Color.DARKRED}
      outlineWidth={1}
      outline={true}
      fill={true}
      striped={isLit}
      id={getObstacleEntityId(obstacle)}
    />
  );
});

ObstacleEntity.displayName = 'ObstacleEntity';

export default ObstacleEntity;
