import { Cartesian3, ScreenSpaceEventHandler } from 'cesium';

/**
 * Callback types for interactive point entities in the Cesium viewer.
 */
export type PointCallbacks = {
  /** Whether the point can be dragged */
  draggable?: boolean;
  /** Called when the point is left-clicked */
  onLeftClick?: (e: ScreenSpaceEventHandler.PositionedEvent, id: string) => void;
  /** Called when the point is right-clicked */
  onRightClick?: (e: ScreenSpaceEventHandler.PositionedEvent, id: string) => void;
  /** Called when dragging starts */
  onDragStart?: (id: string) => void;
  /** Called during dragging with the current position */
  onDrag?: (id: string, pos: Cartesian3) => void;
  /** Called when dragging ends */
  onDragEnd?: (id: string, pos: Cartesian3, didDrag?: boolean) => void;
};

// Registry to store point callbacks by entity ID
const registry = new Map<string, PointCallbacks>();

/**
 * Register callbacks for a point entity.
 * @param id - The entity ID
 * @param callbacks - The callbacks to register
 */
export function registerPointCallbacks(id: string, callbacks: PointCallbacks) {
  registry.set(id, callbacks);
}

/**
 * Unregister callbacks for a point entity.
 * @param id - The entity ID
 */
export function unregisterPointCallbacks(id: string) {
  registry.delete(id);
}

/**
 * Get callbacks for a point entity.
 * @param id - The entity ID
 * @returns The callbacks or undefined if not found
 */
export function getPointCallbacks(id: string | undefined | null): PointCallbacks | undefined {
  if (!id) return undefined;
  return registry.get(id);
}

/**
 * Check if a point entity has registered callbacks.
 * @param id - The entity ID
 * @returns True if the point has callbacks
 */
export function hasPoint(id: string | undefined | null): boolean {
  if (!id) return false;
  return registry.has(id);
}

// Shared screen handler reference for use by other managers
export let sharedScreenHandler: ScreenSpaceEventHandler | null = null;

/**
 * Set the shared screen space event handler.
 * @param handler - The handler to set
 */
export function setSharedScreenHandler(handler: ScreenSpaceEventHandler | null) {
  sharedScreenHandler = handler;
}
