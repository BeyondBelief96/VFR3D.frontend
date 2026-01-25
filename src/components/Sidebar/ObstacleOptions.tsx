import { Stack, Select, Switch, Text, Group, NumberInput, Slider, Divider, Badge } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  toggleShowObstacles,
  setObstacleState,
  setMinHeightFilter,
  toggleShowRouteObstacles,
  setHeightExaggeration,
  toggleShowObstacleLabels,
} from '@/redux/slices/obstaclesSlice';
import { states } from '@/utility/states';

export function ObstacleOptions() {
  const dispatch = useAppDispatch();
  const {
    showObstacles,
    selectedState,
    minHeightFilter,
    showRouteObstacles,
    heightExaggeration,
    showObstacleLabels,
  } = useAppSelector((state) => state.obstacles);

  const stateOptions = states.map((state) => ({ value: state, label: state }));

  const handleStateChange = (value: string | null) => {
    const selectedValue = value || '';
    dispatch(setObstacleState(selectedValue));
    if (selectedValue) {
      dispatch(toggleShowObstacles(true));
    }
  };

  return (
    <Stack gap="md">
      {/* Route Obstacles Section */}
      <div>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500}>Route Obstacles</Text>
          <Badge color="orange" variant="light" size="sm">Along Route</Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>
          Obstacles along your planned flight route (orange).
        </Text>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Show Route Obstacles
          </Text>
          <Switch
            checked={showRouteObstacles}
            onChange={() => dispatch(toggleShowRouteObstacles(!showRouteObstacles))}
            color="orange"
            size="md"
          />
        </Group>
      </div>

      <Divider />

      {/* Display Settings */}
      <div>
        <Text size="sm" fw={500} mb={8}>Display Settings</Text>

        <Group justify="space-between" mb={12}>
          <Text size="sm" c="dimmed">
            Show Labels
          </Text>
          <Switch
            checked={showObstacleLabels}
            onChange={() => dispatch(toggleShowObstacleLabels(!showObstacleLabels))}
            color="blue"
            size="md"
          />
        </Group>

        <Text size="sm" c="dimmed" mb={4}>
          Height Exaggeration ({heightExaggeration}x)
        </Text>
        <Text size="sm" c="yellow.5" mb={8}>
          1x shows true obstacle heights. Higher values exaggerate for visibility only and do not represent actual clearance.
        </Text>
        <Slider
          value={heightExaggeration}
          onChange={(val) => dispatch(setHeightExaggeration(val))}
          min={1}
          max={10}
          step={1}
          mb={10}
          marks={[
            { value: 1, label: '1x' },
            { value: 5, label: '5x' },
            { value: 10, label: '10x' },
          ]}
          color="orange"
          styles={{
            markLabel: { color: 'var(--mantine-color-dimmed)' },
          }}
        />
      </div>

      <Divider />

      {/* State-based Obstacles Section */}
      <div>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500}>State Obstacles</Text>
          <Badge color="red" variant="light" size="sm">By State</Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>
          All obstacles in a selected state (red).
        </Text>
      </div>

      <div>
        <Text size="sm" c="dimmed" mb={4}>
          Select State
        </Text>
        <Select
          data={stateOptions}
          value={selectedState || null}
          onChange={handleStateChange}
          searchable
          clearable
          placeholder="Select a state..."
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'white',
            },
            dropdown: {
              backgroundColor: 'var(--vfr3d-surface)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
            },
          }}
        />
      </div>

      <div>
        <Text size="sm" c="dimmed" mb={4}>
          Minimum Height (ft AGL)
        </Text>
        <NumberInput
          value={minHeightFilter}
          onChange={(val) => dispatch(setMinHeightFilter(typeof val === 'number' ? val : 200))}
          min={0}
          max={2000}
          step={50}
          styles={{
            input: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
              color: 'white',
            },
          }}
        />
      </div>

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Show State Obstacles
        </Text>
        <Switch
          checked={showObstacles}
          onChange={() => dispatch(toggleShowObstacles(!showObstacles))}
          color="red"
          size="md"
          disabled={!selectedState}
        />
      </Group>

      <Text size="xs" c="dimmed">
        Red = state obstacles. Orange = route obstacles.
      </Text>
    </Stack>
  );
}

export default ObstacleOptions;
