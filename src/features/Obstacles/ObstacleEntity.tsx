import React, { memo, useMemo } from 'react';
import { Cartesian3, Color, HeightReference } from 'cesium';
import { CylinderEntity } from '@/components/Cesium';
import { mapObstacleToCartesian3, getObstacleHeightMeters } from '@/utility/cesiumUtils';
import { getObstacleEntityId } from '@/utility/entityIdUtils';
import { useAppSelector } from '@/hooks/reduxHooks';
import { ObstacleDto } from '@/redux/api/vfr3d/dtos';

interface ObstacleEntityProps {
  obstacle: ObstacleDto;
  showLabel?: boolean;
}

// Cyan color scheme for all obstacles
const OBSTACLE_COLOR = Color.CYAN.withAlpha(0.85);
const OBSTACLE_OUTLINE_COLOR = Color.DARKCYAN;
const LABEL_BG_COLOR = Color.fromCssColorString('rgba(0, 40, 40, 0.95)');
const LABEL_FILL_COLOR = Color.fromCssColorString('#00FFFF');
const LABEL_OUTLINE_COLOR = Color.BLACK;

// Depth below terrain surface to ensure cylinders visually intersect with terrain
// and don't float due to terrain LOD mismatches. The below-terrain portion is
// hidden by depthTestAgainstTerrain.
const TERRAIN_INTERSECTION_DEPTH = 30; // meters

const ObstacleEntity: React.FC<ObstacleEntityProps> = memo(({
  obstacle,
  showLabel = false,
}) => {
  const terrainEnabled = useAppSelector((state) => state.viewer.terrainEnabled);
  const position = mapObstacleToCartesian3(obstacle);
  // When terrain is on, use AGL so cylinder extends from terrain surface to correct height.
  // When terrain is off (flat ellipsoid at sea level), use MSL so the top is at the correct absolute altitude.
  // Cesium's CylinderGeometryUpdater automatically offsets by length/2 when heightReference != NONE,
  // so the cylinder bottom sits at the resolved ground position.
  const heightMeters = getObstacleHeightMeters(obstacle, terrainEnabled);

  // Calculate cylinder radius - taller obstacles get slightly wider cylinders
  const radius = Math.max(15, Math.min(80, heightMeters / 10));

  // When terrain is enabled, use RELATIVE_TO_GROUND with a negative offset so the
  // cylinder extends below the terrain surface. This prevents the cylinder from
  // appearing to float above terrain due to terrain tile LOD mismatches. The
  // below-terrain portion is hidden by depthTestAgainstTerrain. The cylinder
  // length is extended by the depth so the top remains at the correct AGL height.
  const cylinderPosition = useMemo(() => {
    if (!position || !terrainEnabled) return position;
    return Cartesian3.fromDegrees(
      obstacle.longitude!,
      obstacle.latitude!,
      -TERRAIN_INTERSECTION_DEPTH
    );
  }, [position, terrainEnabled, obstacle.longitude, obstacle.latitude]);

  const cylinderLength = terrainEnabled
    ? heightMeters + TERRAIN_INTERSECTION_DEPTH
    : heightMeters;

  const heightReference = terrainEnabled
    ? HeightReference.RELATIVE_TO_GROUND
    : HeightReference.CLAMP_TO_GROUND;

  // Generate label text with obstacle type, AGL and MSL heights
  const labelText = useMemo(() => {
    if (!showLabel) return undefined;
    const type = obstacle.obstacleType || 'OBSTACLE';
    const aglFt = obstacle.heightAgl ? Math.round(obstacle.heightAgl).toLocaleString() : '?';
    const mslFt = obstacle.heightAmsl ? Math.round(obstacle.heightAmsl).toLocaleString() : '?';
    return `${type}\n${aglFt} AGL\n${mslFt} MSL`;
  }, [showLabel, obstacle.obstacleType, obstacle.heightAgl, obstacle.heightAmsl]);

  // Skip if no valid position
  if (!cylinderPosition) return null;

  // Skip obstacles with no meaningful height
  if (heightMeters < 10) return null;

  return (
    <CylinderEntity
      position={cylinderPosition}
      length={cylinderLength}
      topRadius={radius}
      bottomRadius={radius}
      heightReference={heightReference}
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
