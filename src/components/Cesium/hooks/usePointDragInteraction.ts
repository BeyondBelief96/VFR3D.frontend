import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian2,
  Cartesian3,
} from 'cesium';
import { getPointCallbacks, setSharedScreenHandler } from '../pointEventRegistry';
import { getEntityFromPick, getEntityIdFromPick, isViewerUsable } from './cesiumHelpers';

const DRAG_THRESHOLD_PX = 4;
const HOVER_OVERLAY_NAME = '__hover_overlay__';

interface DragState {
  isMouseDown: boolean;
  hasDragged: boolean;
  downPos: Cartesian2 | null;
  activePointId: string | null;
}

/**
 * Hook to handle point entity interactions including click, drag, and right-click.
 * Integrates with the pointEventRegistry for callback management.
 *
 * Features:
 * - Click vs drag detection with threshold
 * - Camera control disabling during drag
 * - Cursor updates for interactive entities
 * - Left click, right click, drag start/move/end callbacks
 */
export function usePointDragInteraction() {
  const { viewer } = useCesium();
  const stateRef = useRef<DragState>({
    isMouseDown: false,
    hasDragged: false,
    downPos: null,
    activePointId: null,
  });

  useEffect(() => {
    if (!isViewerUsable(viewer)) return;

    const canvas = viewer.scene.canvas;
    const handler = new ScreenSpaceEventHandler(canvas);

    // Share this handler with the registry for external access
    setSharedScreenHandler(handler);

    /**
     * Drill through picks to find a non-overlay entity
     */
    const drillForNonOverlay = (position: Cartesian2) => {
      if (!isViewerUsable(viewer)) return null;
      const picks = viewer.scene.drillPick(position) as unknown[];
      for (const p of picks) {
        const ent = getEntityFromPick(p);
        if (ent && ent.name !== HOVER_OVERLAY_NAME) return ent;
      }
      return null;
    };

    /**
     * Disable all camera controls during drag
     */
    const disableCameraControls = () => {
      if (!isViewerUsable(viewer)) return;
      const controller = viewer.scene.screenSpaceCameraController;
      controller.enableRotate = false;
      controller.enableTranslate = false;
      controller.enableZoom = false;
      controller.enableTilt = false;
      controller.enableLook = false;
    };

    /**
     * Re-enable all camera controls after drag
     */
    const enableCameraControls = () => {
      if (!isViewerUsable(viewer)) return;
      const controller = viewer.scene.screenSpaceCameraController;
      controller.enableRotate = true;
      controller.enableTranslate = true;
      controller.enableZoom = true;
      controller.enableTilt = true;
      controller.enableLook = true;
    };

    /**
     * Convert screen position to globe cartesian coordinates
     */
    const screenToCartesian = (position: Cartesian2): Cartesian3 | null => {
      if (!isViewerUsable(viewer)) return null;
      const ellipsoid = viewer.scene.globe.ellipsoid;
      return viewer.camera.pickEllipsoid(position, ellipsoid) as Cartesian3 | null;
    };

    // Mouse move handler - cursor updates and drag handling
    handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
      if (!isViewerUsable(viewer)) return;

      const state = stateRef.current;
      const pickedRaw: unknown = viewer.scene.pick(movement.endPosition);
      const firstEntity = getEntityFromPick(pickedRaw);

      // Get the actual entity (skip overlays)
      const pickedEntity =
        firstEntity?.name === HOVER_OVERLAY_NAME
          ? drillForNonOverlay(movement.endPosition)
          : firstEntity;

      // Check if hovering a registered point
      const entityId = getEntityIdFromPick(pickedRaw);
      const hasPointCallbacks = getPointCallbacks(entityId) !== undefined;

      // Update cursor for interactive entities
      canvas.style.cursor = pickedEntity || hasPointCallbacks ? 'pointer' : 'default';

      // Handle active drag
      if (!state.isMouseDown || !state.activePointId) return;

      const dx = movement.endPosition.x - (state.downPos?.x ?? movement.endPosition.x);
      const dy = movement.endPosition.y - (state.downPos?.y ?? movement.endPosition.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if drag threshold exceeded
      if (distance > DRAG_THRESHOLD_PX) {
        state.hasDragged = true;
        disableCameraControls();
      }

      // Call drag callback if dragging
      const callbacks = getPointCallbacks(state.activePointId);
      if (callbacks?.draggable && callbacks.onDrag) {
        const cartesian = screenToCartesian(movement.endPosition);
        if (cartesian) {
          callbacks.onDrag(state.activePointId, cartesian);
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // Mouse down handler - start potential drag
    handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!isViewerUsable(viewer)) return;

      const state = stateRef.current;
      const pickedRaw: unknown = viewer.scene.pick(movement.position);
      const entityId = getEntityIdFromPick(pickedRaw);
      const callbacks = getPointCallbacks(entityId);

      if (callbacks && entityId) {
        state.isMouseDown = true;
        state.hasDragged = false;
        state.downPos = movement.position as Cartesian2;
        state.activePointId = entityId;

        if (callbacks.draggable && callbacks.onDragStart) {
          callbacks.onDragStart(entityId);
        }
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    // Mouse up handler - end drag or trigger click
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!isViewerUsable(viewer)) return;

      const state = stateRef.current;
      enableCameraControls();

      if (!state.activePointId) return;

      const callbacks = getPointCallbacks(state.activePointId);
      const cartesian = screenToCartesian(event.position);

      if (callbacks) {
        if (state.hasDragged && callbacks.onDragEnd && cartesian) {
          callbacks.onDragEnd(state.activePointId, cartesian, true);
        } else if (!state.hasDragged && callbacks.onLeftClick) {
          callbacks.onLeftClick(event, state.activePointId);
        }
      }

      // Reset state
      state.isMouseDown = false;
      state.hasDragged = false;
      state.downPos = null;
      state.activePointId = null;
    }, ScreenSpaceEventType.LEFT_UP);

    // Right click handler
    handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!isViewerUsable(viewer)) return;

      const pickedRaw: unknown = viewer.scene.pick(event.position);
      const entityId = getEntityIdFromPick(pickedRaw);
      const callbacks = getPointCallbacks(entityId);

      if (callbacks?.onRightClick && entityId) {
        callbacks.onRightClick(event, entityId);
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);

    return () => {
      enableCameraControls();
      canvas.style.cursor = 'default';
      setSharedScreenHandler(null);
      if (!handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewer]);
}
