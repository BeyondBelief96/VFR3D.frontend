import React from 'react';
import { Stack, Skeleton, Group, Box } from '@mantine/core';
import { SURFACE, BORDER } from '@/constants/surfaces';

export const AircraftProfileLoading: React.FC = () => {
  return (
    <Stack gap="md">
      {/* Header skeleton */}
      <Group justify="space-between">
        <Skeleton height={24} width={180} radius="sm" />
        <Skeleton height={36} width={120} radius="md" />
      </Group>

      {/* Profile cards skeleton */}
      {[1, 2].map((i) => (
        <Box
          key={i}
          style={{
            backgroundColor: SURFACE.CARD,
            border: `1px solid ${BORDER.SUBTLE}`,
            borderRadius: 'var(--mantine-radius-md)',
            padding: 'var(--mantine-spacing-md)',
          }}
        >
          <Group justify="space-between" mb="sm">
            <Skeleton height={20} width={150} radius="sm" />
            <Group gap="xs">
              <Skeleton height={28} width={28} radius="sm" />
              <Skeleton height={28} width={28} radius="sm" />
            </Group>
          </Group>
          <Group gap="md">
            <Box>
              <Skeleton height={12} width={60} radius="sm" mb={4} />
              <Skeleton height={16} width={80} radius="sm" />
            </Box>
            <Box>
              <Skeleton height={12} width={60} radius="sm" mb={4} />
              <Skeleton height={16} width={80} radius="sm" />
            </Box>
            <Box>
              <Skeleton height={12} width={60} radius="sm" mb={4} />
              <Skeleton height={16} width={80} radius="sm" />
            </Box>
            <Box>
              <Skeleton height={12} width={60} radius="sm" mb={4} />
              <Skeleton height={16} width={80} radius="sm" />
            </Box>
          </Group>
        </Box>
      ))}
    </Stack>
  );
};

export default AircraftProfileLoading;
