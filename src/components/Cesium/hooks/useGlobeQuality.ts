import { useEffect } from 'react';
import { useCesium } from 'resium';

/**
 * Hook to manage globe rendering quality via maximumScreenSpaceError.
 * Lower values = higher quality terrain/imagery, higher GPU usage.
 * Higher values = lower quality, better performance.
 *
 * Also enables depth testing against terrain so the globe properly
 * occludes entities on the far side of the earth.
 *
 * @param maximumScreenSpaceError - The maximum screen space error for globe rendering
 */
export function useGlobeQuality(maximumScreenSpaceError: number) {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    viewer.scene.globe.maximumScreenSpaceError = maximumScreenSpaceError;
    viewer.scene.globe.depthTestAgainstTerrain = true;
  }, [viewer, maximumScreenSpaceError]);
}
