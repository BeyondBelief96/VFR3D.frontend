import { createFileRoute } from '@tanstack/react-router';
import { Container, Title, Text, Stack, Card, Group, Box, Badge, SimpleGrid } from '@mantine/core';
import { FiMap, FiCloud, FiNavigation, FiList, FiSettings, FiLayers } from 'react-icons/fi';

export const Route = createFileRoute('/features')({
  component: FeaturesPage,
});

const features = [
  {
    icon: FiMap,
    title: '3D Globe Visualization',
    description:
      'View your flight path on a realistic 3D globe powered by Cesium. Pan, zoom, and rotate to see your route from any angle.',
    color: 'blue',
  },
  {
    icon: FiLayers,
    title: 'FAA Charts',
    description:
      'Overlay official FAA VFR Sectional, Terminal Area, and IFR charts directly on the globe for accurate navigation planning.',
    color: 'cyan',
  },
  {
    icon: FiCloud,
    title: 'Real-Time Weather',
    description:
      'Access live METARs, TAFs, PIREPs, and AIRMETs/SIGMETs to make informed go/no-go decisions for your flight.',
    color: 'green',
  },
  {
    icon: FiNavigation,
    title: 'Airspace Awareness',
    description:
      'Visualize Class B, C, D, and E airspaces, as well as special use areas like MOAs and restricted zones along your route.',
    color: 'orange',
  },
  {
    icon: FiList,
    title: 'Navigation Log',
    description:
      'Generate comprehensive nav logs with magnetic headings, distances, estimated times, and fuel calculations for each leg.',
    color: 'purple',
  },
  {
    icon: FiSettings,
    title: 'Aircraft Profiles',
    description:
      'Save multiple aircraft performance profiles with climb, cruise, and descent parameters for accurate flight planning.',
    color: 'pink',
  },
];

function FeaturesPage() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      <Container size="lg" py={100}>
        <Stack gap="xl">
          <Stack align="center" gap="md">
            <Badge size="lg" variant="light" color="blue">
              Features
            </Badge>
            <Title order={1} c="white" ta="center">
              Everything You Need for VFR Planning
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={600}>
              VFR3D combines powerful visualization with comprehensive aviation data to make your
              flight planning experience seamless and intuitive.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {features.map((feature) => (
              <Card
                key={feature.title}
                padding="lg"
                radius="md"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <Stack gap="md">
                  <Group>
                    <Box
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: `var(--mantine-color-${feature.color}-9)`,
                      }}
                    >
                      <feature.icon size={24} color="white" />
                    </Box>
                  </Group>
                  <Title order={3} c="white" size="h4">
                    {feature.title}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
