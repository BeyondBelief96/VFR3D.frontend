import { Stack, Text, Button, Group, Box, Badge } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { toggleHazardVisibility, HazardType } from '@/redux/slices/airsigmetsSlice';

const hazardTypes: { type: HazardType; label: string; color: string; description: string }[] = [
  {
    type: 'CONVECTIVE',
    label: 'Convective',
    color: 'red',
    description: 'Thunderstorms and convective activity',
  },
  { type: 'TURB', label: 'Turbulence', color: 'orange', description: 'Moderate to severe turbulence' },
  { type: 'ICE', label: 'Icing', color: 'cyan', description: 'Moderate to severe icing' },
  { type: 'IFR', label: 'IFR', color: 'purple', description: 'IFR conditions' },
  { type: 'MTN OBSCN', label: 'Mtn Obscn', color: 'gray', description: 'Mountain obscuration' },
];

export function AirsigmetOptions() {
  const dispatch = useAppDispatch();
  const { visibleHazards } = useAppSelector((state) => state.airsigmet);

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Toggle visibility of AIRMET and SIGMET hazard areas on the map.
      </Text>

      <Box>
        <Text size="sm" fw={500} c="white" mb={8}>
          Hazard Types
        </Text>
        <Group gap="xs">
          {hazardTypes.map(({ type, label, color }) => (
            <Button
              key={type}
              size="xs"
              variant={visibleHazards[type] ? 'filled' : 'outline'}
              color={visibleHazards[type] ? color : 'gray'}
              onClick={() => dispatch(toggleHazardVisibility(type))}
            >
              {label}
            </Button>
          ))}
        </Group>
      </Box>

      <Stack gap={4}>
        <Text size="xs" fw={500} c="white">
          Legend
        </Text>
        {hazardTypes.map(({ type, label, color, description }) => (
          <Group key={type} gap="xs">
            <Badge size="sm" color={color} variant="filled" style={{ minWidth: 70 }}>
              {label}
            </Badge>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}

export default AirsigmetOptions;
