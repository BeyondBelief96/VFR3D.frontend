import { Stack, ScrollArea, Text, Box, ActionIcon, Group } from '@mantine/core';
import { Accordion } from '@mantine/core';
import { FiMap, FiNavigation, FiCloud, FiLayers, FiAlertTriangle, FiX } from 'react-icons/fi';
import { FaPlaneArrival } from 'react-icons/fa';
import { GiRadioTower } from 'react-icons/gi';
import MapOptions from './MapOptions';
import RouteOptions from './RouteOptions';
import AirportOptions from './AirportOptions';
import AirspaceOptions from './AirspaceOptions';
import PirepOptions from './PirepOptions';
import AirsigmetOptions from './AirsigmetOptions';
import ObstacleOptions from './ObstacleOptions';
import classes from './Sidebar.module.css';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <Stack gap={0} h="100%" p="md" bg="var(--mantine-color-vfr3dSurface-9)">
      {/* Header */}
      <Group justify="space-between" pb="md" className={classes.headerBorder}>
        <Box>
          <Text size="lg" fw={600} c="white">
            Map Settings
          </Text>
          <Text size="xs" c="dimmed">
            Layers, overlays, and styling
          </Text>
        </Box>
        <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label="Close sidebar">
          <FiX size={20} />
        </ActionIcon>
      </Group>

      {/* Scrollable Content */}
      <ScrollArea flex={1} pt="md" scrollbarSize={6}>
        <Accordion
          multiple
          variant="separated"
          radius="md"
          styles={{
            item: {
              backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            },
            control: {
              backgroundColor: 'transparent',
            },
            label: {
              color: 'white',
              fontWeight: 500,
            },
            content: {
              paddingTop: 8,
            },
            chevron: {
              color: 'var(--mantine-color-gray-5)',
            },
          }}
        >
          <Accordion.Item value="map">
            <Accordion.Control icon={<FiMap size={18} color="var(--mantine-color-vfr3dBlue-5)" />}>
              Map
            </Accordion.Control>
            <Accordion.Panel>
              <MapOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="route">
            <Accordion.Control
              icon={<FiNavigation size={18} color="var(--mantine-color-vfrGreen-5)" />}
            >
              Route Colors
            </Accordion.Control>
            <Accordion.Panel>
              <RouteOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="airports">
            <Accordion.Control
              icon={<FaPlaneArrival size={18} color="var(--mantine-color-warningYellow-5)" />}
            >
              Airports
            </Accordion.Control>
            <Accordion.Panel>
              <AirportOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="pireps">
            <Accordion.Control
              icon={<FiCloud size={18} color="var(--mantine-color-lifrPurple-5)" />}
            >
              PIREPs
            </Accordion.Control>
            <Accordion.Panel>
              <PirepOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="airspaces">
            <Accordion.Control icon={<FiLayers size={18} color="var(--mantine-color-pink-5)" />}>
              Airspaces
            </Accordion.Control>
            <Accordion.Panel>
              <AirspaceOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="airsigmets">
            <Accordion.Control
              icon={<FiAlertTriangle size={18} color="var(--mantine-color-orange-5)" />}
            >
              AIRMETs / SIGMETs
            </Accordion.Control>
            <Accordion.Panel>
              <AirsigmetOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="obstacles">
            <Accordion.Control
              icon={<GiRadioTower size={18} color="var(--mantine-color-ifrRed-5)" />}
            >
              Obstacles
            </Accordion.Control>
            <Accordion.Panel>
              <ObstacleOptions />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </ScrollArea>
    </Stack>
  );
}

export default Sidebar;
