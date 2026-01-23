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
  Badge,
} from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { useGetAircraftPerformanceProfilesQuery } from '@/redux/api/vfr3d/performanceProfiles.api';
import { FiPlus } from 'react-icons/fi';

export const Route = createFileRoute('/profiles')({
  component: AircraftProfilesPage,
});

function AircraftProfilesPage() {
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const userId = user?.sub || '';

  const { data: profiles, isLoading, isError } = useGetAircraftPerformanceProfilesQuery(userId, {
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
            Aircraft Profiles
          </Title>
          <Button
            leftSection={<FiPlus />}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          >
            New Profile
          </Button>
        </Group>

        {isLoading && (
          <Center py="xl">
            <Loader size="lg" color="blue" />
          </Center>
        )}

        {isError && (
          <Card bg="red.9" p="md">
            <Text c="white">Error loading profiles. Please try again.</Text>
          </Card>
        )}

        {profiles && profiles.length === 0 && (
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
                You don't have any aircraft profiles yet.
              </Text>
              <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 45 }}>
                Create Your First Profile
              </Button>
            </Stack>
          </Card>
        )}

        {profiles && profiles.length > 0 && (
          <Stack gap="md">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                padding="lg"
                radius="md"
                style={{
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text c="white" fw={600} size="lg">
                      {profile.profileName || 'Unnamed Profile'}
                    </Text>
                    <Group gap="xs">
                      <Badge variant="light" color="blue">
                        Cruise: {profile.cruiseTrueAirspeed} kts
                      </Badge>
                      <Badge variant="light" color="cyan">
                        Fuel Burn: {profile.cruiseFuelBurn} gph
                      </Badge>
                    </Group>
                  </Stack>
                  <Button variant="subtle" color="gray">
                    Edit
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
