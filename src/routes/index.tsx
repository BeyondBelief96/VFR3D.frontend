import { createFileRoute, Link } from '@tanstack/react-router';
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
  Image,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Paper,
  rem,
} from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import {
  FiMap,
  FiCloud,
  FiFileText,
  FiSettings,
  FiFolder,
  FiLayers,
  FiInfo,
  FiCheckCircle,
  FiArrowRight,
  FiCompass,
} from 'react-icons/fi';
import { GiRadioTower, GiAirplaneDeparture } from 'react-icons/gi';
import { TbPlane, TbRoute, TbMapPin } from 'react-icons/tb';
import logo from '@/assets/images/logo_2.png';
import heroImage from '@/assets/images/hero.png';
import weatherImage from '@/assets/images/weather.png';
import obstaclesImage from '@/assets/images/obstacles.png';
import flightPlannerImage from '@/assets/images/flight-planner.png';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0f1a 0%, #0f172a 30%, #1e293b 70%, #0f172a 100%)',
      }}
    >
      {/* Hero Section */}
      <Box
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: rem(40),
          paddingBottom: rem(80),
        }}
      >
        {/* Background Pattern */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }}
        />

        <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap="xl">
            {/* Logo */}
            <Image
              src={logo}
              alt="VFR3D Logo"
              w={280}
              fit="contain"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))',
              }}
            />

            {/* Tagline Badge */}
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              style={{ textTransform: 'none', fontSize: rem(14) }}
            >
              Plan, Fly, Repeat
            </Badge>

            {/* Main Headline */}
            <Title
              order={1}
              ta="center"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
              }}
            >
              Experience VFR Flight Planning{' '}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: '#3b82f6', to: '#06b6d4', deg: 45 }}
                inherit
              >
                in Stunning 3D
              </Text>
            </Title>

            {/* Subtitle */}
            <Text
              size="xl"
              c="dimmed"
              ta="center"
              maw={700}
              style={{ lineHeight: 1.7, fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
            >
              Plan your VFR routes on an interactive 3D globe with real-time weather,
              comprehensive airspace visualization, and professional navigation tools.
              Designed for weekend pilots who demand clarity and precision.
            </Text>

            {/* CTA Buttons */}
            <Group mt="xl" gap="md">
              {!isAuthenticated ? (
                <Button
                  size="xl"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  loading={isLoading}
                  onClick={() => loginWithRedirect()}
                  rightSection={<FiArrowRight size={20} />}
                  style={{ fontWeight: 600 }}
                >
                  Get Started Free
                </Button>
              ) : (
                <Button
                  size="xl"
                  radius="md"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  component={Link}
                  to="/viewer"
                  rightSection={<FiArrowRight size={20} />}
                  style={{ fontWeight: 600 }}
                >
                  Open Flight Planner
                </Button>
              )}
              <Button
                size="xl"
                radius="md"
                variant="outline"
                color="gray"
                component="a"
                href="#features"
                style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}
              >
                Explore Features
              </Button>
            </Group>

            {/* Quick Stats */}
            <Group gap={50} mt={60}>
              <StatItem value="3D" label="Globe Visualization" />
              <StatItem value="Live" label="Weather Data" />
              <StatItem value="All US" label="Airports" />
              <StatItem value="Free" label="To Start" />
            </Group>

          </Stack>
        </Container>

        {/* Hero Image - Full Width */}
        <Container size="xl" mt={60} pb={40}>
          <Paper
            radius="lg"
            style={{
              overflow: 'hidden',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6)',
            }}
          >
            <Image
              src={heroImage}
              alt="VFR3D 3D Flight Planning Interface"
              style={{ width: '100%', display: 'block' }}
            />
          </Paper>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" py={100}>
        <Container size="lg">
          <Stack gap={60}>
            {/* Section Header */}
            <Stack align="center" gap="md">
              <Badge size="md" variant="light" color="blue">
                Comprehensive Tools
              </Badge>
              <Title order={2} ta="center" c="white" style={{ fontSize: rem(36) }}>
                Everything You Need for VFR Flight Planning
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={600}>
                From route visualization to weather briefing, VFR3D provides all the tools
                a pilot needs for safe and efficient flight planning.
              </Text>
            </Stack>

            {/* Feature Cards Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              <FeatureCard
                icon={<FiMap size={28} />}
                color="blue"
                title="3D Map Visualization"
                description="Plan your routes on an immersive 3D globe with FAA VFR Sectionals, Terminal Area Charts, and IFR Enroute charts seamlessly integrated."
                features={[
                  'High-resolution 3D terrain',
                  'Multiple chart overlays',
                  'Satellite imagery integration',
                ]}
              />
              <FeatureCard
                icon={<FiLayers size={28} />}
                color="violet"
                title="3D Airspace Visualization"
                description="See all airspace classes rendered in 3D with accurate vertical limits. Never be surprised by airspace along your route."
                features={[
                  'Class B, C, D, E airspaces',
                  'MOA, Restricted, Prohibited areas',
                  'Precise altitude depiction',
                ]}
              />
              <FeatureCard
                icon={<FiCloud size={28} />}
                color="cyan"
                title="Real-Time Weather"
                description="Access live weather data including METARs, TAFs, PIREPs, AIRMETs and SIGMETs with color-coded flight categories."
                features={[
                  'Decoded METAR & TAF',
                  '3D PIREP visualization',
                  'SIGMET/G-AIRMET polygons',
                ]}
              />
              <FeatureCard
                icon={<TbRoute size={28} />}
                color="orange"
                title="Interactive Route Planning"
                description="Build your flight route with intuitive point-and-click waypoints. Drag and drop to adjust, with real-time distance calculations."
                features={[
                  'Custom waypoint support',
                  'Drag-and-drop editing',
                  'Airport & navaid search',
                ]}
              />
              <FeatureCard
                icon={<FiFileText size={28} />}
                color="green"
                title="Navigation Log Generation"
                description="Generate professional VFR navigation logs with accurate headings, times, and fuel calculations based on winds aloft."
                features={[
                  'Real winds aloft data',
                  'Fuel burn calculations',
                  'PDF export ready',
                ]}
              />
              <FeatureCard
                icon={<FiInfo size={28} />}
                color="pink"
                title="Airport Information"
                description="Access comprehensive data for all US airports including runways, frequencies, diagrams, and chart supplements."
                features={[
                  'Runway details & lighting',
                  'Communication frequencies',
                  'Official FAA diagrams',
                ]}
              />
              <FeatureCard
                icon={<GiRadioTower size={28} />}
                color="red"
                title="Obstacle Awareness"
                description="View obstacles along your route with accurate heights and positions. Stay aware of towers, antennas, and other hazards."
                features={[
                  'FAA obstacle database',
                  'Height visualization',
                  'Lighting information',
                ]}
              />
              <FeatureCard
                icon={<FiSettings size={28} />}
                color="grape"
                title="Aircraft Performance Profiles"
                description="Create and save multiple aircraft profiles with climb, cruise, and descent performance for accurate calculations."
                features={[
                  'Multiple aircraft support',
                  'Fuel burn rates',
                  'Speed & climb profiles',
                ]}
              />
              <FeatureCard
                icon={<FiFolder size={28} />}
                color="teal"
                title="Flight Management"
                description="Save, view, and manage all your planned flights. Edit routes, update departure times, and regenerate nav logs anytime."
                features={[
                  'Cloud-saved flights',
                  'Easy flight editing',
                  'Route visualization',
                ]}
              />
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={100} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Container size="lg">
          <Stack gap={60}>
            <Stack align="center" gap="md">
              <Badge size="md" variant="light" color="cyan">
                Simple Workflow
              </Badge>
              <Title order={2} ta="center" c="white" style={{ fontSize: rem(36) }}>
                Plan Your Flight in Minutes
              </Title>
              <Text size="lg" c="dimmed" ta="center" maw={600}>
                VFR3D streamlines your pre-flight planning with an intuitive workflow.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="xl">
              <StepCard
                step={1}
                icon={<TbMapPin size={32} />}
                title="Select Airports"
                description="Search and select your departure and destination airports from our comprehensive database."
              />
              <StepCard
                step={2}
                icon={<TbRoute size={32} />}
                title="Plan Your Route"
                description="Add waypoints, visualize airspaces, and customize your path on the interactive 3D map."
              />
              <StepCard
                step={3}
                icon={<FiCompass size={32} />}
                title="Review Weather"
                description="Check METARs, TAFs, and weather advisories for all airports and along your route."
              />
              <StepCard
                step={4}
                icon={<GiAirplaneDeparture size={32} />}
                title="Generate Nav Log"
                description="Get your complete navigation log with headings, times, fuel, and export to PDF."
              />
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Weather Features Highlight */}
      <Box py={100}>
        <Container size="lg">
          <Stack gap={50}>
            {/* Header and Feature List */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              <Stack gap="xl">
                <Badge size="md" variant="light" color="cyan" w="fit-content">
                  Weather Intelligence
                </Badge>
                <Title order={2} c="white" style={{ fontSize: rem(32) }}>
                  Make Informed Go/No-Go Decisions
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  VFR3D gives you the weather picture you need. See current conditions,
                  forecasts, and pilot reports all visualized on your route.
                </Text>
              </Stack>
              <SimpleGrid cols={2} spacing="md">
                <FeatureListItem
                  color="cyan"
                  title="Color-coded flight categories"
                  description="VFR, MVFR, IFR, LIFR at a glance"
                />
                <FeatureListItem
                  color="cyan"
                  title="3D PIREP visualization"
                  description="Pilot reports at actual locations"
                />
                <FeatureListItem
                  color="cyan"
                  title="SIGMET & G-AIRMET display"
                  description="Weather hazards as 3D volumes"
                />
                <FeatureListItem
                  color="cyan"
                  title="Cloud base indicators"
                  description="Ceiling heights along your route"
                />
              </SimpleGrid>
            </SimpleGrid>

            {/* Weather Screenshot - Full Width */}
            <Paper
              radius="lg"
              style={{
                overflow: 'hidden',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Image
                src={weatherImage}
                alt="VFR3D Weather Visualization - METARs, PIREPs, and Weather Advisories"
                style={{ width: '100%', display: 'block' }}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Obstacle Awareness Highlight */}
      <Box py={100} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Container size="lg">
          <Stack gap={50}>
            {/* Header and Feature List */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              <Stack gap="xl">
                <Badge size="md" variant="light" color="red" w="fit-content">
                  Obstacle Awareness
                </Badge>
                <Title order={2} c="white" style={{ fontSize: rem(32) }}>
                  Know What's Along Your Route
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  VFR3D displays obstacles from the FAA database with accurate heights
                  and positions. See towers, antennas, and other hazards in 3D.
                </Text>
              </Stack>
              <SimpleGrid cols={2} spacing="md">
                <FeatureListItem
                  color="red"
                  title="FAA obstacle database"
                  description="Towers, antennas, and structures"
                />
                <FeatureListItem
                  color="red"
                  title="3D height visualization"
                  description="Heights rendered to scale"
                />
                <FeatureListItem
                  color="red"
                  title="Lighting information"
                  description="Lit obstacles for night ops"
                />
                <FeatureListItem
                  color="red"
                  title="Route corridor detection"
                  description="Hazards along your path"
                />
              </SimpleGrid>
            </SimpleGrid>

            {/* Obstacles Screenshot - Full Width */}
            <Paper
              radius="lg"
              style={{
                overflow: 'hidden',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Image
                src={obstaclesImage}
                alt="VFR3D Obstacle Visualization - Towers and Hazards Along Route"
                style={{ width: '100%', display: 'block' }}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Flight Planner Highlight */}
      <Box py={100}>
        <Container size="lg">
          <Stack gap={50}>
            {/* Header and Feature List */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              <Stack gap="xl">
                <Badge size="md" variant="light" color="orange" w="fit-content">
                  Intuitive Planning
                </Badge>
                <Title order={2} c="white" style={{ fontSize: rem(32) }}>
                  Plan Your Flight Step by Step
                </Title>
                <Text size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
                  The VFR3D flight planner guides you through building your route
                  with an intuitive interface. Add waypoints, configure your aircraft,
                  and generate your navigation log.
                </Text>
              </Stack>
              <SimpleGrid cols={2} spacing="md">
                <FeatureListItem
                  color="orange"
                  title="Step-by-step workflow"
                  description="Guided route building process"
                />
                <FeatureListItem
                  color="orange"
                  title="Drag-and-drop waypoints"
                  description="Easily adjust your route"
                />
                <FeatureListItem
                  color="orange"
                  title="Performance profiles"
                  description="Accurate fuel & time calcs"
                />
                <FeatureListItem
                  color="orange"
                  title="One-click PDF export"
                  description="Printable navigation log"
                />
              </SimpleGrid>
            </SimpleGrid>

            {/* Flight Planner Screenshot - Full Width */}
            <Paper
              radius="lg"
              style={{
                overflow: 'hidden',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Image
                src={flightPlannerImage}
                alt="VFR3D Flight Planner - Step-by-Step Route Building"
                style={{ width: '100%', display: 'block' }}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box py={100} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Container size="md">
          <Paper
            radius="xl"
            p={60}
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textAlign: 'center',
            }}
          >
            <Stack align="center" gap="xl">
              <TbPlane size={60} color="var(--mantine-color-vfr3dBlue-5)" />
              <Title order={2} c="white" style={{ fontSize: rem(32) }}>
                Ready to Plan, Fly, Repeat?
              </Title>
              <Text size="lg" c="dimmed" maw={500}>
                Join pilots who are already using VFR3D to plan safer, more efficient VFR flights.
                Get started today - it's free.
              </Text>
              <Group>
                {!isAuthenticated ? (
                  <Button
                    size="xl"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                    loading={isLoading}
                    onClick={() => loginWithRedirect()}
                    rightSection={<FiArrowRight size={20} />}
                  >
                    Start Planning Now
                  </Button>
                ) : (
                  <Button
                    size="xl"
                    radius="md"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                    component={Link}
                    to="/viewer"
                    rightSection={<FiArrowRight size={20} />}
                  >
                    Open Flight Planner
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={40} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Image src={logo} alt="VFR3D" h={30} fit="contain" />
              <Text size="sm" c="dimmed">
                Plan, Fly, Repeat
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} VFR3D. For flight simulation and planning reference only.
            </Text>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}

// Stat Item Component
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <Stack align="center" gap={4}>
      <Text
        style={{
          fontSize: rem(28),
          fontWeight: 700,
          background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Stack>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
  features: string[];
}

function FeatureCard({ icon, color, title, description, features }: FeatureCardProps) {
  return (
    <Card
      padding="xl"
      radius="lg"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        transition: 'all 0.3s ease',
        height: '100%',
      }}
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: `var(--mantine-color-${color}-6)`,
            boxShadow: `0 20px 40px -20px var(--mantine-color-${color}-9)`,
          },
        },
      }}
    >
      <Stack gap="md">
        <ThemeIcon size={56} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        <Title order={4} c="white">
          {title}
        </Title>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
          {description}
        </Text>
        <Divider color="rgba(148, 163, 184, 0.1)" />
        <Stack gap={6}>
          {features.map((feature, index) => (
            <Group key={index} gap="xs" wrap="nowrap">
              <FiCheckCircle size={14} color="var(--mantine-color-green-5)" style={{ flexShrink: 0 }} />
              <Text size="xs" c="dimmed">
                {feature}
              </Text>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

// Feature List Item Component (for screenshot sections)
interface FeatureListItemProps {
  color: string;
  title: string;
  description: string;
}

function FeatureListItem({ color, title, description }: FeatureListItemProps) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <ThemeIcon size={20} radius="xl" color={color} variant="light" mt={2} style={{ flexShrink: 0 }}>
        <FiCheckCircle size={12} />
      </ThemeIcon>
      <Box>
        <Text size="sm" c="white" fw={500} lh={1.3}>
          {title}
        </Text>
        <Text size="xs" c="dimmed" lh={1.3}>
          {description}
        </Text>
      </Box>
    </Group>
  );
}

// Step Card Component
interface StepCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function StepCard({ step, icon, title, description }: StepCardProps) {
  return (
    <Card
      padding="xl"
      radius="lg"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Step Number */}
      <Box
        style={{
          position: 'absolute',
          top: -16,
          left: 24,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="sm" fw={700} c="white">
          {step}
        </Text>
      </Box>

      <Stack gap="md" mt="sm">
        <ThemeIcon size={48} radius="md" variant="light" color="blue">
          {icon}
        </ThemeIcon>
        <Title order={5} c="white">
          {title}
        </Title>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
          {description}
        </Text>
      </Stack>
    </Card>
  );
}
