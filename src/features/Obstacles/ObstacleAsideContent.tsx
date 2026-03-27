import { Box, Stack, Text, Badge, Group, ActionIcon, ScrollArea, Divider } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import { ObstacleDto, ObstacleLighting, ObstacleMarking } from '@/redux/api/vfr3d/dtos';
import classes from '@/components/Popup/EntityInfoAside.module.css';
import { ACTION_ICON_COLORS } from '@/constants/colors';

// Helper functions for obstacle display
const formatLighting = (lighting?: ObstacleLighting | null): string => {
  if (!lighting || lighting === 'Unknown') return 'Unknown';
  switch (lighting) {
    case 'Red':
      return 'Red';
    case 'DualMediumWhiteStrobeRed':
      return 'Dual Medium White/Red Strobe';
    case 'HighIntensityWhiteStrobeRed':
      return 'High Intensity White/Red Strobe';
    case 'MediumIntensityWhiteStrobe':
      return 'Medium Intensity White Strobe';
    case 'HighIntensityWhiteStrobe':
      return 'High Intensity White Strobe';
    case 'Flood':
      return 'Flood';
    case 'DualMediumCatenary':
      return 'Dual Medium Catenary';
    case 'SynchronizedRedLighting':
      return 'Synchronized Red';
    case 'Lighted':
      return 'Lighted';
    case 'None':
      return 'None';
    default:
      return String(lighting);
  }
};

const formatMarking = (marking?: ObstacleMarking | null): string => {
  if (!marking || marking === 'Unknown') return 'Unknown';
  switch (marking) {
    case 'OrangeOrOrangeWhitePaint':
      return 'Orange/White Paint';
    case 'WhitePaintOnly':
      return 'White Paint';
    case 'Marked':
      return 'Marked';
    case 'FlagMarker':
      return 'Flag Marker';
    case 'SphericalMarker':
      return 'Spherical Marker';
    case 'None':
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
    obstacle.lighting !== null &&
    obstacle.lighting !== 'None' &&
    obstacle.lighting !== 'Unknown';

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
          <ActionIcon variant="subtle" color={ACTION_ICON_COLORS.CLOSE} onClick={onClose} className={classes.closeButton}>
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

          {obstacle.heightAgl != null && (
            <Text size="sm">
              <Text span c="dimmed">AGL: </Text>
              <Text span fw={500} c="orange">{obstacle.heightAgl.toLocaleString()} ft</Text>
            </Text>
          )}

          {obstacle.heightAmsl != null && (
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

          {obstacle.latitude != null && obstacle.longitude != null && (
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
