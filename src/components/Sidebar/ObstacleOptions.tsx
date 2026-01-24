import { Stack, Select, Switch, Text, Group, NumberInput } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  toggleShowObstacles,
  setObstacleState,
  setMinHeightFilter,
} from '@/redux/slices/obstaclesSlice';
import { states } from '@/utility/states';

export function ObstacleOptions() {
  const dispatch = useAppDispatch();
  const { showObstacles, selectedState, minHeightFilter } = useAppSelector(
    (state) => state.obstacles
  );

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
          Show Obstacles
        </Text>
        <Switch
          checked={showObstacles}
          onChange={() => dispatch(toggleShowObstacles(!showObstacles))}
          color="orange"
          size="md"
          disabled={!selectedState}
        />
      </Group>

      <Text size="xs" c="dimmed">
        Obstacles are displayed as 3D cylinders extending from ground to obstacle height.
        Red/white striped obstacles are lit, solid red are unlit.
      </Text>
    </Stack>
  );
}

export default ObstacleOptions;
