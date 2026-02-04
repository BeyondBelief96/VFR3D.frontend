import React, { memo, useMemo } from 'react';
import { Color, HeightReference } from 'cesium';
import { CylinderEntity } from '@/components/Cesium';
import { mapObstacleToCartesian3, getObstacleHeightMeters } from '@/utility/cesiumUtils';
import { getObstacleEntityId } from '@/utility/entityIdUtils';
import { ObstacleDto } from '@/redux/api/vfr3d/dtos';

interface ObstacleEntityProps {
  obstacle: ObstacleDto;
  heightExaggeration?: number;
  showLabel?: boolean;
}

// Cyan color scheme for all obstacles
const OBSTACLE_COLOR = Color.CYAN.withAlpha(0.85);
const OBSTACLE_OUTLINE_COLOR = Color.DARKCYAN;
const LABEL_BG_COLOR = Color.fromCssColorString('rgba(0, 40, 40, 0.95)');
const LABEL_FILL_COLOR = Color.fromCssColorString('#00FFFF');
const LABEL_OUTLINE_COLOR = Color.BLACK;

const ObstacleEntity: React.FC<ObstacleEntityProps> = memo(({
  obstacle,
  heightExaggeration = 1,
  showLabel = false,
}) => {
  const position = mapObstacleToCartesian3(obstacle);
  const heightMeters = getObstacleHeightMeters(obstacle, true);

  // Apply height exaggeration with a minimum visual height
  const exaggeratedHeight = Math.max(heightMeters * heightExaggeration, 100);

  // Calculate cylinder radius based on exaggerated height - taller obstacles get slightly wider cylinders
  const radius = Math.max(15, Math.min(80, exaggeratedHeight / 10));

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
      color={OBSTACLE_COLOR}
      outlineColor={OBSTACLE_OUTLINE_COLOR}
      outlineWidth={1}
      outline={true}
      fill={true}
      id={getObstacleEntityId(obstacle)}
      labelText={labelText}
      showLabel={showLabel}
      labelBackgroundColor={LABEL_BG_COLOR}
      labelFillColor={LABEL_FILL_COLOR}
      labelOutlineColor={LABEL_OUTLINE_COLOR}
    />
  );
});

ObstacleEntity.displayName = 'ObstacleEntity';

export default ObstacleEntity;
