import { ActionIcon, Box, Group, Popover, Slider, Switch, Tabs, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FiLayers, FiAlertTriangle } from 'react-icons/fi';
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
import { SURFACE, BORDER, HIGHLIGHT, ICON_BG, THEME_COLORS } from '@/constants/surfaces';

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
  { type: 'CONVECTIVE', label: 'Conv', color: '#ef4444', tooltip: 'Thunderstorms and convective activity' },
  { type: 'ICE', label: 'Ice', color: '#22d3ee', tooltip: 'Severe icing conditions' },
  { type: 'TURB', label: 'Turb', color: '#f97316', tooltip: 'Severe/extreme turbulence' },
];

const gairmetToggles: GairmetToggle[] = [
  { hazard: 'IFR', label: 'IFR', color: '#10b981', tooltip: 'IFR conditions - ceiling <1000ft, vis <3SM' },
  { hazard: 'TURB_LO', label: 'Turb', color: '#f97316', tooltip: 'Low-level turbulence below FL180' },
  { hazard: 'ICE', label: 'Ice', color: '#22d3ee', tooltip: 'Moderate icing conditions' },
  { hazard: 'SFC_WIND', label: 'Wind', color: '#a855f7', tooltip: 'Surface winds 30+ knots' },
];

const buttonStyles = {
  root: {
    backgroundColor: SURFACE.GLASS,
    border: 'none',
    '&:hover': {
      backgroundColor: HIGHLIGHT.STRONG,
    },
  },
};

export function LayerTogglePopover() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const dispatch = useAppDispatch();

  const { showRouteObstacles, showObstacleLabels, heightExaggeration } = useAppSelector(
    (state) => state.obstacles
  );
  const { showRouteAirspaces, visibleClasses } = useAppSelector((state) => state.airspaces);
  const { showCloudBases } = useAppSelector((state) => state.airport);
  const { sigmetHazards, gairmetHazards } = useAppSelector((state) => state.airsigmet);

  return (
    <Popover
      opened={opened}
      onClose={close}
      position="bottom"
      withArrow
      shadow="lg"
      styles={{
        dropdown: {
          backgroundColor: SURFACE.POPOVER,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${BORDER.DEFAULT}`,
          maxWidth: 320,
          zIndex: 100,
        },
        arrow: {
          backgroundColor: SURFACE.POPOVER,
          border: `1px solid ${BORDER.DEFAULT}`,
        },
      }}
    >
      <Popover.Target>
        <Tooltip label="Layer Settings" position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={toggle}
            styles={buttonStyles}
          >
            <FiLayers size={18} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <Tabs
          defaultValue="advisories"
          styles={{
            root: { width: '100%' },
            list: {
              borderBottom: `1px solid ${BORDER.DEFAULT}`,
              gap: 0,
            },
            tab: {
              color: THEME_COLORS.TEXT_MUTED,
              padding: '6px 8px',
              fontSize: 11,
              '&[data-active]': {
                color: THEME_COLORS.BLUE_4,
                borderColor: THEME_COLORS.PRIMARY,
              },
              '&:hover': {
                backgroundColor: HIGHLIGHT.LIGHT,
              },
            },
            panel: {
              padding: '10px 0 0 0',
            },
          }}
        >
          <Tabs.List grow>
            <Tabs.Tab value="advisories" leftSection={<TbAlertTriangle size={12} />}>
              Wx
            </Tabs.Tab>
            <Tabs.Tab value="obstacles" leftSection={<GiRadioTower size={12} />}>
              Obs
            </Tabs.Tab>
            <Tabs.Tab value="airspaces" leftSection={<FiAlertTriangle size={12} />}>
              Air
            </Tabs.Tab>
          </Tabs.List>

          {/* Weather Advisories Tab */}
          <Tabs.Panel value="advisories">
            <Group justify="space-between" mb="sm">
              <Text size="xs" c="gray.4">
                Cloud Base Labels
              </Text>
              <Switch
                checked={showCloudBases}
                onChange={() => dispatch(setShowCloudBases(!showCloudBases))}
                color="blue"
                size="xs"
              />
            </Group>

            <Text size="xs" c="gray.4" mb={4}>
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
                      backgroundColor: sigmetHazards[type] ? color : ICON_BG.NEUTRAL,
                      border: sigmetHazards[type] ? 'none' : `1px solid ${BORDER.STRONG}`,
                    }}
                  >
                    <Text size="xs" c="white">
                      {label}
                    </Text>
                  </Box>
                </Tooltip>
              ))}
            </Group>

            <Text size="xs" c="gray.4" mb={4}>
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
                      backgroundColor: gairmetHazards[hazard] ? color : ICON_BG.NEUTRAL,
                      border: gairmetHazards[hazard] ? 'none' : `1px solid ${BORDER.STRONG}`,
                    }}
                  >
                    <Text size="xs" c="white">
                      {label}
                    </Text>
                  </Box>
                </Tooltip>
              ))}
            </Group>
          </Tabs.Panel>

          {/* Obstacles Tab */}
          <Tabs.Panel value="obstacles">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="gray.4">
                Route Obstacles
              </Text>
              <Switch
                checked={showRouteObstacles}
                onChange={() => dispatch(toggleShowRouteObstacles(!showRouteObstacles))}
                color="orange"
                size="xs"
              />
            </Group>

            <Group justify="space-between" mb="xs">
              <Text size="xs" c="gray.4">
                Show Labels
              </Text>
              <Switch
                checked={showObstacleLabels}
                onChange={() => dispatch(toggleShowObstacleLabels(!showObstacleLabels))}
                color="blue"
                size="xs"
              />
            </Group>

            <Text size="xs" c="gray.4" mb={2}>
              Height Exag. ({heightExaggeration}x)
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
                markLabel: { fontSize: 9, color: THEME_COLORS.TEXT_LIGHT },
              }}
              mb={16}
            />
          </Tabs.Panel>

          {/* Airspaces Tab */}
          <Tabs.Panel value="airspaces">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="gray.4">
                Route Airspaces
              </Text>
              <Switch
                checked={showRouteAirspaces}
                onChange={() => dispatch(toggleShowRouteAirspaces())}
                color="blue"
                size="xs"
              />
            </Group>

            <Text size="xs" c="gray.4" mb={4}>
              Classes
            </Text>
            <Group gap={4}>
              {airspaceClasses.map((airspaceClass) => (
                <Box
                  key={airspaceClass}
                  onClick={() => dispatch(toggleAirspaceClass(airspaceClass))}
                  style={{
                    padding: '2px 10px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    backgroundColor: visibleClasses[airspaceClass]
                      ? THEME_COLORS.PRIMARY_DARK
                      : ICON_BG.NEUTRAL,
                    border: visibleClasses[airspaceClass]
                      ? 'none'
                      : `1px solid ${BORDER.STRONG}`,
                  }}
                >
                  <Text size="xs" c="white">
                    {airspaceClass}
                  </Text>
                </Box>
              ))}
            </Group>
          </Tabs.Panel>

        </Tabs>
      </Popover.Dropdown>
    </Popover>
  );
}

export default LayerTogglePopover;
