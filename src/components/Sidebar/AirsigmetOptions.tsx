import { Stack, Text, Button, Group, Box, Badge, Divider, Tooltip } from '@mantine/core';
import { FiInfo } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  toggleSigmetHazard,
  toggleGAirmetHazard,
  SigmetHazardType,
  GAirmetHazardType,
} from '@/redux/slices/airsigmetsSlice';
import { BORDER } from '@/constants/surfaces';

interface HazardTypeInfo {
  type: SigmetHazardType;
  label: string;
  color: string;
  description: string;
  details: string;
}

interface GAirmetHazardInfo {
  hazard: GAirmetHazardType;
  label: string;
  color: string;
  description: string;
  details: string;
  category: 'SIERRA' | 'TANGO' | 'ZULU';
}

const sigmetHazardTypes: HazardTypeInfo[] = [
  {
    type: 'CONVECTIVE',
    label: 'Convective',
    color: 'red',
    description: 'Thunderstorms',
    details:
      'Convective SIGMETs warn of active thunderstorms, embedded thunderstorms, lines of thunderstorms, or thunderstorms with hail.',
  },
  {
    type: 'TURB',
    label: 'Turbulence',
    color: 'orange',
    description: 'Severe/Extreme turbulence',
    details:
      'Issued when severe or extreme turbulence is expected. May cause momentary loss of aircraft control.',
  },
  {
    type: 'ICE',
    label: 'Icing',
    color: 'cyan',
    description: 'Severe icing',
    details:
      'Warns of severe icing conditions that can rapidly accumulate ice on aircraft surfaces affecting performance.',
  },
  {
    type: 'IFR',
    label: 'IFR',
    color: 'green',
    description: 'Low visibility',
    details:
      'Visibility below 3 statute miles and/or ceilings below 1000 feet AGL. VFR flight not recommended.',
  },
  {
    type: 'MTN_OBSCN',
    label: 'Mtn Obscn',
    color: 'purple',
    description: 'Mountain obscuration',
    details: 'Mountains obscured by clouds, fog, haze, or precipitation. Terrain not visible.',
  },
];

const gairmetHazards: GAirmetHazardInfo[] = [
  // SIERRA hazards
  {
    hazard: 'IFR',
    label: 'IFR',
    color: 'green',
    description: 'IFR conditions',
    details: 'Ceilings below 1000 ft AGL and/or visibility below 3 statute miles.',
    category: 'SIERRA',
  },
  {
    hazard: 'MT_OBSC',
    label: 'Mtn Obscn',
    color: 'gray',
    description: 'Mountain obscuration',
    details: 'Mountains obscured by clouds, precipitation, or haze.',
    category: 'SIERRA',
  },
  // TANGO hazards
  {
    hazard: 'TURB_LO',
    label: 'Turb Lo',
    color: 'orange',
    description: 'Low-level turbulence',
    details: 'Moderate turbulence below FL180 (18,000 ft).',
    category: 'TANGO',
  },
  {
    hazard: 'TURB_HI',
    label: 'Turb Hi',
    color: 'red',
    description: 'High-level turbulence',
    details: 'Moderate turbulence at or above FL180 (18,000 ft).',
    category: 'TANGO',
  },
  {
    hazard: 'SFC_WIND',
    label: 'Sfc Wind',
    color: 'violet',
    description: 'Strong surface winds',
    details: 'Sustained surface winds 30 knots or greater.',
    category: 'TANGO',
  },
  {
    hazard: 'LLWS',
    label: 'LLWS',
    color: 'yellow',
    description: 'Low-level wind shear',
    details: 'Non-convective low-level wind shear below 2000 ft AGL.',
    category: 'TANGO',
  },
  // ZULU hazards
  {
    hazard: 'ICE',
    label: 'Icing',
    color: 'cyan',
    description: 'Moderate icing',
    details: 'Moderate icing conditions in clouds or precipitation.',
    category: 'ZULU',
  },
  {
    hazard: 'FZLVL',
    label: 'Frzg Lvl',
    color: 'blue',
    description: 'Freezing level',
    details: 'Height of the freezing level (0°C isotherm).',
    category: 'ZULU',
  },
  {
    hazard: 'M_FZLVL',
    label: 'Multi FzLvl',
    color: 'indigo',
    description: 'Multiple freezing levels',
    details: 'Multiple freezing levels due to temperature inversions.',
    category: 'ZULU',
  },
];

