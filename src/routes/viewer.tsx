import { createFileRoute } from '@tanstack/react-router';
import { Box, Center, Text } from '@mantine/core';
import { ProtectedRoute } from '@/components/Auth';

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
  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 60px)',
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
