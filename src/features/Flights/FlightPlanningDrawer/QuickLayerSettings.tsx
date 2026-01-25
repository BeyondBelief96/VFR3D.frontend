import { Box, Group, Text, Switch, Accordion, Slider, Tooltip } from '@mantine/core';
import { FiLayers, FiAlertTriangle, FiCloud } from 'react-icons/fi';
import { GiRadioTower } from 'react-icons/gi';
import { TbAlertTriangle } from 'react-icons/tb';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import {
  toggleShowRouteObstacles,
  toggleShowObstacleLabels,
  setHeightExaggeration,
} from '@/redux/slices/obstaclesSlice';
import {
  toggleShowRouteAirspaces,
  toggleAirspaceClass,
  AirspaceClass,
} from '@/redux/slices/airspacesSlice';
import { setShowCloudBases } from '@/redux/slices/airportsSlice';
import {
  toggleSigmetHazard,
  toggleGAirmetHazard,
  SigmetHazardType,
  GAirmetHazardType,
} from '@/redux/slices/airsigmetsSlice';

const airspaceClasses: AirspaceClass[] = ['B', 'C', 'D'];

interface SigmetToggle {
  type: SigmetHazardType;
  label: string;
  color: string;
  tooltip: string;
}

interface GairmetToggle {
  hazard: GAirmetHazardType;
  label: string;
  color: string;
  tooltip: string;
}

const sigmetToggles: SigmetToggle[] = [
  { type: 'CONVECTIVE', label: 'Convective', color: '#ef4444', tooltip: 'Thunderstorms and convective activity' },
  { type: 'ICE', label: 'Icing', color: '#22d3ee', tooltip: 'Severe icing conditions' },
  { type: 'TURB', label: 'Turbulence', color: '#f97316', tooltip: 'Severe/extreme turbulence' },
];

// Key G-AIRMET hazards for quick access (subset of all available)
const gairmetToggles: GairmetToggle[] = [
  { hazard: 'IFR', label: 'IFR', color: '#10b981', tooltip: 'IFR conditions - ceiling <1000ft, vis <3SM' },
  { hazard: 'TURB_LO', label: 'Turb Lo', color: '#f97316', tooltip: 'Low-level turbulence below FL180' },
  { hazard: 'ICE', label: 'Icing', color: '#22d3ee', tooltip: 'Moderate icing conditions' },
  { hazard: 'SFC_WIND', label: 'Sfc Wind', color: '#a855f7', tooltip: 'Surface winds 30+ knots' },
];

