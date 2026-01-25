import { Stack, Text, Button, Group, Box, Switch, Badge, Divider } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  toggleAirspaceClass,
  toggleSpecialUseAirspaceTypeCode,
  toggleShowRouteAirspaces,
  AirspaceClass,
  SpecialUseAirspaceTypeCode,
} from '@/redux/slices/airspacesSlice';

interface AirspaceClassInfo {
  class: AirspaceClass;
  color: string;
  description: string;
  requirements: string;
}

const airspaceClassInfo: AirspaceClassInfo[] = [
  {
    class: 'B',
    color: 'blue',
    description: 'Busiest airports, SFC-10,000 MSL',
    requirements: 'ATC clearance required',
  },
  {
    class: 'C',
    color: 'violet',
    description: 'Radar approach control, SFC-4,000 AGL',
    requirements: 'Two-way radio required',
  },
  {
    class: 'D',
    color: 'cyan',
    description: 'Control tower, SFC-2,500 AGL',
    requirements: 'Two-way radio required',
  },
];

interface SpecialUseInfo {
  code: SpecialUseAirspaceTypeCode;
  label: string;
  color: string;
  description: string;
}

const specialUseAirspaceInfo: SpecialUseInfo[] = [
  { code: 'MOA', label: 'MOA', color: 'orange', description: 'Military Operations Area - military training' },
  { code: 'R', label: 'Restricted', color: 'red', description: 'Hazardous activities - permission required' },
  { code: 'W', label: 'Warning', color: 'yellow', description: 'Hazardous to nonparticipating aircraft' },
  { code: 'A', label: 'Alert', color: 'grape', description: 'High volume of pilot training or unusual activity' },
  { code: 'P', label: 'Prohibited', color: 'red', description: 'Flight prohibited - national security' },
  { code: 'D', label: 'Danger', color: 'pink', description: 'Danger to aircraft - use caution' },
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
        <Group justify="space-between" mb={4}>
          <Text size="sm" fw={500} c="white">
            Route Airspaces
          </Text>
          <Switch
            checked={showRouteAirspaces}
            onChange={() => dispatch(toggleShowRouteAirspaces())}
            color="blue"
            size="sm"
          />
        </Group>
        <Text size="xs" c="dimmed">
          Show airspaces intersecting your flight route
        </Text>
      </Box>

      <Divider color="rgba(148, 163, 184, 0.2)" />

      {/* Airspace Classes */}
      <Box>
        <Text size="sm" fw={500} c="white" mb={8}>
          Controlled Airspace Classes
        </Text>
        <Group gap="xs" mb="sm">
          {airspaceClassInfo.map(({ class: airspaceClass, color }) => (
            <Button
              key={airspaceClass}
              size="xs"
              variant={visibleClasses[airspaceClass] ? 'filled' : 'outline'}
              color={visibleClasses[airspaceClass] ? color : 'gray'}
              onClick={() => dispatch(toggleAirspaceClass(airspaceClass))}
            >
              Class {airspaceClass}
            </Button>
          ))}
        </Group>
      </Box>

      <Divider color="rgba(148, 163, 184, 0.2)" />

      {/* Special Use Airspaces */}
      <Box>
        <Text size="sm" fw={500} c="white" mb={8}>
          Special Use Airspaces
        </Text>
        <Group gap="xs" mb="sm">
          {specialUseAirspaceInfo.map(({ code, label, color }) => (
            <Button
              key={code}
              size="xs"
              variant={visibleTypeCodes[code] ? 'filled' : 'outline'}
              color={visibleTypeCodes[code] ? color : 'gray'}
              onClick={() => dispatch(toggleSpecialUseAirspaceTypeCode(code))}
            >
              {label}
            </Button>
          ))}
        </Group>
      </Box>

      <Divider color="rgba(148, 163, 184, 0.2)" />

      {/* Legend */}
      <Box>
        <Text size="sm" fw={500} c="white" mb={8}>
          Legend
        </Text>

        {/* Controlled Airspace Legend */}
        <Text size="xs" c="dimmed" mb={4}>
          Controlled Airspace
        </Text>
        <Stack gap={4} mb="sm">
          {airspaceClassInfo.map(({ class: airspaceClass, color, description, requirements }) => (
            <Group key={airspaceClass} gap="xs" wrap="nowrap">
              <Badge size="sm" color={color} variant="filled" style={{ minWidth: 65 }}>
                Class {airspaceClass}
              </Badge>
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="white" lh={1.2}>
                  {description}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {requirements}
                </Text>
              </Box>
            </Group>
          ))}
        </Stack>

        {/* Special Use Legend */}
        <Text size="xs" c="dimmed" mb={4}>
          Special Use Airspace
        </Text>
        <Stack gap={4}>
          {specialUseAirspaceInfo.map(({ code, label, color, description }) => (
            <Group key={code} gap="xs" wrap="nowrap">
              <Badge size="sm" color={color} variant="filled" style={{ minWidth: 65 }}>
                {label}
              </Badge>
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            </Group>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export default AirspaceOptions;
