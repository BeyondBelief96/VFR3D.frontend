import { Box, Stack, Text, Badge, Group, ActionIcon, ScrollArea, Divider } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import { ObstacleDto, ObstacleLighting, ObstacleMarking } from '@/redux/api/vfr3d/dtos';
import classes from '@/components/Popup/EntityInfoAside.module.css';

// Helper functions for obstacle display
const formatLighting = (lighting?: ObstacleLighting): string => {
  if (!lighting || lighting === ObstacleLighting.Unknown) return 'Unknown';
  switch (lighting) {
    case ObstacleLighting.Red:
      return 'Red';
    case ObstacleLighting.DualMediumWhiteStrobeRed:
      return 'Dual Medium White/Red Strobe';
    case ObstacleLighting.HighIntensityWhiteStrobeRed:
      return 'High Intensity White/Red Strobe';
    case ObstacleLighting.MediumIntensityWhiteStrobe:
      return 'Medium Intensity White Strobe';
    case ObstacleLighting.HighIntensityWhiteStrobe:
      return 'High Intensity White Strobe';
    case ObstacleLighting.Flood:
      return 'Flood';
    case ObstacleLighting.DualMediumCatenary:
      return 'Dual Medium Catenary';
    case ObstacleLighting.SynchronizedRedLighting:
      return 'Synchronized Red';
    case ObstacleLighting.Lighted:
      return 'Lighted';
    case ObstacleLighting.None:
      return 'None';
    default:
      return String(lighting);
  }
};

const formatMarking = (marking?: ObstacleMarking): string => {
  if (!marking || marking === ObstacleMarking.Unknown) return 'Unknown';
  switch (marking) {
    case ObstacleMarking.OrangeOrOrangeWhitePaint:
      return 'Orange/White Paint';
    case ObstacleMarking.WhitePaintOnly:
      return 'White Paint';
    case ObstacleMarking.Marked:
      return 'Marked';
    case ObstacleMarking.FlagMarker:
      return 'Flag Marker';
    case ObstacleMarking.SphericalMarker:
      return 'Spherical Marker';
    case ObstacleMarking.None:
      return 'None';
    default:
      return String(marking);
  }
};

interface ObstacleAsideContentProps {
  obstacle: ObstacleDto;
  onClose: () => void;
}

const ObstacleAsideContent: React.FC<ObstacleAsideContentProps> = ({ obstacle, onClose }) => {
  const isLit =
    obstacle.lighting !== undefined &&
    obstacle.lighting !== ObstacleLighting.None &&
    obstacle.lighting !== ObstacleLighting.Unknown;

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" className={classes.flexGroup}>
            <Badge color="red">Obstacle</Badge>
            {isLit && (
              <Badge color="yellow" variant="outline">
                Lit
              </Badge>
            )}
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} className={classes.closeButton}>
            <FiX size={18} />
          </ActionIcon>
        </Group>
      </Box>

      {/* Scrollable content */}
      <ScrollArea flex={1} scrollbarSize={6}>
        <Stack gap="xs" p="md">
          {/* Type and Location */}
          {obstacle.obstacleType && (
            <Text size="sm">
              <Text span c="dimmed">Type: </Text>
              <Text span fw={500}>{obstacle.obstacleType}</Text>
            </Text>
          )}

          {obstacle.cityName && (
            <Text size="sm">
              <Text span c="dimmed">Location: </Text>
              {obstacle.cityName}, {obstacle.stateId}
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Height Information */}
          <Text size="sm" fw={500} c="white">Height</Text>

          {obstacle.heightAgl !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">AGL: </Text>
              <Text span fw={500} c="orange">{obstacle.heightAgl.toLocaleString()} ft</Text>
            </Text>
          )}

          {obstacle.heightAmsl !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">MSL: </Text>
              {obstacle.heightAmsl.toLocaleString()} ft
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Lighting and Marking */}
          <Text size="sm" fw={500} c="white">Markings & Lighting</Text>

          <Text size="sm">
            <Text span c="dimmed">Lighting: </Text>
            {formatLighting(obstacle.lighting)}
          </Text>

          <Text size="sm">
            <Text span c="dimmed">Marking: </Text>
            {formatMarking(obstacle.marking)}
          </Text>

          {obstacle.quantity && obstacle.quantity > 1 && (
            <Text size="sm">
              <Text span c="dimmed">Quantity: </Text>
              {obstacle.quantity}
            </Text>
          )}

          <Divider my="xs" className={classes.divider} />

          {/* Coordinates */}
          <Text size="sm" fw={500} c="white">Position</Text>

          {obstacle.latitude !== undefined && obstacle.longitude !== undefined && (
            <Text size="sm">
              <Text span c="dimmed">Coordinates: </Text>
              {obstacle.latitude.toFixed(5)}, {obstacle.longitude.toFixed(5)}
            </Text>
          )}

          {/* OAS Number */}
          {obstacle.oasNumber && (
            <Text size="xs" c="dimmed" mt="xs">
              OAS Number: {obstacle.oasNumber}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default ObstacleAsideContent;