export function AirsigmetOptions() {
  const dispatch = useAppDispatch();
  const { sigmetHazards, gairmetHazards: gairmetVisibility } = useAppSelector(
    (state) => state.airsigmet
  );

  const sierraHazards = gairmetHazards.filter((h) => h.category === 'SIERRA');
  const tangoHazards = gairmetHazards.filter((h) => h.category === 'TANGO');
  const zuluHazards = gairmetHazards.filter((h) => h.category === 'ZULU');

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Toggle visibility of weather advisories on the map. Data is fetched only for enabled
        hazard types to optimize performance.
      </Text>

      {/* SIGMETs Section */}
      <Box>
        <Group gap={4} mb={8}>
          <Text size="sm" fw={600} c="white">
            SIGMETs
          </Text>
          <Tooltip
            label="Significant Meteorological Information - hazardous weather for ALL aircraft"
            position="top"
            withArrow
          >
            <Box style={{ display: 'flex', alignItems: 'center', cursor: 'help' }}>
              <FiInfo size={12} color="var(--mantine-color-dimmed)" />
            </Box>
          </Tooltip>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>
          Warnings of significant weather hazardous to all aircraft. Valid for 4 hours.
        </Text>
        <Group gap="xs" mb="sm">
          {sigmetHazardTypes.map(({ type, label, color }) => (
            <Button
              key={type}
              size="xs"
              variant={sigmetHazards[type] ? 'filled' : 'outline'}
              color={sigmetHazards[type] ? color : 'gray'}
              onClick={() => dispatch(toggleSigmetHazard(type))}
            >
              {label}
            </Button>
          ))}
        </Group>
      </Box>

      <Divider color={BORDER.DEFAULT} />

      {/* G-AIRMETs Section */}
      <Box>
        <Group gap={4} mb={8}>
          <Text size="sm" fw={600} c="white">
            G-AIRMETs
          </Text>
          <Tooltip
            label="Graphical Airmen's Meteorological Information - advisories for light aircraft and VFR"
            position="top"
            withArrow
          >
            <Box style={{ display: 'flex', alignItems: 'center', cursor: 'help' }}>
              <FiInfo size={12} color="var(--mantine-color-dimmed)" />
            </Box>
          </Tooltip>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>
          Graphical weather advisories issued every 6 hours with 3-hour forecast snapshots.
        </Text>

        {/* SIERRA - IFR & Mountain */}
        <Text size="xs" c="gray.5" fw={500} mb={4}>
          SIERRA (IFR & Mountain)
        </Text>
        <Group gap="xs" mb="sm">
          {sierraHazards.map(({ hazard, label, color }) => (
            <Button
              key={hazard}
              size="xs"
              variant={gairmetVisibility[hazard] ? 'filled' : 'outline'}
              color={gairmetVisibility[hazard] ? color : 'gray'}
              onClick={() => dispatch(toggleGAirmetHazard(hazard))}
            >
              {label}
            </Button>
          ))}
        </Group>

        {/* TANGO - Turbulence & Wind */}
        <Text size="xs" c="gray.5" fw={500} mb={4}>
          TANGO (Turbulence & Wind)
        </Text>
        <Group gap="xs" mb="sm">
          {tangoHazards.map(({ hazard, label, color }) => (
            <Button
              key={hazard}
              size="xs"
              variant={gairmetVisibility[hazard] ? 'filled' : 'outline'}
              color={gairmetVisibility[hazard] ? color : 'gray'}
              onClick={() => dispatch(toggleGAirmetHazard(hazard))}
            >
              {label}
            </Button>
          ))}
        </Group>

        {/* ZULU - Icing & Freezing */}
        <Text size="xs" c="gray.5" fw={500} mb={4}>
          ZULU (Icing & Freezing)
        </Text>
        <Group gap="xs" mb="sm">
          {zuluHazards.map(({ hazard, label, color }) => (
            <Button
              key={hazard}
              size="xs"
              variant={gairmetVisibility[hazard] ? 'filled' : 'outline'}
              color={gairmetVisibility[hazard] ? color : 'gray'}
              onClick={() => dispatch(toggleGAirmetHazard(hazard))}
            >
              {label}
            </Button>
          ))}
        </Group>
      </Box>

      <Divider color={BORDER.DEFAULT} />

      {/* Legend Section */}
      <Box>
        <Text size="xs" fw={500} c="white" mb={8}>
          Legend
        </Text>

        {/* SIGMET Legend */}
        <Text size="xs" c="dimmed" mb={4}>
          SIGMETs
        </Text>
        <Stack gap={4} mb="sm">
          {sigmetHazardTypes.map(({ type, label, color, description, details }) => (
            <Tooltip key={type} label={details} withArrow position="left" multiline w={250}>
              <Group gap="xs">
                <Badge size="sm" color={color} variant="filled" style={{ minWidth: 75 }}>
                  {label}
                </Badge>
                <Text size="xs" c="dimmed">
                  {description}
                </Text>
              </Group>
            </Tooltip>
          ))}
        </Stack>

        {/* G-AIRMET Legend */}
        <Text size="xs" c="dimmed" mb={4}>
          G-AIRMETs
        </Text>
        <Stack gap={4}>
          {gairmetHazards.map(({ hazard, label, color, description, details }) => (
            <Tooltip key={hazard} label={details} withArrow position="left" multiline w={250}>
              <Group gap="xs">
                <Badge size="sm" color={color} variant="filled" style={{ minWidth: 75 }}>
                  {label}
                </Badge>
                <Text size="xs" c="dimmed">
                  {description}
                </Text>
              </Group>
            </Tooltip>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export default AirsigmetOptions;
