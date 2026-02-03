import { Entity, Viewer } from 'cesium';

/**
 * Check if the viewer is valid and not destroyed.
 * Uses a type predicate to narrow the type for TypeScript.
 */
export function isViewerUsable(viewer: Viewer | undefined): viewer is Viewer {
  return !!viewer && !viewer.isDestroyed();
}

/**
 * Type guard to check if a value is a Cesium Entity
 */
export function isEntity(value: unknown): value is Entity {
  return value instanceof Entity;
}

/**
 * Type guard to check if a value has an 'id' property
 */
export function hasId(value: unknown): value is { id: unknown } {
  return typeof value === 'object' && value !== null && 'id' in (value as object);
}

/**
 * Extract an Entity from a pick result, handling both direct Entity
 * picks and primitive picks with an 'id' property
 */
export function getEntityFromPick(pick: unknown): Entity | null {
  if (isEntity(pick)) return pick;
  if (hasId(pick)) {
    const candidate = (pick as { id: unknown }).id;
    if (isEntity(candidate)) return candidate;
  }
  return null;
}

/**
 * Extract the entity ID string from a pick result
 */
export function getEntityIdFromPick(pick: unknown): string | undefined {
  if (hasId(pick) && isEntity((pick as { id: unknown }).id)) {
    return (pick as { id: Entity }).id.id as string;
  }
  return undefined;
}
