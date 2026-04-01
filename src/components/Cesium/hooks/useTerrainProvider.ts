import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  TerrainProvider,
} from 'cesium';
import { ARCGIS_3D_TERRAIN_PROVIDER_URL } from '@/utility/constants';

/**
 * Hook to toggle between ArcGIS World Elevation 3D terrain and a flat ellipsoid.
 * When enabled, the globe renders real-world elevation data.
 *
 * @param enabled - Whether 3D terrain should be active
 */
export function useTerrainProvider(enabled: boolean) {
  const { viewer } = useCesium();
  const arcgisTerrainRef = useRef<TerrainProvider | null>(null);
  const ellipsoidTerrainRef = useRef<TerrainProvider>(new EllipsoidTerrainProvider());

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;

    if (enabled) {
      if (arcgisTerrainRef.current) {
        viewer.terrainProvider = arcgisTerrainRef.current;
      } else {
        ArcGISTiledElevationTerrainProvider.fromUrl(ARCGIS_3D_TERRAIN_PROVIDER_URL).then(
          (provider) => {
            arcgisTerrainRef.current = provider;
            if (!viewer.isDestroyed()) {
              viewer.terrainProvider = provider;
            }
          }
        );
      }
    } else {
      viewer.terrainProvider = ellipsoidTerrainRef.current;
    }
  }, [viewer, enabled]);
}
