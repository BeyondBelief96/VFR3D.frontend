import { Stack, ScrollArea, Text, Box } from '@mantine/core';
import { Accordion } from '@mantine/core';
import { FiMap, FiNavigation, FiCloud, FiLayers, FiAlertTriangle } from 'react-icons/fi';
import { FaPlaneArrival } from 'react-icons/fa';
import MapOptions from './MapOptions';
import RouteOptions from './RouteOptions';
import AirportOptions from './AirportOptions';
import AirspaceOptions from './AirspaceOptions';
import PirepOptions from './PirepOptions';
import AirsigmetOptions from './AirsigmetOptions';

export function Sidebar() {
  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box pb="md" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <Text size="lg" fw={600} c="white">
          Viewer Settings
        </Text>
        <Text size="xs" c="dimmed">
          Adjust layers, overlays, and route styling
        </Text>
      </Box>

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
              '&[data-active]': {
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
              },
            },
            control: {
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
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
        </Accordion>
      </ScrollArea>
    </Stack>
  );
}

export default Sidebar;
