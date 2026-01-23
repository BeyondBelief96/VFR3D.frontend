import { Stack, Text, Button, Group, Box } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  toggleAirspaceClass,
  toggleSpecialUseAirspaceTypeCode,
  toggleShowRouteAirspaces,
  AirspaceClass,
  SpecialUseAirspaceTypeCode,
} from '@/redux/slices/airspacesSlice';

const airspaceClasses: AirspaceClass[] = ['B', 'C', 'D'];

const specialUseAirspaceTypeCodes: { code: SpecialUseAirspaceTypeCode; label: string }[] = [
  { code: 'MOA', label: 'MOA' },
  { code: 'R', label: 'Restricted' },
  { code: 'W', label: 'Warning' },
  { code: 'A', label: 'Alert' },
  { code: 'P', label: 'Prohibited' },
  { code: 'D', label: 'Danger' },
];

export function AirspaceOptions() {
  const dispatch = useAppDispatch();
  const { visibleClasses, visibleTypeCodes, showRouteAirspaces } = useAppSelector(
    (state) => state.airspaces
  );

  return (
    <Stack gap="md">
      {/* Route Airspaces Toggle */}
      <Box>
        <Text size="sm" fw={500} c="white" mb={4}>
          Route Airspaces
        </Text>
        <Group gap="xs" align="center">
          <Button
            size="xs"
            variant={showRouteAirspaces ? 'filled' : 'outline'}
            color={showRouteAirspaces ? 'blue' : 'gray'}
            onClick={() => dispatch(toggleShowRouteAirspaces())}
          >
            {showRouteAirspaces ? 'Shown' : 'Hidden'}
          </Button>
          <Text size="xs" c="dimmed">
            Airspaces intersecting your route
          </Text>
        </Group>
      </Box>

      {/* Airspace Classes */}
      <Box>
        <Text size="sm" fw={500} c="white" mb={8}>
          Airspace Classes
        </Text>
        <Group gap="xs">
          {airspaceClasses.map((airspaceClass) => (
            <Button
              key={airspaceClass}
              size="xs"
              variant={visibleClasses[airspaceClass] ? 'filled' : 'outline'}
              color={visibleClasses[airspaceClass] ? 'blue' : 'gray'}
              onClick={() => dispatch(toggleAirspaceClass(airspaceClass))}
            >
              Class {airspaceClass}
            </Button>
          ))}
        </Group>
      </Box>

      {/* Special Use Airspaces */}
      <Box>
        <Text size="sm" fw={500} c="white" mb={8}>
          Special Use Airspaces
        </Text>
        <Group gap="xs">
          {specialUseAirspaceTypeCodes.map(({ code, label }) => (
            <Button
              key={code}
              size="xs"
              variant={visibleTypeCodes[code] ? 'filled' : 'outline'}
              color={visibleTypeCodes[code] ? 'orange' : 'gray'}
              onClick={() => dispatch(toggleSpecialUseAirspaceTypeCode(code))}
            >
              {label}
            </Button>
          ))}
        </Group>
      </Box>
    </Stack>
  );
}

export default AirspaceOptions;
