import {
  PointGraphics,
  Color,
  ConstantProperty,
  ConstantPositionProperty,
  NearFarScalar,
  Entity,
  HeightReference,
  DistanceDisplayCondition,
  Cartesian3,
  Property,
  LabelGraphics,
  Cartesian2,
} from 'cesium';
import React, { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import { registerPointCallbacks, unregisterPointCallbacks } from './pointEventRegistry';
import { ScreenSpaceEventHandler } from 'cesium';

interface PointEntityProps {
  position: Cartesian3;
  show?: boolean | Property;
  pixelSize?: number | Property;
  heightReference?: HeightReference | Property;
  color?: Color | Property;
  outlineColor?: Color | Property;
  outlineWidth?: number | Property;
  scaleByDistance?: NearFarScalar | Property;
  translucencyByDistance?: NearFarScalar | Property;
  distanceDisplayCondition?: DistanceDisplayCondition | Property;
  disableDepthTestDistance?: number | Property;
  id: string;
  draggable?: boolean;
  labelText?: string;
  labelColor?: Color | Property;
  labelBackgroundColor?: Color | Property;
  labelPixelOffset?: Cartesian2 | Property;
  labelScaleByDistance?: NearFarScalar | Property;
  onRightClick?: (positionEvent: ScreenSpaceEventHandler.PositionedEvent, pointId: string) => void;
  onLeftClick?: (positionEvent: ScreenSpaceEventHandler.PositionedEvent, pointId: string) => void;
  onDragStart?: (pointId: string) => void;
  onDrag?: (pointId: string, dragPosition: Cartesian3) => void;
  onDragEnd?: (pointId: string, draggedPosition: Cartesian3, didDrag?: boolean) => void;
}

export const PointEntity: React.FC<PointEntityProps> = ({
  position,
  show = true,
  pixelSize = 10,
  heightReference = HeightReference.NONE,
  color = Color.WHITE,
  outlineColor = Color.BLACK,
  outlineWidth = 0,
  scaleByDistance,
  translucencyByDistance,
  distanceDisplayCondition,
  disableDepthTestDistance,
  id,
  draggable,
  labelText,
  labelColor = Color.WHITE,
  labelBackgroundColor,
  labelPixelOffset = new Cartesian2(0, -20),
  labelScaleByDistance = new NearFarScalar(1000000, 0.5, 5000000, 0.3),
  onRightClick,
  onLeftClick,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const { viewer } = useCesium();
  const entityRef = useRef<Entity | null>(null);

  useEffect(() => {
    if (!viewer) return;

    const pointGraphics = new PointGraphics({
      show: new ConstantProperty(show),
      pixelSize: new ConstantProperty(pixelSize),
      heightReference: new ConstantProperty(heightReference),
      color: new ConstantProperty(color),
      outlineColor: new ConstantProperty(outlineColor),
      outlineWidth: new ConstantProperty(outlineWidth),
      scaleByDistance:
        scaleByDistance instanceof NearFarScalar
          ? scaleByDistance
          : new ConstantProperty(scaleByDistance),
      translucencyByDistance:
        translucencyByDistance instanceof NearFarScalar
          ? translucencyByDistance
          : new ConstantProperty(translucencyByDistance),
      distanceDisplayCondition:
        distanceDisplayCondition instanceof DistanceDisplayCondition
          ? distanceDisplayCondition
          : new ConstantProperty(distanceDisplayCondition),
      disableDepthTestDistance: new ConstantProperty(disableDepthTestDistance),
    });

    const labelGraphics = labelText
      ? new LabelGraphics({
          text: labelText,
          scaleByDistance: labelScaleByDistance,
          fillColor: labelColor,
          pixelOffset: labelPixelOffset,
          backgroundColor: labelBackgroundColor || color,
          showBackground: !!labelBackgroundColor,
        })
      : undefined;

    const entity = viewer.entities.add({
      position,
      point: pointGraphics,
      id,
      label: labelGraphics,
    });

    entityRef.current = entity;

    // Register callbacks in global registry; handled centrally to avoid per-entity pick cost
    registerPointCallbacks(id, { draggable, onLeftClick, onRightClick, onDragStart, onDrag, onDragEnd });

    return () => {
      if (viewer && entity) {
        viewer.entities.remove(entity);
        entityRef.current = null;
        unregisterPointCallbacks(id);
      }
    };
  }, [viewer]);

  // Keep registry callbacks updated if props change
  useEffect(() => {
    registerPointCallbacks(id, { draggable, onLeftClick, onRightClick, onDragStart, onDrag, onDragEnd });
  }, [id, draggable, onLeftClick, onRightClick, onDragStart, onDrag, onDragEnd]);

  // Update dynamic properties without recreating entity
  useEffect(() => {
    if (!viewer || !entityRef.current) return;
    entityRef.current.position = new ConstantPositionProperty(position);
    if (entityRef.current.point) {
      entityRef.current.point.show = new ConstantProperty(show);
      entityRef.current.point.pixelSize = new ConstantProperty(pixelSize);
      entityRef.current.point.heightReference = new ConstantProperty(heightReference);
      entityRef.current.point.color = new ConstantProperty(color as Color);
      entityRef.current.point.outlineColor = new ConstantProperty(outlineColor as Color);
      entityRef.current.point.outlineWidth = new ConstantProperty(outlineWidth as number);
      if (scaleByDistance !== undefined) {
        entityRef.current.point.scaleByDistance = new ConstantProperty(scaleByDistance);
      }
      if (translucencyByDistance !== undefined) {
        entityRef.current.point.translucencyByDistance = new ConstantProperty(
          translucencyByDistance
        );
      }
      if (distanceDisplayCondition !== undefined) {
        entityRef.current.point.distanceDisplayCondition = new ConstantProperty(
          distanceDisplayCondition
        );
      }
      entityRef.current.point.disableDepthTestDistance = new ConstantProperty(
        disableDepthTestDistance
      );
    }
    if (entityRef.current.label) {
      entityRef.current.label.text = new ConstantProperty(labelText);
      entityRef.current.label.fillColor = new ConstantProperty(labelColor as Color);
      entityRef.current.label.pixelOffset = new ConstantProperty(labelPixelOffset);
      entityRef.current.label.backgroundColor = new ConstantProperty(
        (labelBackgroundColor || (color as Color)) as Color
      );
      entityRef.current.label.scaleByDistance = new ConstantProperty(labelScaleByDistance);
      (entityRef.current.label as unknown as { showBackground?: boolean }).showBackground = !!labelBackgroundColor;
    }
  }, [
    viewer,
    position,
    show,
    pixelSize,
    heightReference,
    color,
    outlineColor,
    outlineWidth,
    scaleByDistance,
    translucencyByDistance,
    distanceDisplayCondition,
    disableDepthTestDistance,
    labelText,
    labelColor,
    labelBackgroundColor,
    labelPixelOffset,
    labelScaleByDistance,
  ]);

  return null;
};
