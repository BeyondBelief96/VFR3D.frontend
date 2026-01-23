import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Card,
  Badge,
  Box,
} from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      {/* Hero Section */}
      <Container size="lg" py={100}>
        <Stack align="center" gap="xl">
          <Badge size="lg" variant="light" color="blue">
            VFR Flight Planning
          </Badge>

          <Title
            order={1}
            ta="center"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: 'white',
            }}
          >
            Plan Your Flight in{' '}
            <Text
              component="span"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              inherit
            >
              3D
            </Text>
          </Title>

          <Text size="xl" c="dimmed" ta="center" maw={600} style={{ lineHeight: 1.6 }}>
            Experience VFR flight planning like never before. Visualize your route on a 3D globe
            with real-time weather, airspace data, and comprehensive navigation tools.
          </Text>

          <Group mt="xl">
            {!isAuthenticated ? (
              <Button
                size="xl"
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                loading={isLoading}
                onClick={() => loginWithRedirect()}
              >
                Get Started
              </Button>
            ) : (
              <Button
                size="xl"
                radius="md"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                component="a"
                href="/viewer"
              >
                Open Viewer
              </Button>
            )}
            <Button size="xl" radius="md" variant="outline" color="gray">
              Learn More
            </Button>
          </Group>
        </Stack>
      </Container>

      {/* Features Preview */}
      <Container size="lg" pb={100}>
        <Stack gap="xl">
          <Title order={2} ta="center" c="white">
            Everything You Need
          </Title>

          <Group grow gap="lg" style={{ flexWrap: 'wrap' }}>
            <FeatureCard
              title="3D Globe Visualization"
              description="View your flight path on a realistic 3D globe with FAA sectional and terminal charts."
            />
            <FeatureCard
              title="Real-Time Weather"
              description="Access live METARs, TAFs, PIREPs, and AIRMETs/SIGMETs for informed decision making."
            />
            <FeatureCard
              title="Airspace Awareness"
              description="Visualize Class B, C, D, E airspaces and special use areas along your route."
            />
          </Group>

          <Group grow gap="lg" style={{ flexWrap: 'wrap' }}>
            <FeatureCard
              title="Navigation Log"
              description="Generate comprehensive nav logs with headings, distances, times, and fuel calculations."
            />
            <FeatureCard
              title="Aircraft Profiles"
              description="Save multiple aircraft performance profiles for accurate flight calculations."
            />
            <FeatureCard
              title="Flight Management"
              description="Save, edit, and manage all your flight plans in one place."
            />
          </Group>
        </Stack>
      </Container>
    </Box>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <Card
      padding="lg"
      radius="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        minWidth: 280,
      }}
    >
      <Stack gap="sm">
        <Title order={4} c="white">
          {title}
        </Title>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Card>
  );
}
