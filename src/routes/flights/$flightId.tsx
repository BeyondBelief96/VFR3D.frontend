import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Center,
  Loader,
  Stack,
  Card,
  Group,
  Button,
  Tabs,
} from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { useGetFlightQuery } from '@/redux/api/vfr3d/flights.api';
import { FiArrowLeft, FiMap } from 'react-icons/fi';

export const Route = createFileRoute('/flights/$flightId')({
  component: FlightDetailsPage,
});

function FlightDetailsPage() {
  const { flightId } = Route.useParams();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const userId = user?.sub || '';

  const {
    data: flight,
    isLoading,
    isError,
  } = useGetFlightQuery(
    { userId, flightId },
    {
      skip: !userId || !flightId,
    }
  );

  if (authLoading) {
    return (
      <Center h="100vh" bg="var(--vfr3d-background)">
        <Loader size="xl" color="blue" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return (
      <Center h="100vh" bg="var(--vfr3d-background)">
        <Text c="white">Redirecting to login...</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="100vh" bg="var(--vfr3d-background)">
        <Loader size="xl" color="blue" />
      </Center>
    );
  }

  if (isError || !flight) {
    return (
      <Container
        size="lg"
        py="xl"
        style={{ minHeight: '100vh', backgroundColor: 'var(--vfr3d-background)' }}
      >
        <Card bg="red.9" p="md">
          <Text c="white">Error loading flight. Please try again.</Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      size="lg"
      py="xl"
      style={{ minHeight: '100vh', backgroundColor: 'var(--vfr3d-background)' }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group>
            <Button variant="subtle" color="gray" component="a" href="/flights">
              <FiArrowLeft />
            </Button>
            <Title order={1} c="white">
              {flight.name || 'Unnamed Flight'}
            </Title>
          </Group>
          <Button
            leftSection={<FiMap />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            component="a"
            href="/viewer"
          >
            View on Map
          </Button>
        </Group>

        <Card
          padding="lg"
          radius="md"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Tabs defaultValue="overview" color="blue">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="navlog">Nav Log</Tabs.Tab>
              <Tabs.Tab value="airports">Airports</Tabs.Tab>
              <Tabs.Tab value="weather">Weather</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" pt="md">
              <Stack gap="md">
                <Group grow>
                  <Card withBorder p="md">
                    <Text c="dimmed" size="sm">
                      Total Distance
                    </Text>
                    <Text c="white" size="xl" fw={600}>
                      {flight.totalRouteDistance?.toFixed(1) || 0} NM
                    </Text>
                  </Card>
                  <Card withBorder p="md">
                    <Text c="dimmed" size="sm">
                      Flight Time
                    </Text>
                    <Text c="white" size="xl" fw={600}>
                      {flight.totalRouteTimeHours?.toFixed(1) || 0} hrs
                    </Text>
                  </Card>
                  <Card withBorder p="md">
                    <Text c="dimmed" size="sm">
                      Fuel Required
                    </Text>
                    <Text c="white" size="xl" fw={600}>
                      {flight.totalFuelUsed?.toFixed(1) || 0} gal
                    </Text>
                  </Card>
                </Group>
                <Card withBorder p="md">
                  <Text c="dimmed" size="sm" mb="xs">
                    Route
                  </Text>
                  <Text c="white" size="lg">
                    {flight.waypoints?.map((wp) => wp.name).join(' → ') || 'No waypoints'}
                  </Text>
                </Card>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="navlog" pt="md">
              <Text c="dimmed">Nav Log display will be implemented in Phase 8</Text>
            </Tabs.Panel>

            <Tabs.Panel value="airports" pt="md">
              <Text c="dimmed">Airport information will be implemented in Phase 8</Text>
            </Tabs.Panel>

            <Tabs.Panel value="weather" pt="md">
              <Text c="dimmed">Weather information will be implemented in Phase 8</Text>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}
