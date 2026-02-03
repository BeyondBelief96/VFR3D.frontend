import React, { memo, useMemo } from 'react';
import { Color, HeightReference } from 'cesium';
import { CylinderEntity } from '@/components/Cesium';
import { mapObstacleToCartesian3, getObstacleHeightMeters } from '@/utility/cesiumUtils';
import { getObstacleEntityId } from '@/utility/entityIdUtils';
import { ObstacleDto } from '@/redux/api/vfr3d/dtos';

interface ObstacleEntityProps {
  obstacle: ObstacleDto;
  isRouteObstacle?: boolean;
  heightExaggeration?: number;
  showLabel?: boolean;
}

const ObstacleEntity: React.FC<ObstacleEntityProps> = memo(({
  obstacle,
  isRouteObstacle = false,
  heightExaggeration = 1,
  showLabel = false,
}) => {
  const position = mapObstacleToCartesian3(obstacle);
  const heightMeters = getObstacleHeightMeters(obstacle, true);

  // Apply height exaggeration with a minimum visual height
  const exaggeratedHeight = Math.max(heightMeters * heightExaggeration, 100);

  // Calculate cylinder radius based on exaggerated height - taller obstacles get slightly wider cylinders
  const radius = Math.max(15, Math.min(80, exaggeratedHeight / 10));

  // Colors for route obstacles (orange) vs state obstacles (red)
  const {
    color,
    outlineColor,
    labelBgColor,
    labelFillColor,
    labelOutlineColor,
  } = useMemo(() => {
    if (isRouteObstacle) {
      return {
        color: Color.ORANGE.withAlpha(0.85),
        outlineColor: Color.DARKORANGE,
        // Label colors for route obstacles - orange/amber theme
        labelBgColor: Color.fromCssColorString('rgba(40, 25, 0, 0.95)'),
        labelFillColor: Color.fromCssColorString('#FFA500'), // Orange text
        labelOutlineColor: Color.BLACK,
      };
    }
    return {
      color: Color.RED.withAlpha(0.85),
      outlineColor: Color.DARKRED,
      // Label colors for state obstacles - red theme
      labelBgColor: Color.fromCssColorString('rgba(40, 0, 0, 0.95)'),
      labelFillColor: Color.fromCssColorString('#FF6666'), // Light red text
      labelOutlineColor: Color.BLACK,
    };
  }, [isRouteObstacle]);

  // Generate label text with obstacle type, AGL and MSL heights
  const labelText = useMemo(() => {
    if (!showLabel) return undefined;
    const type = obstacle.obstacleType || 'OBSTACLE';
    const aglFt = obstacle.heightAgl ? Math.round(obstacle.heightAgl).toLocaleString() : '?';
    const mslFt = obstacle.heightAmsl ? Math.round(obstacle.heightAmsl).toLocaleString() : '?';
    return `${type}\n${aglFt} AGL\n${mslFt} MSL`;
  }, [showLabel, obstacle.obstacleType, obstacle.heightAgl, obstacle.heightAmsl]);

  // Skip if no valid position
  if (!position) return null;

  // Skip obstacles with no meaningful height
  if (heightMeters < 10) return null;

  return (
    <CylinderEntity
      position={position}
      length={exaggeratedHeight}
      topRadius={radius}
      bottomRadius={radius}
      heightReference={HeightReference.CLAMP_TO_GROUND}
      color={color}
      outlineColor={outlineColor}
      outlineWidth={1}
      outline={true}
      fill={true}
      id={getObstacleEntityId(obstacle)}
      labelText={labelText}
      showLabel={showLabel}
      labelBackgroundColor={labelBgColor}
      labelFillColor={labelFillColor}
      labelOutlineColor={labelOutlineColor}
    />
  );
});

ObstacleEntity.displayName = 'ObstacleEntity';

export default ObstacleEntity;
