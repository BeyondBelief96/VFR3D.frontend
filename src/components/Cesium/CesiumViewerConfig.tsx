import { useDisableDoubleClickZoom } from '@/hooks/useDisableDoubleClickZoom';
import { useAppSelector } from '@/hooks';
import {
  useGlobeQuality,
  usePolygonHoverHighlight,
  useCylinderHoverHighlight,
  usePointDragInteraction,
} from './hooks';

/**
 * CesiumViewerConfig component handles viewer-level configuration including:
 * - Disabling double-click zoom
 * - Globe rendering quality (maximumScreenSpaceError)
 * - Polygon hover highlighting
 * - Point entity click/drag interactions
 *
 * This component must be rendered inside a Cesium Viewer context.
 */
export function CesiumViewerConfig() {
  const { globeMaximumScreenSpaceError } = useAppSelector((state) => state.viewer);

  // Disable double-click zoom behavior
  useDisableDoubleClickZoom();

  // Set globe rendering quality based on Redux state
  useGlobeQuality(globeMaximumScreenSpaceError);

  // Enable polygon hover highlighting with yellow overlays
  usePolygonHoverHighlight();

  // Enable cylinder (obstacle) hover highlighting with yellow overlays
  useCylinderHoverHighlight();

  // Enable point entity click/drag interactions
  usePointDragInteraction();

  return null;
}

export default CesiumViewerConfig;
