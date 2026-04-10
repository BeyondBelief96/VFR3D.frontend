import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  TerrainProvider,
} from 'cesium';
import { ARCGIS_3D_TERRAIN_PROVIDER_URL } from '@/utility/constants';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setTerrainTransitioning } from '@/redux/slices/viewerSlice';

const MAX_TRANSITION_MS = 15_000;
const SETTLE_POLL_MS = 250;

/**
 * Hook to toggle between ArcGIS World Elevation 3D terrain and a flat ellipsoid.
 * When enabled, the globe renders real-world elevation data.
 *
 * After swapping the terrain provider, polls until the globe's tiles have loaded
 * (or a timeout is reached) then clears the terrainTransitioning flag so the
 * loading overlay can be dismissed.
 *
 * @param enabled - Whether 3D terrain should be active
 */
export function useTerrainProvider(enabled: boolean) {
  const { viewer } = useCesium();
  const dispatch = useAppDispatch();
  const arcgisTerrainRef = useRef<TerrainProvider | null>(null);
  const ellipsoidTerrainRef = useRef<TerrainProvider>(new EllipsoidTerrainProvider());
  const settleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    // Clear any previous settle polling
    if (settleTimerRef.current) clearInterval(settleTimerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const clearTransitioning = () => {
      if (settleTimerRef.current) clearInterval(settleTimerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      settleTimerRef.current = null;
      timeoutRef.current = null;
      dispatch(setTerrainTransitioning(false));
      if (!viewer.isDestroyed()) viewer.scene.requestRender();
    };

    /**
     * Poll until the globe reports its tiles are loaded, then clear the
     * transitioning overlay. Falls back to a maximum timeout so the UI
     * never stays locked indefinitely.
     */
    const waitForSettle = () => {
      settleTimerRef.current = setInterval(() => {
        if (!viewer || viewer.isDestroyed()) {
          clearTransitioning();
          return;
        }
        if (viewer.scene.globe.tilesLoaded) {
          clearTransitioning();
        }
      }, SETTLE_POLL_MS);

      timeoutRef.current = setTimeout(clearTransitioning, MAX_TRANSITION_MS);
    };

    if (enabled) {
      if (arcgisTerrainRef.current) {
        viewer.terrainProvider = arcgisTerrainRef.current;
        waitForSettle();
      } else {
        ArcGISTiledElevationTerrainProvider.fromUrl(ARCGIS_3D_TERRAIN_PROVIDER_URL).then(
          (provider) => {
            arcgisTerrainRef.current = provider;
            if (!viewer.isDestroyed()) {
              viewer.terrainProvider = provider;
              waitForSettle();
            }
          }
        );
      }
    } else {
      viewer.terrainProvider = ellipsoidTerrainRef.current;
      waitForSettle();
    }

    return () => {
      if (settleTimerRef.current) clearInterval(settleTimerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [viewer, enabled, dispatch]);
}
