import { createFileRoute } from '@tanstack/react-router';
import { Box } from '@mantine/core';
import { Viewer as ResiumViewer, Scene } from 'resium';
import { ArcGisMapServerImageryProvider, ArcGisMapService, ImageryLayer, Credit } from 'cesium';
import { ProtectedRoute } from '@/components/Auth';
import { LoadingScreen, MapUnavailableMobile } from '@/components/Common';
import { useIsPhone, useIsTablet } from '@/hooks';
import { CesiumViewerConfig, ImageryLayers, CameraControls } from '@/components/Cesium';
import { ARCGIS_WORLD_IMAGERY_MAP_SERVER_URL } from '@/utility/constants';
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
  const isTablet = useIsTablet();

  const esriArcgisWorldImageryCredit = new Credit(
    'Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    true
  );

  const baseImageryProvider = ArcGisMapServerImageryProvider.fromUrl(
    ARCGIS_WORLD_IMAGERY_MAP_SERVER_URL,
    {
      credit: esriArcgisWorldImageryCredit,
    }
  );

  const baseImageryLayer = ImageryLayer.fromProviderAsync(baseImageryProvider);

  const isReady = baseImageryProvider;

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
      }}
    >
      {!isReady ? (
        <LoadingScreen message="Initializing 3D map and aviation charts..." fullScreen={false} />
      ) : (
        <>
          <ResiumViewer
            full
            useBrowserRecommendedResolution={isTablet ? true : false}
            baseLayer={baseImageryLayer}
            timeline={false}
            shouldAnimate={false}
            animation={false}
            infoBox={false}
            selectionIndicator={false}
            creditContainer={'root'}
          >
            <CesiumViewerConfig />
            <Scene />
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
        </>
      )}
    </Box>
  );
}
