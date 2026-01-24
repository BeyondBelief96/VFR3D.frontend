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
  LabelGraphics,
  Cartesian2,
  VerticalOrigin,
  HorizontalOrigin,
  LabelStyle,
  NearFarScalar,
  Cartographic,
  Ellipsoid,
} from 'cesium';
import React, { useEffect, useRef, useMemo } from 'react';
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
  stripedEvenColor?: Color; // Color for even stripes (default: RED)
  stripedOddColor?: Color; // Color for odd stripes (default: WHITE)
  id: string;
  // Label properties
  labelText?: string;
  labelBackgroundColor?: Color;
  labelFillColor?: Color;
  labelOutlineColor?: Color;
  labelFont?: string;
  showLabel?: boolean;
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
  stripedEvenColor = Color.RED.withAlpha(0.9),
  stripedOddColor = Color.WHITE.withAlpha(0.9),
  id,
  labelText,
  labelBackgroundColor,
  labelFillColor,
  labelOutlineColor,
  labelFont = 'bold 14px monospace',
  showLabel = true,
}) => {
  const { viewer } = useCesium();
  const cylinderEntityRef = useRef<Entity | null>(null);
  const labelEntityRef = useRef<Entity | null>(null);

  // Calculate the label position at the top of the cylinder
  const labelPosition = useMemo(() => {
    const cartographic = Cartographic.fromCartesian(position, Ellipsoid.WGS84);
    // Add the cylinder length to the height to position label at top
    return Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      cartographic.height + length
    );
  }, [position, length]);

  // Create cylinder entity
  useEffect(() => {
    if (!viewer) return;

    // Create material - either striped or solid color
    const material = striped
      ? new StripeMaterialProperty({
          evenColor: stripedEvenColor,
          oddColor: stripedOddColor,
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

    cylinderEntityRef.current = entity;

    return () => {
      if (viewer && entity) {
        viewer.entities.remove(entity);
        cylinderEntityRef.current = null;
      }
    };
  }, [viewer, id]);

  // Create separate label entity at the top of the cylinder
  useEffect(() => {
    if (!viewer || !labelText || !showLabel) return;

    const defaultBgColor = Color.fromCssColorString('rgba(20, 20, 20, 0.95)');
    const defaultFillColor = Color.fromCssColorString('#FFFF00');
    const defaultOutlineColor = Color.BLACK;

    const labelGraphics = new LabelGraphics({
      text: new ConstantProperty(labelText),
      font: new ConstantProperty(labelFont),
      fillColor: new ConstantProperty(labelFillColor || defaultFillColor),
      outlineColor: new ConstantProperty(labelOutlineColor || defaultOutlineColor),
      outlineWidth: new ConstantProperty(3),
      style: new ConstantProperty(LabelStyle.FILL_AND_OUTLINE),
      verticalOrigin: new ConstantProperty(VerticalOrigin.BOTTOM),
      horizontalOrigin: new ConstantProperty(HorizontalOrigin.CENTER),
      pixelOffset: new ConstantProperty(new Cartesian2(0, -10)),
      showBackground: new ConstantProperty(true),
      backgroundColor: new ConstantProperty(labelBackgroundColor || defaultBgColor),
      backgroundPadding: new ConstantProperty(new Cartesian2(8, 6)),
      scaleByDistance: new ConstantProperty(new NearFarScalar(500, 0.7, 30000, 0.8)),
      disableDepthTestDistance: new ConstantProperty(Number.POSITIVE_INFINITY),
    });

    const labelEntity = viewer.entities.add({
      position: labelPosition,
      label: labelGraphics,
      id: `${id}-label`,
    });

    labelEntityRef.current = labelEntity;

    return () => {
      if (viewer && labelEntity) {
        viewer.entities.remove(labelEntity);
        labelEntityRef.current = null;
      }
    };
  }, [viewer, id, labelText, showLabel, labelPosition, labelBackgroundColor, labelFillColor, labelOutlineColor, labelFont]);

  // Update cylinder dynamic properties
  useEffect(() => {
    if (!viewer || !cylinderEntityRef.current) return;
    cylinderEntityRef.current.position = new ConstantPositionProperty(position);
    if (cylinderEntityRef.current.cylinder) {
      cylinderEntityRef.current.cylinder.show = new ConstantProperty(show);
      cylinderEntityRef.current.cylinder.length = new ConstantProperty(length);
      cylinderEntityRef.current.cylinder.topRadius = new ConstantProperty(topRadius);
      cylinderEntityRef.current.cylinder.bottomRadius = new ConstantProperty(bottomRadius);
      cylinderEntityRef.current.cylinder.heightReference = new ConstantProperty(heightReference);
      cylinderEntityRef.current.cylinder.outline = new ConstantProperty(outline);
      cylinderEntityRef.current.cylinder.outlineColor = new ConstantProperty(outlineColor as Color);
      cylinderEntityRef.current.cylinder.outlineWidth = new ConstantProperty(outlineWidth as number);
      cylinderEntityRef.current.cylinder.fill = new ConstantProperty(fill);
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

  // Update label position when length changes
  useEffect(() => {
    if (!viewer || !labelEntityRef.current) return;
    labelEntityRef.current.position = new ConstantPositionProperty(labelPosition);
  }, [viewer, labelPosition]);

  return null;
};
