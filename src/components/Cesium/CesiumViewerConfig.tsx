import { useEffect } from 'react';
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
import { useDisableDoubleClickZoom } from '@/hooks/useDisableDoubleClickZoom';
import { getPointCallbacks, setSharedScreenHandler } from './pointEventRegistry';

const HOVER_OVERLAY_NAME = '__hover_overlay__';

/**
 * CesiumViewerConfig component handles viewer-level configuration including:
 * - Disabling double-click zoom
 * - Polygon hover highlighting
 * - Point entity click/drag interactions
 */
export function CesiumViewerConfig() {
  useDisableDoubleClickZoom();
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;

    const canvas = viewer.scene.canvas;
    const handler = new ScreenSpaceEventHandler(canvas);
    setSharedScreenHandler(handler);

    let lastHighlighted: Entity | null = null;
    let highlightOverlays: Entity[] = [];

    // Point click/drag state
    let isMouseDown = false;
    let hasDragged = false;
    let downPos: Cartesian2 | null = null;
    let activePointId: string | null = null;
    const dragThresholdPx = 4;

    // Helper type guards
    const isEntity = (value: unknown): value is Entity => value instanceof Entity;
    const hasId = (value: unknown): value is { id: unknown } =>
      typeof value === 'object' && value !== null && 'id' in (value as object);

    // Mouse move handler - handles both hover highlighting and drag
    handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      const getEntityFromPick = (pick: unknown): Entity | null => {
        if (isEntity(pick)) return pick;
        if (hasId(pick)) {
          const candidate = (pick as { id: unknown }).id;
          if (isEntity(candidate)) return candidate;
        }
        return null;
      };

      const drillForNonOverlay = (position: Cartesian2): Entity | null => {
        const picks = viewer.scene.drillPick(position) as unknown[];
        for (const p of picks) {
          const ent = getEntityFromPick(p);
          if (ent && ent.name !== HOVER_OVERLAY_NAME) return ent;
        }
        return null;
      };

      const pickedRaw: unknown = viewer.scene.pick(movement.endPosition);
      const firstEntity = getEntityFromPick(pickedRaw);
      const pickedEntity =
        firstEntity && firstEntity.name === HOVER_OVERLAY_NAME
          ? drillForNonOverlay(movement.endPosition)
          : firstEntity;

      // Update cursor for polygons or registered point entities
      const idCandidate =
        hasId(pickedRaw) && isEntity((pickedRaw as { id: unknown }).id)
          ? ((pickedRaw as { id: Entity }).id.id as string)
          : undefined;
      const hasPointCb = getPointCallbacks(idCandidate) !== undefined;
      canvas.style.cursor = pickedEntity || hasPointCb ? 'pointer' : 'default';

      const entity: Entity | null = pickedEntity;
      const polygon = entity?.polygon;

      // Clear previous highlight if hovering different entity
      if (lastHighlighted && lastHighlighted !== entity) {
        highlightOverlays.forEach((e) => viewer.entities.remove(e));
        highlightOverlays = [];
        lastHighlighted = null;
      }

      // Apply highlight to current polygon
      if (polygon && entity) {
        if (lastHighlighted !== entity) {
          lastHighlighted = entity;

          const currentTime = viewer.clock.currentTime;
          const hierarchyProp = polygon.hierarchy as Property | undefined;
          const hierarchy = hierarchyProp
            ? (hierarchyProp.getValue(currentTime) as PolygonHierarchy | undefined)
            : undefined;

          if (hierarchy && hierarchy.positions && hierarchy.positions.length >= 2) {
            const minHeightProp = polygon.height as Property | undefined;
            const extrudedHeightProp = polygon.extrudedHeight as Property | undefined;
            const minHeight = (minHeightProp?.getValue(currentTime) as number | undefined) ?? 0;
            const maxHeight =
              (extrudedHeightProp?.getValue(currentTime) as number | undefined) ?? minHeight + 1;
            const topHeight = Math.max(maxHeight, minHeight + 1);

            // Outer ring overlay
            const outerOverlay = viewer.entities.add({
              name: HOVER_OVERLAY_NAME,
              corridor: new CorridorGraphics({
                positions: hierarchy.positions,
                width: 300,
                material: Color.YELLOW.withAlpha(0.8),
                height: minHeight,
                extrudedHeight: maxHeight,
              }),
            });
            highlightOverlays.push(outerOverlay);

            // Top outline overlay
            const outerTopOverlay = viewer.entities.add({
              name: HOVER_OVERLAY_NAME,
              corridor: new CorridorGraphics({
                positions: hierarchy.positions,
                width: 300,
                material: Color.YELLOW.withAlpha(0.9),
                height: topHeight,
                extrudedHeight: topHeight + 1,
              }),
            });
            highlightOverlays.push(outerTopOverlay);

            // Top cap fill overlay
            const topCapOverlay = viewer.entities.add({
              name: HOVER_OVERLAY_NAME,
              polygon: new PolygonGraphics({
                hierarchy: hierarchy,
                material: Color.YELLOW.withAlpha(0.25),
                height: topHeight,
                extrudedHeight: topHeight + 0.5,
                outline: false,
                closeTop: true,
                closeBottom: true,
              }),
            });
            highlightOverlays.push(topCapOverlay);

            // Handle holes in the polygon
            if (hierarchy.holes && hierarchy.holes.length > 0) {
              hierarchy.holes.forEach((hole) => {
                if (hole.positions && hole.positions.length >= 2) {
                  const holeOverlay = viewer.entities.add({
                    name: HOVER_OVERLAY_NAME,
                    corridor: new CorridorGraphics({
                      positions: hole.positions,
                      width: 300,
                      material: Color.YELLOW.withAlpha(0.8),
                      height: minHeight,
                      extrudedHeight: maxHeight,
                    }),
                  });
                  highlightOverlays.push(holeOverlay);

                  const holeTopOverlay = viewer.entities.add({
                    name: HOVER_OVERLAY_NAME,
                    corridor: new CorridorGraphics({
                      positions: hole.positions,
                      width: 300,
                      material: Color.YELLOW.withAlpha(0.9),
                      height: topHeight,
                      extrudedHeight: topHeight + 1,
                    }),
                  });
                  highlightOverlays.push(holeTopOverlay);
                }
              });
            }
          }
        }
      } else if (!polygon && highlightOverlays.length > 0) {
        // Clear overlays when not hovering a polygon
        highlightOverlays.forEach((e) => viewer.entities.remove(e));
        highlightOverlays = [];
        lastHighlighted = null;
      }

      // Handle point dragging
      if (!isMouseDown || !activePointId) return;
      const dx = movement.endPosition.x - (downPos?.x ?? movement.endPosition.x);
      const dy = movement.endPosition.y - (downPos?.y ?? movement.endPosition.y);
      if (Math.sqrt(dx * dx + dy * dy) > dragThresholdPx) {
        hasDragged = true;
        viewer.scene.screenSpaceCameraController.enableRotate = false;
        viewer.scene.screenSpaceCameraController.enableTranslate = false;
        viewer.scene.screenSpaceCameraController.enableZoom = false;
        viewer.scene.screenSpaceCameraController.enableTilt = false;
        viewer.scene.screenSpaceCameraController.enableLook = false;
      }
      const callbacks = getPointCallbacks(activePointId);
      if (callbacks && callbacks.draggable && callbacks.onDrag) {
        const ellipsoid = viewer.scene.globe.ellipsoid;
        const cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          ellipsoid
        ) as Cartesian3 | null;
        if (cartesian) callbacks.onDrag(activePointId, cartesian);
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // Mouse down handler
    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedUnknown: unknown = viewer.scene.pick(movement.position);
      const id =
        hasId(pickedUnknown) && isEntity((pickedUnknown as { id: unknown }).id)
          ? ((pickedUnknown as { id: Entity }).id.id as string)
          : undefined;
      const callbacks = getPointCallbacks(id);
      if (callbacks) {
        isMouseDown = true;
        hasDragged = false;
        downPos = movement.position as Cartesian2;
        activePointId = id ?? null;
        if (callbacks.draggable && callbacks.onDragStart && activePointId) {
          callbacks.onDragStart(activePointId);
        }
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    // Mouse up handler
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      viewer.scene.screenSpaceCameraController.enableRotate = true;
      viewer.scene.screenSpaceCameraController.enableTranslate = true;
      viewer.scene.screenSpaceCameraController.enableZoom = true;
      viewer.scene.screenSpaceCameraController.enableTilt = true;
      viewer.scene.screenSpaceCameraController.enableLook = true;

      if (!activePointId) return;
      const callbacks = getPointCallbacks(activePointId);
      const ellipsoid = viewer.scene.globe.ellipsoid;
      const cartesian = viewer.camera.pickEllipsoid(
        event.position,
        ellipsoid
      ) as Cartesian3 | null;
      if (callbacks) {
        if (hasDragged && callbacks.onDragEnd && cartesian) {
          callbacks.onDragEnd(activePointId, cartesian, true);
        } else if (!hasDragged && callbacks.onLeftClick) {
          callbacks.onLeftClick(event, activePointId);
        }
      }
      isMouseDown = false;
      hasDragged = false;
      downPos = null;
      activePointId = null;
    }, ScreenSpaceEventType.LEFT_UP);

    // Right click handler
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedUnknown: unknown = viewer.scene.pick(event.position);
      const id =
        hasId(pickedUnknown) && isEntity((pickedUnknown as { id: unknown }).id)
          ? ((pickedUnknown as { id: Entity }).id.id as string)
          : undefined;
      const callbacks = getPointCallbacks(id);
      if (callbacks && callbacks.onRightClick && id) {
        callbacks.onRightClick(event, id);
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);

    return () => {
      handler.destroy();
      canvas.style.cursor = 'default';
      if (highlightOverlays.length > 0) {
        highlightOverlays.forEach((e) => viewer.entities.remove(e));
      }
    };
  }, [viewer]);

  return null;
}

export default CesiumViewerConfig;
