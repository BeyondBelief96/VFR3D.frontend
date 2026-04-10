import { createFileRoute } from '@tanstack/react-router';
import { Box, Loader, Stack, Text } from '@mantine/core';
import { Viewer as ResiumViewer, Scene } from 'resium';
import { ArcGisMapServerImageryProvider, ArcGisMapService, ImageryLayer, Credit } from 'cesium';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/Auth';
import { MapUnavailableMobile } from '@/components/Common';
import { useIsPhone, useIsTablet, useAppSelector } from '@/hooks';
import { CesiumViewerConfig, ImageryLayers, CameraControls } from '@/components/Cesium';
import { ARCGIS_WORLD_IMAGERY_MAP_SERVER_URL } from '@/utility/constants';
import { SURFACE, BORDER, COLOR_RGB } from '@/constants/surfaces';
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

/**
 * Overlay shown while the terrain provider is being swapped.
 * Isolated into its own component so that its Redux subscription
 * does not trigger re-renders of MapContent (which would recreate
 * the Cesium Viewer via the read-only baseLayer prop).
 */
function TerrainTransitionOverlay() {
  const terrainTransitioning = useAppSelector((state) => state.viewer.terrainTransitioning);

  return (
    <AnimatePresence>
      {terrainTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `rgba(${COLOR_RGB.SLATE_900}, 0.7)`,
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
          >
            <Box
              style={{
                backgroundColor: SURFACE.CARD,
                border: `1px solid ${BORDER.DEFAULT}`,
                borderRadius: 'var(--mantine-radius-md)',
                padding: '24px 36px',
              }}
            >
              <Stack align="center" gap="md">
                <Loader size="sm" color="vfr3dBlue" type="bars" />
                <Text size="sm" c="dimmed" fw={500}>
                  Updating terrain...
                </Text>
              </Stack>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MapContent() {
  const isTablet = useIsTablet();

  // Memoize the base imagery layer so the reference is stable across renders.
  // Resium treats baseLayer as a read-only prop — if the reference changes it
  // destroys and recreates the entire Viewer, wiping all entities and state.
  const baseImageryLayer = useMemo(() => {
    const credit = new Credit(
      'Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      true
    );
    const provider = ArcGisMapServerImageryProvider.fromUrl(
      ARCGIS_WORLD_IMAGERY_MAP_SERVER_URL,
      { credit }
    );
    return ImageryLayer.fromProviderAsync(provider);
  }, []);

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
        baseLayer={baseImageryLayer}
        requestRenderMode={true}
        maximumRenderTimeChange={Infinity}
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

      {/* Terrain transition overlay — own component to avoid re-rendering MapContent */}
      <TerrainTransitionOverlay />
    </Box>
  );
}
