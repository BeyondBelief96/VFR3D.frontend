import {
  CylinderGraphics,
  Color,
  ConstantProperty,
  ConstantPositionProperty,
  Entity,
  HeightReference,
  Cartesian3,
  Property,
  ColorMaterialProperty,
  StripeMaterialProperty,
  StripeOrientation,
} from 'cesium';
import React, { useEffect, useRef } from 'react';
import { useCesium } from 'resium';

interface CylinderEntityProps {
  position: Cartesian3;
  show?: boolean | Property;
  length: number; // Height of the cylinder in meters
  topRadius?: number | Property;
  bottomRadius?: number | Property;
  heightReference?: HeightReference | Property;
  color?: Color;
  outlineColor?: Color | Property;
  outlineWidth?: number | Property;
  outline?: boolean | Property;
  fill?: boolean | Property;
  striped?: boolean; // If true, use red/white striped material
  id: string;
}

export const CylinderEntity: React.FC<CylinderEntityProps> = ({
  position,
  show = true,
  length,
  topRadius = 30,
  bottomRadius = 30,
  heightReference = HeightReference.CLAMP_TO_GROUND,
  color = Color.RED.withAlpha(0.8),
  outlineColor = Color.RED,
  outlineWidth = 1,
  outline = true,
  fill = true,
  striped = false,
  id,
}) => {
  const { viewer } = useCesium();
  const entityRef = useRef<Entity | null>(null);

  useEffect(() => {
    if (!viewer) return;

    // Create material - either striped or solid color
    const material = striped
      ? new StripeMaterialProperty({
          evenColor: Color.RED.withAlpha(0.9),
          oddColor: Color.WHITE.withAlpha(0.9),
          repeat: Math.max(2, Math.floor(length / 30)), // More stripes for taller obstacles
          orientation: StripeOrientation.HORIZONTAL,
        })
      : new ColorMaterialProperty(color);

    const cylinderGraphics = new CylinderGraphics({
      show: new ConstantProperty(show),
      length: new ConstantProperty(length),
      topRadius: new ConstantProperty(topRadius),
      bottomRadius: new ConstantProperty(bottomRadius),
      heightReference: new ConstantProperty(heightReference),
      material: material,
      outline: new ConstantProperty(outline),
      outlineColor: new ConstantProperty(outlineColor),
      outlineWidth: new ConstantProperty(outlineWidth),
      fill: new ConstantProperty(fill),
    });

    const entity = viewer.entities.add({
      position,
      cylinder: cylinderGraphics,
      id,
    });

    entityRef.current = entity;

    return () => {
      if (viewer && entity) {
        viewer.entities.remove(entity);
        entityRef.current = null;
      }
    };
  }, [viewer, id]);

  // Update dynamic properties without recreating entity
  useEffect(() => {
    if (!viewer || !entityRef.current) return;
    entityRef.current.position = new ConstantPositionProperty(position);
    if (entityRef.current.cylinder) {
      entityRef.current.cylinder.show = new ConstantProperty(show);
      entityRef.current.cylinder.length = new ConstantProperty(length);
      entityRef.current.cylinder.topRadius = new ConstantProperty(topRadius);
      entityRef.current.cylinder.bottomRadius = new ConstantProperty(bottomRadius);
      entityRef.current.cylinder.heightReference = new ConstantProperty(heightReference);
      entityRef.current.cylinder.outline = new ConstantProperty(outline);
      entityRef.current.cylinder.outlineColor = new ConstantProperty(outlineColor as Color);
      entityRef.current.cylinder.outlineWidth = new ConstantProperty(outlineWidth as number);
      entityRef.current.cylinder.fill = new ConstantProperty(fill);
    }
  }, [
    viewer,
    position,
    show,
    length,
    topRadius,
    bottomRadius,
    heightReference,
    outline,
    outlineColor,
    outlineWidth,
    fill,
  ]);

  return null;
};
