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

    // Fog fades distant tiles so Cesium can skip loading them.
    // Only enabled with terrain since it has no visual benefit on a flat ellipsoid.
    // Density is scaled from the slider value (1-8) into Cesium's fog density range.
    scene.fog.enabled = terrainEnabled;
    scene.fog.density = terrainFogDensity * 0.5e-4;
    scene.fog.screenSpaceErrorFactor = terrainFogDensity;
  }, [viewer, globeMaximumScreenSpaceError, terrainFogDensity, terrainEnabled]);
}
