import { useEffect, useState } from 'react';
import { Stack, ScrollArea, Text, Box, ActionIcon, Group, Paper } from '@mantine/core';
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

interface SidebarProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

export function Sidebar({ isOpen, toggleOpen }: SidebarProps) {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAnimationClass('translateX(0)');
    } else {
      setAnimationClass('translateX(-100%)');
    }
  }, [isOpen]);

  return (
    <Box
      style={{
        position: 'fixed',
        top: 60,
        left: 0,
        bottom: 0,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Sidebar container */}
      <Paper
        shadow="xl"
        radius={0}
        style={{
          position: 'relative',
          width: 320,
          height: '100%',
          transform: animationClass,
          transition: 'transform 0.3s ease-in-out',
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          pointerEvents: 'auto',
        }}
      >
        <Stack gap={0} h="100%" p="md">
          {/* Header */}
          <Group justify="space-between" pb="md" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <Box>
              <Text size="lg" fw={600} c="white">
                Viewer Settings
              </Text>
              <Text size="xs" c="dimmed">
                Adjust layers, overlays, and route styling
              </Text>
            </Box>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={toggleOpen}
            >
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
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
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
            <Accordion.Control icon={<FiMap size={18} color="var(--vfr3d-primary)" />}>
              Map
            </Accordion.Control>
            <Accordion.Panel>
              <MapOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="route">
            <Accordion.Control icon={<FiNavigation size={18} color="var(--vfr3d-secondary)" />}>
              Route Colors
            </Accordion.Control>
            <Accordion.Panel>
              <RouteOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="airports">
            <Accordion.Control icon={<FaPlaneArrival size={18} color="var(--vfr3d-accent)" />}>
              Airports
            </Accordion.Control>
            <Accordion.Panel>
              <AirportOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="pireps">
            <Accordion.Control icon={<FiCloud size={18} color="#a855f7" />}>
              PIREPs
            </Accordion.Control>
            <Accordion.Panel>
              <PirepOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="airspaces">
            <Accordion.Control icon={<FiLayers size={18} color="#ec4899" />}>
              Airspaces
            </Accordion.Control>
            <Accordion.Panel>
              <AirspaceOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="airsigmets">
            <Accordion.Control icon={<FiAlertTriangle size={18} color="#f97316" />}>
              AIRMETs / SIGMETs
            </Accordion.Control>
            <Accordion.Panel>
              <AirsigmetOptions />
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="obstacles">
            <Accordion.Control icon={<GiRadioTower size={18} color="#ef4444" />}>
              Obstacles
            </Accordion.Control>
            <Accordion.Panel>
              <ObstacleOptions />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
          </ScrollArea>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Sidebar;
