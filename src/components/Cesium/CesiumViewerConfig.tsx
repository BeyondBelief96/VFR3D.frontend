import { useDisableDoubleClickZoom } from '@/hooks/useDisableDoubleClickZoom';
import { useAppSelector } from '@/hooks';
import {
  useGlobeQuality,
  useTerrainProvider,
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
  const { globeMaximumScreenSpaceError, terrainFogDensity = 4, terrainEnabled } = useAppSelector(
    (state) => state.viewer
  );

  // Disable double-click zoom behavior
  useDisableDoubleClickZoom();

  // Set globe rendering quality and terrain fog settings
  useGlobeQuality(globeMaximumScreenSpaceError, terrainFogDensity, terrainEnabled);

  // Toggle 3D terrain elevation
  useTerrainProvider(terrainEnabled);

  // Enable polygon hover highlighting with yellow overlays
  usePolygonHoverHighlight();

  // Enable cylinder (obstacle) hover highlighting with yellow overlays
  useCylinderHoverHighlight();

  // Enable point entity click/drag interactions
  usePointDragInteraction();

  return null;
}

export default CesiumViewerConfig;
