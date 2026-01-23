import { createFileRoute } from '@tanstack/react-router';
import { Container, Title, Text, Center, Loader, Stack, Card, Group, Button } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { useGetFlightsQuery } from '@/redux/api/vfr3d/flights.api';
import { FiPlus } from 'react-icons/fi';

export const Route = createFileRoute('/flights/')({
  component: FlightsPage,
});

function FlightsPage() {
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const userId = user?.sub || '';

  const { data: flights, isLoading, isError } = useGetFlightsQuery(userId, {
    skip: !userId,
  });

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

  return (
    <Container
      size="lg"
      py="xl"
      style={{ minHeight: '100vh', backgroundColor: 'var(--vfr3d-background)' }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} c="white">
            My Flights
          </Title>
          <Button
            leftSection={<FiPlus />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
            component="a"
            href="/viewer"
          >
            Plan New Flight
          </Button>
        </Group>

        {isLoading && (
          <Center py="xl">
            <Loader size="lg" color="blue" />
          </Center>
        )}

        {isError && (
          <Card bg="red.9" p="md">
            <Text c="white">Error loading flights. Please try again.</Text>
          </Card>
        )}

        {flights && flights.length === 0 && (
          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Stack align="center" gap="md">
              <Text c="dimmed" size="lg">
                You don't have any saved flights yet.
              </Text>
              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                component="a"
                href="/viewer"
              >
                Plan Your First Flight
              </Button>
            </Stack>
          </Card>
        )}

        {flights && flights.length > 0 && (
          <Stack gap="md">
            {flights.map((flight) => (
              <Card
                key={flight.id}
                padding="lg"
                radius="md"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  cursor: 'pointer',
                }}
                component="a"
                href={`/flights/${flight.id}`}
              >
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text c="white" fw={600} size="lg">
                      {flight.name || 'Unnamed Flight'}
                    </Text>
                    <Text c="dimmed" size="sm">
                      {flight.waypoints?.length || 0} waypoints •{' '}
                      {flight.totalRouteDistance?.toFixed(1) || 0} NM
                    </Text>
                  </Stack>
                  <Text c="dimmed" size="sm">
                    {flight.departureTime
                      ? new Date(flight.departureTime).toLocaleDateString()
                      : 'No date'}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
