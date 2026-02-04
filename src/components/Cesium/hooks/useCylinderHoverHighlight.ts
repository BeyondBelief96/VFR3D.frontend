import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Color,
  Entity,
  Property,
  CylinderGraphics,
  Cartesian2,
  Cartesian3,
  HeightReference,
} from 'cesium';
import { getEntityFromPick, isViewerUsable } from './cesiumHelpers';

const HOVER_OVERLAY_NAME = '__hover_overlay__';
const HIGHLIGHT_ALPHA = 0.6;
const RING_WIDTH_FACTOR = 1.3; // How much larger the ring is compared to the cylinder

interface HighlightState {
  lastHighlighted: Entity | null;
  overlays: Entity[];
}

/**
 * Hook to highlight cylinder entities (obstacles) on hover by creating ring overlays.
 * Creates a yellow ring around the cylinder when hovered.
 */
export function useCylinderHoverHighlight() {
  const { viewer } = useCesium();
  const stateRef = useRef<HighlightState>({
    lastHighlighted: null,
    overlays: [],
  });

  useEffect(() => {
    if (!isViewerUsable(viewer)) return;

    const canvas = viewer.scene.canvas;
    const handler = new ScreenSpaceEventHandler(canvas);

    /**
     * Drill through picks to find a non-overlay entity
     */
    const drillForNonOverlay = (position: Cartesian2): Entity | null => {
      if (!isViewerUsable(viewer)) return null;
      const picks = viewer.scene.drillPick(position) as unknown[];
      for (const p of picks) {
        const ent = getEntityFromPick(p);
        if (ent && ent.name !== HOVER_OVERLAY_NAME) return ent;
      }
      return null;
    };

    /**
     * Remove all highlight overlays and reset state
     */
    const clearHighlights = () => {
      const state = stateRef.current;
      if (state.overlays.length > 0 && isViewerUsable(viewer)) {
        state.overlays.forEach((e) => viewer.entities.remove(e));
      }
      state.overlays = [];
      state.lastHighlighted = null;
    };

    /**
     * Create highlight overlays for a cylinder entity
     */
    const createHighlightOverlays = (entity: Entity) => {
      if (!isViewerUsable(viewer)) return;

      const state = stateRef.current;
      const cylinder = entity.cylinder;
      if (!cylinder) return;

      const currentTime = viewer.clock.currentTime;

      // Get cylinder properties
      const positionProp = entity.position as Property | undefined;
      const position = positionProp?.getValue(currentTime) as Cartesian3 | undefined;
      if (!position) return;

      const lengthProp = cylinder.length as Property | undefined;
      const topRadiusProp = cylinder.topRadius as Property | undefined;
      const bottomRadiusProp = cylinder.bottomRadius as Property | undefined;

      const length = (lengthProp?.getValue(currentTime) as number | undefined) ?? 100;
      const topRadius = (topRadiusProp?.getValue(currentTime) as number | undefined) ?? 20;
      const bottomRadius = (bottomRadiusProp?.getValue(currentTime) as number | undefined) ?? topRadius;
      const radius = Math.max(topRadius, bottomRadius);

      // Create outer ring overlay - a larger cylinder with transparent fill
      const ringOverlay = viewer.entities.add({
        name: HOVER_OVERLAY_NAME,
        position: position,
        cylinder: new CylinderGraphics({
          length: length + 2, // Slightly taller to be visible
          topRadius: radius * RING_WIDTH_FACTOR,
          bottomRadius: radius * RING_WIDTH_FACTOR,
          material: Color.YELLOW.withAlpha(HIGHLIGHT_ALPHA),
          outline: true,
          outlineColor: Color.YELLOW,
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
      state.overlays.push(ringOverlay);

      // Create a glowing top cap
      const topCapOverlay = viewer.entities.add({
        name: HOVER_OVERLAY_NAME,
        position: position,
        cylinder: new CylinderGraphics({
          length: 5, // Thin disc at top
          topRadius: radius * RING_WIDTH_FACTOR,
          bottomRadius: radius * RING_WIDTH_FACTOR,
          material: Color.YELLOW.withAlpha(0.3),
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
      state.overlays.push(topCapOverlay);

      state.lastHighlighted = entity;
    };

    // Mouse move handler for hover detection
    handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      if (!isViewerUsable(viewer)) return;

      const state = stateRef.current;
      const pickedRaw: unknown = viewer.scene.pick(movement.endPosition);
      const firstEntity = getEntityFromPick(pickedRaw);

      // Skip overlay entities and drill to find actual entity
      const pickedEntity =
        firstEntity?.name === HOVER_OVERLAY_NAME
          ? drillForNonOverlay(movement.endPosition)
          : firstEntity;

      const entity = pickedEntity;
      const hasCylinder = !!entity?.cylinder;

      // Clear previous highlight if hovering different entity
      if (state.lastHighlighted && state.lastHighlighted !== entity) {
        clearHighlights();
      }

      // Apply highlight to current cylinder
      if (hasCylinder && entity && state.lastHighlighted !== entity) {
        createHighlightOverlays(entity);
      } else if (!hasCylinder && state.overlays.length > 0) {
        clearHighlights();
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      clearHighlights();
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer]);
}
