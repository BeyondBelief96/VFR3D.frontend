import { Stack, Text, Switch, Group, Box, Badge } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { toggleShowPireps } from '@/redux/slices/pirepsSlice';

export function PirepOptions() {
  const dispatch = useAppDispatch();
  const { showPireps } = useAppSelector((state) => state.pireps);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Show PIREPs
        </Text>
        <Switch
          checked={showPireps}
          onChange={(event) => dispatch(toggleShowPireps(event.currentTarget.checked))}
          color="blue"
          size="md"
        />
      </Group>

      <Box>
        <Text size="xs" c="dimmed" mb={8}>
          PIREPs (Pilot Weather Reports) show real-time conditions reported by pilots.
        </Text>

        <Stack gap={4}>
          <Group gap="xs">
            <Badge size="sm" color="cyan" variant="dot">
              UA
            </Badge>
            <Text size="xs" c="dimmed">
              Routine PIREP
            </Text>
          </Group>
          <Group gap="xs">
            <Badge size="sm" color="red" variant="dot">
              UUA
            </Badge>
            <Text size="xs" c="dimmed">
              Urgent PIREP
            </Text>
          </Group>
        </Stack>
      </Box>

      <Text size="xs" c="dimmed">
        PIREPs include turbulence, icing, and sky conditions reported along your route.
      </Text>
    </Stack>
  );
}

export default PirepOptions;
