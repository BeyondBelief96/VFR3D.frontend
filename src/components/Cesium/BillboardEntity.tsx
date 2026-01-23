import {
  BillboardGraphics,
  Color,
  ConstantProperty,
  NearFarScalar,
  Entity,
  HeightReference,
  DistanceDisplayCondition,
  Cartesian3,
  Property,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';
import React, { useEffect, useRef } from 'react';
import { useCesium } from 'resium';

interface BillboardEntityProps {
  position: Cartesian3;
  show?: boolean | Property;
  image?: string | Property;
  scale?: number | Property;
  heightReference?: HeightReference | Property;
  color?: Color | Property;
  scaleByDistance?: NearFarScalar | Property;
  translucencyByDistance?: NearFarScalar | Property;
  distanceDisplayCondition?: DistanceDisplayCondition | Property;
  disableDepthTestDistance?: number | Property;
  id: string;
  onLeftClick?: (
    positionEvent: ScreenSpaceEventHandler.PositionedEvent,
    billboardId: string
  ) => void;
  onRightClick?: (
    positionEvent: ScreenSpaceEventHandler.PositionedEvent,
    billboardId: string
  ) => void;
}

export const BillboardEntity: React.FC<BillboardEntityProps> = ({
  position,
  show = true,
  image,
  scale = 1.0,
  heightReference = HeightReference.NONE,
  color = Color.WHITE,
  scaleByDistance,
  translucencyByDistance,
  distanceDisplayCondition,
  disableDepthTestDistance,
  id,
  onLeftClick,
  onRightClick,
}) => {
  const { viewer } = useCesium();
  const entityRef = useRef<Entity | null>(null);
  const leftClickHandler = useRef<ScreenSpaceEventHandler | null>(null);
  const rightClickHandler = useRef<ScreenSpaceEventHandler | null>(null);

  useEffect(() => {
    if (!viewer) return;

    const billboardGraphics = new BillboardGraphics({
      show: new ConstantProperty(show),
      image: new ConstantProperty(image),
      scale: new ConstantProperty(scale),
      heightReference: new ConstantProperty(heightReference),
      color: new ConstantProperty(color),
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

    const entity = viewer.entities.add({
      position,
      billboard: billboardGraphics,
      id,
    });

    entityRef.current = entity;

    if (onLeftClick) {
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      leftClickHandler.current = handler;

      handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(movement.position);

        if (pickedObject && pickedObject.id === entity) {
          onLeftClick(movement, id);
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
    }

    if (onRightClick) {
      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      rightClickHandler.current = handler;

      handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
        const pickedObject = viewer.scene.pick(movement.position);

        if (pickedObject && pickedObject.id === entity) {
          onRightClick(movement, id);
        }
      }, ScreenSpaceEventType.RIGHT_CLICK);
    }

    return () => {
      if (viewer && entity) {
        viewer.entities.remove(entity);
        entityRef.current = null;
        if (onLeftClick && leftClickHandler.current) {
          leftClickHandler.current.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
          leftClickHandler.current.destroy();
          leftClickHandler.current = null;
        }
        if (onRightClick && rightClickHandler.current) {
          rightClickHandler.current.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
          rightClickHandler.current.destroy();
          rightClickHandler.current = null;
        }
      }
    };
  }, [
    viewer,
    position,
    show,
    image,
    scale,
    heightReference,
    color,
    scaleByDistance,
    translucencyByDistance,
    distanceDisplayCondition,
    disableDepthTestDistance,
    id,
    onLeftClick,
    onRightClick,
  ]);

  return null;
};
