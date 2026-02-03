import { Cartesian3, Color, Entity, PolygonGraphics, PolygonHierarchy } from 'cesium';
import React, { useEffect, useRef, useMemo } from 'react';
import { useCesium } from 'resium';

interface PolygonEntityProps {
  points: Cartesian3[];
  color?: Color;
  outlineColor?: Color;
  outlineWidth?: number;
  id: string;
  minHeight?: number;
  maxHeight?: number;
}

export const PolygonEntity: React.FC<PolygonEntityProps> = React.memo(
  ({
    points,
    color = Color.BLUE.withAlpha(0.5),
    outlineColor = Color.WHITE,
    outlineWidth = 2,
    id,
    minHeight = 0,
    maxHeight,
  }) => {
    const { viewer } = useCesium();
    const entityRef = useRef<Entity | null>(null);

    const polygonHierarchy = useMemo(() => {
      return new PolygonHierarchy(points);
    }, [points]);

    useEffect(() => {
      if (!viewer || !viewer.cesiumWidget || points.length < 3) {
        return;
      }

      const polygonGraphics = new PolygonGraphics({
        hierarchy: polygonHierarchy,
        material: color,
        outline: true,
        outlineColor: outlineColor,
        outlineWidth: outlineWidth,
        height: minHeight,
        extrudedHeight: maxHeight || minHeight + 1,
        fill: true,
        closeBottom: true,
        closeTop: true,
      });

      const entity = viewer.entities.add({
        polygon: polygonGraphics,
        id,
      });

      entityRef.current = entity;

      return () => {
        if (viewer && viewer.cesiumWidget && !viewer.isDestroyed() && entityRef.current) {
          viewer.entities.remove(entityRef.current);
          entityRef.current = null;
        }
      };
    }, [
      viewer,
      polygonHierarchy,
      color,
      outlineColor,
      outlineWidth,
      id,
      minHeight,
      maxHeight,
      points.length,
    ]);

    return null;
  }
);

PolygonEntity.displayName = 'PolygonEntity';

export default PolygonEntity;
