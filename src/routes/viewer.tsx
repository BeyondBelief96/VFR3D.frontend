import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Box } from '@mantine/core';
import { Globe, Viewer as ResiumViewer } from 'resium';
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
import { LoadingScreen } from '@/components/Common';
import { CesiumViewerConfig, ImageryLayers, CameraControls } from '@/components/Cesium';
import { useAppSelector } from '@/hooks/reduxHooks';
import {
  ARCGIS_3D_TERRAIN_PROVIDER_URL,
  ARCGIS_3D_TERRAIN_VIEWMODEL_IMAGE_URL,
  ARCGIS_NO_TERRAIN_VIEWMODEL_IMAGE_URL,
  ARCGIS_WORLD_IMAGERY_ICON_URL,
  ARCIS_OPEN_STREET_MAPS_VIEWMODEL_IMAGE_URL,
} from '@/utility/constants';

// Set the default access token for ArcGIS services
ArcGisMapService.defaultAccessToken = import.meta.env.VITE_ARCGIS_API_KEY;

export const Route = createFileRoute('/viewer')({
  component: ViewerPage,
});

function ViewerPage() {
  return (
    <ProtectedRoute>
      <ViewerContent />
    </ProtectedRoute>
  );
}

function ViewerContent() {
  const screenSpaceError = useAppSelector((state) => state.viewer.globeMaximumScreenSpaceError);

  const [imageryViewModels, setImageryViewModels] = useState<ProviderViewModel[]>([]);
  const [terrainViewModels, setTerrainViewModels] = useState<ProviderViewModel[]>([]);
  const [baseLayer, setBaseLayer] = useState<ImageryLayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadViewModels = async () => {
      try {
        // Create imagery view models
        const baseMapLayer = ArcGisMapServerImageryProvider.fromBasemapType(
          ArcGisBaseMapType.SATELLITE,
          {
            enablePickFeatures: false,
          }
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

  // Show loading while view models are being created
  if (isLoading || imageryViewModels.length === 0 || terrainViewModels.length === 0 || !baseLayer) {
    return (
      <LoadingScreen
        title="Loading VFR3D"
        message="Initializing 3D map and aviation charts..."
        fullScreen={false}
      />
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
        useBrowserRecommendedResolution={false}
        imageryProviderViewModels={imageryViewModels}
        terrainProviderViewModels={terrainViewModels}
        selectedImageryProviderViewModel={imageryViewModels[0]}
        selectedTerrainProviderViewModel={terrainViewModels[0]}
        geocoder={false}
        vrButton={false}
        fullscreenButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        homeButton={false}
        timeline={false}
        animation={false}
        selectionIndicator={false}
        infoBox={false}
        baseLayerPicker={true}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <CesiumViewerConfig />
        <Globe maximumScreenSpaceError={screenSpaceError} />
        <ImageryLayers />
        <CameraControls />
        {/* Future phases will add:
          - <Airports />
          - <Pireps />
          - <RouteComponent />
          - <AirspaceComponent />
          - <AirsigmetComponent />
          - <FlyTo />
        */}
      </ResiumViewer>
    </Box>
  );
}
