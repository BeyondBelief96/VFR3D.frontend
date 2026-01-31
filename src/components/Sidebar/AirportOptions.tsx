import { Stack, Select, Switch, Text, Group } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  setSelectedState,
  setShowSelectedStateAirports,
  setShowCloudBases,
} from '@/redux/slices/airportsSlice';
import { states } from '@/utility/states';

export function AirportOptions() {
  const dispatch = useAppDispatch();
  const { showAirportsForSelectedState, showCloudBases, selectedStateToShowAirports } =
    useAppSelector((state) => state.airport);

  const stateOptions = states.map((state) => ({ value: state, label: state }));

  const handleStateChange = (value: string | null) => {
    const selectedValue = value || '';
    dispatch(setSelectedState(selectedValue));
    // Automatically enable showing airports when a state is selected
    dispatch(setShowSelectedStateAirports(selectedValue !== ''));
  };

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" c="dimmed" mb={4}>
          Select State
        </Text>
        <Select
          data={stateOptions}
          value={selectedStateToShowAirports || null}
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
              backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
            },
          }}
        />
      </div>

      <Stack gap="sm">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Show State Airports
          </Text>
          <Switch
            checked={showAirportsForSelectedState}
            onChange={() => dispatch(setShowSelectedStateAirports(!showAirportsForSelectedState))}
            color="blue"
            size="md"
          />
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Show Cloud Bases
          </Text>
          <Switch
            checked={showCloudBases}
            onChange={() => dispatch(setShowCloudBases(!showCloudBases))}
            color="blue"
            size="md"
          />
        </Group>
      </Stack>

      <Text size="xs" c="dimmed">
        Cloud bases show ceiling info when METAR data is available.
        Searching for an airport will also show all airports in that state.
      </Text>
    </Stack>
  );
}

export default AirportOptions;
