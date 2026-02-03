import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Color,
  Entity,
  Property,
  CorridorGraphics,
  PolygonHierarchy,
  PolygonGraphics,
  Cartesian2,
  Cartesian3,
} from 'cesium';
import { getEntityFromPick, isViewerUsable } from './cesiumHelpers';

const HOVER_OVERLAY_NAME = '__hover_overlay__';
const HIGHLIGHT_WIDTH = 300;
const HIGHLIGHT_ALPHA = 0.8;
const HIGHLIGHT_TOP_ALPHA = 0.9;
const HIGHLIGHT_CAP_ALPHA = 0.25;

interface HighlightState {
  lastHighlighted: Entity | null;
  overlays: Entity[];
}

/**
 * Hook to highlight polygons on hover by creating corridor and cap overlays.
 * Creates yellow highlight borders around polygon edges and a semi-transparent cap on top.
 */
export function usePolygonHoverHighlight() {
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
     * Create a corridor overlay for a ring of positions
     */
    const createCorridorOverlay = (
      positions: Cartesian3[],
      minHeight: number,
      maxHeight: number,
      alpha: number = HIGHLIGHT_ALPHA
    ): Entity => {
      return viewer.entities.add({
        name: HOVER_OVERLAY_NAME,
        corridor: new CorridorGraphics({
          positions: positions,
          width: HIGHLIGHT_WIDTH,
          material: Color.YELLOW.withAlpha(alpha),
          height: minHeight,
          extrudedHeight: maxHeight,
        }),
      });
    };

    /**
     * Create highlight overlays for a polygon entity
     */
    const createHighlightOverlays = (entity: Entity) => {
      if (!isViewerUsable(viewer)) return;

      const state = stateRef.current;
      const polygon = entity.polygon;
      if (!polygon) return;

      const currentTime = viewer.clock.currentTime;
      const hierarchyProp = polygon.hierarchy as Property | undefined;
      const hierarchy = hierarchyProp?.getValue(currentTime) as PolygonHierarchy | undefined;

      if (!hierarchy?.positions || hierarchy.positions.length < 2) return;

      // Get height values
      const minHeightProp = polygon.height as Property | undefined;
      const extrudedHeightProp = polygon.extrudedHeight as Property | undefined;
      const minHeight = (minHeightProp?.getValue(currentTime) as number | undefined) ?? 0;
      const maxHeight = (extrudedHeightProp?.getValue(currentTime) as number | undefined) ?? minHeight + 1;
      const topHeight = Math.max(maxHeight, minHeight + 1);

      // Outer ring - side overlay
      state.overlays.push(
        createCorridorOverlay(hierarchy.positions, minHeight, maxHeight)
      );

      // Outer ring - top outline
      state.overlays.push(
        createCorridorOverlay(hierarchy.positions, topHeight, topHeight + 1, HIGHLIGHT_TOP_ALPHA)
      );

      // Top cap fill
      const topCapOverlay = viewer.entities.add({
        name: HOVER_OVERLAY_NAME,
        polygon: new PolygonGraphics({
          hierarchy: hierarchy,
          material: Color.YELLOW.withAlpha(HIGHLIGHT_CAP_ALPHA),
          height: topHeight,
          extrudedHeight: topHeight + 0.5,
          outline: false,
          closeTop: true,
          closeBottom: true,
        }),
      });
      state.overlays.push(topCapOverlay);

      // Handle holes
      if (hierarchy.holes?.length) {
        hierarchy.holes.forEach((hole) => {
          if (hole.positions?.length >= 2 && isViewerUsable(viewer)) {
            // Hole side overlay
            state.overlays.push(
              createCorridorOverlay(hole.positions, minHeight, maxHeight)
            );

            // Hole top outline
            state.overlays.push(
              createCorridorOverlay(hole.positions, topHeight, topHeight + 1, HIGHLIGHT_TOP_ALPHA)
            );
          }
        });
      }

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
      const hasPolygon = !!entity?.polygon;

      // Clear previous highlight if hovering different entity
      if (state.lastHighlighted && state.lastHighlighted !== entity) {
        clearHighlights();
      }

      // Apply highlight to current polygon
      if (hasPolygon && entity && state.lastHighlighted !== entity) {
        createHighlightOverlays(entity);
      } else if (!hasPolygon && state.overlays.length > 0) {
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