export function QuickLayerSettings() {
  const dispatch = useAppDispatch();

  const { showRouteObstacles, showObstacleLabels, heightExaggeration } = useAppSelector(
    (state) => state.obstacles
  );

  const { showRouteAirspaces, visibleClasses } = useAppSelector((state) => state.airspaces);

  const { showCloudBases } = useAppSelector((state) => state.airport);

  const { sigmetHazards, gairmetHazards } = useAppSelector((state) => state.airsigmet);

  return (
    <Box
      p="sm"
      mb="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 'var(--mantine-radius-md)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Group gap={4} mb="xs">
        <FiLayers size={14} color="var(--mantine-color-blue-5)" />
        <Text size="xs" fw={600} c="white">
          Quick Layer Settings
        </Text>
      </Group>

      <Accordion
        variant="filled"
        radius="sm"
        styles={{
          item: {
            backgroundColor: 'transparent',
            border: 'none',
          },
          control: {
            backgroundColor: 'transparent',
            padding: '4px 0',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
          label: {
            padding: 0,
          },
          content: {
            padding: '8px 0 16px 0',
          },
          chevron: {
            color: 'var(--mantine-color-gray-5)',
          },
        }}
      >
        {/* Weather Advisories Section */}
        <Accordion.Item value="advisories">
          <Accordion.Control>
            <Group gap="xs">
              <TbAlertTriangle size={14} color="#f59e0b" />
              <Text size="sm" c="white">
                Weather Advisories
              </Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Box pl="md">
              {/* SIGMETs */}
              <Text size="xs" c="dimmed" mb={4}>
                SIGMETs
              </Text>
              <Group gap={4} mb="sm">
                {sigmetToggles.map(({ type, label, color, tooltip }) => (
                  <Tooltip key={type} label={tooltip} withArrow position="top">
                    <Box
                      onClick={() => dispatch(toggleSigmetHazard(type))}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        backgroundColor: sigmetHazards[type]
                          ? color
                          : 'rgba(148, 163, 184, 0.2)',
                        border: sigmetHazards[type]
                          ? 'none'
                          : '1px solid rgba(148, 163, 184, 0.3)',
                      }}
                    >
                      <Text size="xs" c="white">
                        {label}
                      </Text>
                    </Box>
                  </Tooltip>
                ))}
              </Group>

              {/* G-AIRMETs */}
              <Text size="xs" c="dimmed" mb={4}>
                G-AIRMETs
              </Text>
              <Group gap={4}>
                {gairmetToggles.map(({ hazard, label, color, tooltip }) => (
                  <Tooltip key={hazard} label={tooltip} withArrow position="top">
                    <Box
                      onClick={() => dispatch(toggleGAirmetHazard(hazard))}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        backgroundColor: gairmetHazards[hazard]
                          ? color
                          : 'rgba(148, 163, 184, 0.2)',
                        border: gairmetHazards[hazard]
                          ? 'none'
                          : '1px solid rgba(148, 163, 184, 0.3)',
                      }}
                    >
                      <Text size="xs" c="white">
                        {label}
                      </Text>
                    </Box>
                  </Tooltip>
                ))}
              </Group>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Obstacles Section */}
        <Accordion.Item value="obstacles">
          <Accordion.Control>
            <Group gap="xs">
              <GiRadioTower size={14} color="#ef4444" />
              <Text size="sm" c="white">
                Obstacles
              </Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Box pl="md">
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed">
                  Show Route Obstacles
                </Text>
                <Switch
                  checked={showRouteObstacles}
                  onChange={() => dispatch(toggleShowRouteObstacles(!showRouteObstacles))}
                  color="orange"
                  size="xs"
                />
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed">
                  Show Labels
                </Text>
                <Switch
                  checked={showObstacleLabels}
                  onChange={() => dispatch(toggleShowObstacleLabels(!showObstacleLabels))}
                  color="blue"
                  size="xs"
                />
              </Group>

              <Text size="xs" c="dimmed" mb={2}>
                Height Exaggeration ({heightExaggeration}x)
              </Text>
              <Text size="xs" c="yellow.5" mb={6}>
                1x shows true heights. Higher values exaggerate for visibility only.
              </Text>
              <Slider
                value={heightExaggeration}
                onChange={(val) => dispatch(setHeightExaggeration(val))}
                min={1}
                max={10}
                step={1}
                size="xs"
                color="orange"
                marks={[
                  { value: 1, label: '1x' },
                  { value: 5, label: '5x' },
                  { value: 10, label: '10x' },
                ]}
                styles={{
                  markLabel: { fontSize: 10, color: 'var(--mantine-color-dimmed)' },
                }}
              />
            </Box>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Airspaces Section */}
        <Accordion.Item value="airspaces">
          <Accordion.Control>
            <Group gap="xs">
              <FiAlertTriangle size={14} color="#ec4899" />
              <Text size="sm" c="white">
                Airspaces
              </Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Box pl="md">
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed">
                  Show Route Airspaces
                </Text>
                <Switch
                  checked={showRouteAirspaces}
                  onChange={() => dispatch(toggleShowRouteAirspaces())}
                  color="blue"
                  size="xs"
                />
              </Group>

              <Text size="xs" c="dimmed" mb={4}>
                Airspace Classes
              </Text>
              <Group gap={4}>
                {airspaceClasses.map((airspaceClass) => (
                  <Box
                    key={airspaceClass}
                    onClick={() => dispatch(toggleAirspaceClass(airspaceClass))}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      backgroundColor: visibleClasses[airspaceClass]
                        ? 'var(--mantine-color-blue-6)'
                        : 'rgba(148, 163, 184, 0.2)',
                      border: visibleClasses[airspaceClass]
                        ? 'none'
                        : '1px solid rgba(148, 163, 184, 0.3)',
                    }}
                  >
                    <Text size="xs" c="white">
                      {airspaceClass}
                    </Text>
                  </Box>
                ))}
              </Group>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Weather Section */}
        <Accordion.Item value="weather">
          <Accordion.Control>
            <Group gap="xs">
              <FiCloud size={14} color="#3b82f6" />
              <Text size="sm" c="white">
                Weather
              </Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Box pl="md">
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed">
                  Show Cloud Base Labels
                </Text>
                <Switch
                  checked={showCloudBases}
                  onChange={() => dispatch(setShowCloudBases(!showCloudBases))}
                  color="blue"
                  size="xs"
                />
              </Group>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}

export default QuickLayerSettings;
