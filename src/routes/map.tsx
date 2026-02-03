import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Box } from '@mantine/core';
import { Globe, Viewer as ResiumViewer, Scene } from 'resium';
import {
  ArcGisMapServerImageryProvider,
  ProviderViewModel,
  ArcGisMapService,
  ArcGISTiledElevationTerrainProvider,
  ArcGisBaseMapType,
  ImageryLayer,
  OpenStreetMapImageryProvider,
  EllipsoidTerrainProvider,
} from 'cesium';
import { ProtectedRoute } from '@/components/Auth';
import { LoadingScreen, MapUnavailableMobile } from '@/components/Common';
import { useIsPhone, useIsTablet } from '@/hooks';
import { CesiumViewerConfig, ImageryLayers, CameraControls } from '@/components/Cesium';
import { useAppSelector } from '@/hooks/reduxHooks';
import {
  ARCGIS_3D_TERRAIN_PROVIDER_URL,
  ARCGIS_3D_TERRAIN_VIEWMODEL_IMAGE_URL,
  ARCGIS_NO_TERRAIN_VIEWMODEL_IMAGE_URL,
  ARCGIS_WORLD_IMAGERY_ICON_URL,
  ARCIS_OPEN_STREET_MAPS_VIEWMODEL_IMAGE_URL,
} from '@/utility/constants';
import { Airports, FlyTo } from '@/features/Airports';
import { AirspaceComponent } from '@/features/Airspace';
import { Pireps } from '@/features/Pireps';
import { AirsigmetComponent, GAirmetComponent } from '@/features/Airsigmets';
import { Obstacles, RouteObstacles } from '@/features/Obstacles';
import { RouteComponent, FlightPlanningDrawer } from '@/features/Flights';

// Set the default access token for ArcGIS services
ArcGisMapService.defaultAccessToken = import.meta.env.VITE_ARCGIS_API_KEY;

export const Route = createFileRoute('/map')({
  component: MapPage,
  loader: () => Promise.resolve(),
});

function MapPage() {
  const isPhone = useIsPhone();

  // Show mobile-friendly message for phone users
  if (isPhone) {
    return (
      <ProtectedRoute>
        <MapUnavailableMobile />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MapContent />
    </ProtectedRoute>
  );
}

function MapContent() {
  const screenSpaceError = useAppSelector((state) => state.viewer.globeMaximumScreenSpaceError);
  const isTablet = useIsTablet();

  const [imageryViewModels, setImageryViewModels] = useState<ProviderViewModel[]>([]);
  const [terrainViewModels, setTerrainViewModels] = useState<ProviderViewModel[]>([]);
  const [baseLayer, setBaseLayer] = useState<ImageryLayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React 19 strict mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const loadViewModels = async () => {
      try {
        // Create imagery view models
        const baseMapLayer = ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        );

        const imageryProviders = [
          new ProviderViewModel({
            name: 'ArcGIS World Imagery',
            iconUrl: ARCGIS_WORLD_IMAGERY_ICON_URL,
            creationFunction: () => baseMapLayer,
            tooltip: 'ArcGIS World Imagery',
          }),
          new ProviderViewModel({
            name: 'Open Street Map',
            iconUrl: ARCIS_OPEN_STREET_MAPS_VIEWMODEL_IMAGE_URL,
            tooltip: 'Open Street Map',
            creationFunction: () => {
              return new OpenStreetMapImageryProvider({
                url: 'https://a.tile.openstreetmap.org/',
              });
            },
          }),
        ];

        setImageryViewModels(imageryProviders);
        setBaseLayer(ImageryLayer.fromProviderAsync(baseMapLayer, {}));

        // Create terrain view models
        const noTerrainProvider = new EllipsoidTerrainProvider();
        const arcgisTerrainProvider = await ArcGISTiledElevationTerrainProvider.fromUrl(
          ARCGIS_3D_TERRAIN_PROVIDER_URL
        );

        const terrainProviders = [
          new ProviderViewModel({
            name: 'No Terrain',
            tooltip: 'WGS84 Ellipsoid',
            iconUrl: ARCGIS_NO_TERRAIN_VIEWMODEL_IMAGE_URL,
            creationFunction: () => {
              return noTerrainProvider;
            },
          }),
          new ProviderViewModel({
            name: 'ArcGIS World Terrain',
            tooltip: 'ArcGIS World Terrain',
            iconUrl: ARCGIS_3D_TERRAIN_VIEWMODEL_IMAGE_URL,
            creationFunction: () => {
              return arcgisTerrainProvider;
            },
          }),
        ];

        setTerrainViewModels(terrainProviders);
      } catch (error) {
        console.error('Error loading view models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadViewModels();
  }, []);

  // Memoize selected view models to prevent Viewer recreation
  const selectedImageryViewModel = useMemo(() => imageryViewModels[0], [imageryViewModels]);
  const selectedTerrainViewModel = useMemo(() => terrainViewModels[0], [terrainViewModels]);

  // Show loading while view models are being created
  if (isLoading || imageryViewModels.length === 0 || terrainViewModels.length === 0 || !baseLayer) {
    return (
      <LoadingScreen message="Initializing 3D map and aviation charts..." fullScreen={false} />
    );
  }

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
      }}
    >
      <ResiumViewer
        full
        useBrowserRecommendedResolution={isTablet ? true : false}
        baseLayer={baseLayer}
        timeline={false}
        shouldAnimate={false}
        animation={false}
        infoBox={false}
        selectionIndicator={false}
      >
        {/*<CesiumViewerConfig />*/}
        <Scene />
        {/*<Globe />*/}
        <ImageryLayers />
        <CameraControls />
        {/* Map Features */}
        <Airports />
        <AirspaceComponent />
        <Pireps />
        <AirsigmetComponent />
        <GAirmetComponent />
        <Obstacles />
        <RouteObstacles />
        <FlyTo />

        {/* Flight Planning */}
        <RouteComponent />
      </ResiumViewer>

      {/* Flight Planning Drawer */}
      <FlightPlanningDrawer />
    </Box>
  );
}
