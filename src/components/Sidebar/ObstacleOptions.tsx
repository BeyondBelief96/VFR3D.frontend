import { useState, useEffect } from 'react';
import { Stack, Switch, Text, Group, NumberInput, Slider, Divider, Badge, Box } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  setMinHeightFilter,
  toggleShowRouteObstacles,
  setHeightExaggeration,
  toggleShowObstacleLabels,
  setAirportObstacleRadius,
  addObstacleAirport,
  removeObstacleAirport,
} from '@/redux/slices/obstaclesSlice';
import { AirportSearch } from '@/components/Search';
import { AirportContextList } from './AirportContextList';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import { SURFACE, BORDER } from '@/constants/surfaces';

const DEBOUNCE_MS = 300;

export function ObstacleOptions() {
  const dispatch = useAppDispatch();
  const {
    minHeightFilter,
    showRouteObstacles,
    heightExaggeration,
    showObstacleLabels,
    airportObstacleRadiusNm,
    obstacleAirports,
  } = useAppSelector((state) => state.obstacles);

  // Local state for debounced inputs
  const [localRadius, setLocalRadius] = useState(airportObstacleRadiusNm);
  const [localMinHeight, setLocalMinHeight] = useState(minHeightFilter);

  const [debouncedRadius] = useDebouncedValue(localRadius, DEBOUNCE_MS);
  const [debouncedMinHeight] = useDebouncedValue(localMinHeight, DEBOUNCE_MS);

  // Sync debounced values to Redux
  useEffect(() => {
    if (debouncedRadius !== airportObstacleRadiusNm) {
      dispatch(setAirportObstacleRadius(debouncedRadius));
    }
  }, [debouncedRadius, airportObstacleRadiusNm, dispatch]);

  useEffect(() => {
    if (debouncedMinHeight !== minHeightFilter) {
      dispatch(setMinHeightFilter(debouncedMinHeight));
    }
  }, [debouncedMinHeight, minHeightFilter, dispatch]);

  // Sync Redux values to local state when they change externally
  useEffect(() => {
    setLocalRadius(airportObstacleRadiusNm);
  }, [airportObstacleRadiusNm]);

  useEffect(() => {
    setLocalMinHeight(minHeightFilter);
  }, [minHeightFilter]);

  const handleAirportSelect = (airport: AirportDto) => {
    const icaoOrIdent = airport.icaoId || airport.arptId || '';
    const displayName = `${icaoOrIdent} - ${airport.arptName || 'Unknown'}`;

    if (icaoOrIdent && airport.latDecimal && airport.longDecimal) {
      dispatch(addObstacleAirport({
        icaoOrIdent,
        displayName,
        lat: airport.latDecimal,
        lon: airport.longDecimal,
      }));
    }
  };

  const handleRemoveAirport = (icaoOrIdent: string) => {
    dispatch(removeObstacleAirport(icaoOrIdent));
  };

  return (
    <Stack gap="md">
      {/* Route Obstacles Section */}
      <div>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500}>Route Obstacles</Text>
          <Badge color="cyan" variant="light" size="sm">Along Route</Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>
          Obstacles along your planned flight route.
        </Text>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Show Route Obstacles
          </Text>
          <Switch
            checked={showRouteObstacles}
            onChange={() => dispatch(toggleShowRouteObstacles(!showRouteObstacles))}
            color="cyan"
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
          color="cyan"
          styles={{
            markLabel: { color: 'var(--mantine-color-dimmed)' },
          }}
        />
      </div>

      <Divider />

      {/* Airport Obstacles Section */}
      <Box>
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500}>Airport Obstacles</Text>
          <Badge color="cyan" variant="light" size="sm">Near Airport</Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>
          Search and add airports to view nearby obstacles (cyan).
        </Text>
        <Box mb="sm">
          <AirportSearch
            placeholder="Search airports to add..."
            clearOnSelect={true}
            setAsSelectedEntity={false}
            onAirportSelect={handleAirportSelect}
          />
        </Box>
        <AirportContextList
          airports={obstacleAirports}
          onRemove={handleRemoveAirport}
          emptyMessage="No airports added. Search above to view nearby obstacles."
          color="cyan"
        />
      </Box>

      <Divider />

      {/* Radius and Height Settings */}
      <div>
        <Text size="sm" fw={500} mb={8}>Airport Obstacle Settings</Text>

        <Text size="sm" c="dimmed" mb={4}>
          Search Radius ({localRadius} NM)
        </Text>
        <Slider
          value={localRadius}
          onChange={setLocalRadius}
          min={1}
          max={20}
          step={1}
          mb={16}
          marks={[
            { value: 1, label: '1' },
            { value: 10, label: '10' },
            { value: 20, label: '20' },
          ]}
          color="cyan"
          styles={{
            markLabel: { color: 'var(--mantine-color-dimmed)' },
          }}
        />

        <Text size="sm" c="dimmed" mb={4}>
          Minimum Height (ft AGL)
        </Text>
        <NumberInput
          value={localMinHeight}
          onChange={(val) => setLocalMinHeight(typeof val === 'number' ? val : 200)}
          min={0}
          max={2000}
          step={50}
          styles={{
            input: {
              backgroundColor: SURFACE.INPUT,
              borderColor: BORDER.DEFAULT,
              color: 'white',
            },
          }}
        />
      </div>

      <Divider />

      {/* Legend */}
      <Text size="xs" c="dimmed">
        All obstacles are shown in cyan.
      </Text>
    </Stack>
  );
}

export default ObstacleOptions;
