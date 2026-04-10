import { useEffect } from 'react';
import { useCesium } from 'resium';

/**
 * Hook to manage globe rendering quality and terrain performance.
 *
 * Globe maximumScreenSpaceError always uses the chart value so imagery
 * stays sharp regardless of whether terrain is on. When terrain is enabled,
 * fog culls distant terrain tiles based on the user-controlled fog density
 * to recoup performance without degrading close-up chart quality.
 */
export function useGlobeQuality(
  globeMaximumScreenSpaceError: number,
  terrainFogDensity: number,
  terrainEnabled: boolean
) {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    const { scene } = viewer;
    const { globe } = scene;

    // Always use chart SSE — terrain and imagery share the same tile quadtree
    // so this keeps chart quality consistent whether terrain is on or off
    globe.maximumScreenSpaceError = globeMaximumScreenSpaceError;

    globe.depthTestAgainstTerrain = true;
    globe.enableLighting = false;

    // Fog's screenSpaceErrorFactor relaxes tile LOD for distant tiles when
    // the camera is tilted, so Cesium skips loading high-detail tiles near
    // the horizon. This is always enabled for imagery performance.
    // Visual fog density is only applied when terrain is on.
    scene.fog.enabled = true;
    scene.fog.density = terrainEnabled ? terrainFogDensity * 0.5e-4 : 1e-6;
    scene.fog.screenSpaceErrorFactor = terrainFogDensity;

    scene.requestRender();
  }, [viewer, globeMaximumScreenSpaceError, terrainFogDensity, terrainEnabled]);
}
