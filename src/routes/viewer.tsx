import { createFileRoute } from '@tanstack/react-router';
import { Box, Center, Loader, Text } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';

export const Route = createFileRoute('/viewer')({
  component: ViewerPage,
});

function ViewerPage() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <Center h="100vh" bg="var(--vfr3d-background)">
        <Loader size="xl" color="blue" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return (
      <Center h="100vh" bg="var(--vfr3d-background)">
        <Text c="white">Redirecting to login...</Text>
      </Center>
    );
  }

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--vfr3d-background)',
      }}
    >
      {/* Cesium Viewer will be implemented in Phase 5 */}
      <Center h="100%">
        <Text c="dimmed" size="xl">
          3D Viewer - Coming in Phase 5
        </Text>
      </Center>
    </Box>
  );
}
