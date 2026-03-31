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
import { BUTTON_COLORS } from '@/constants/colors';
import { FaPlane } from 'react-icons/fa';
import { GiRadioTower, GiAirplaneDeparture } from 'react-icons/gi';
import { TbPlane, TbRoute, TbMapPin } from 'react-icons/tb';
import { useIsPhone } from '@/hooks';
import logo from '@/assets/images/logo_2.png';
import heroImage from '@/assets/images/hero.png';
import weatherImage from '@/assets/images/weather.png';
import obstaclesImage from '@/assets/images/obstacles.png';
import flightPlannerImage from '@/assets/images/flight-planner.png';
import classes from './index.module.css';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const isPhone = useIsPhone();

  return (
    <Box className={classes.pageWrapper}>
      {/* Hero Section */}
      <Box className={classes.heroSection}>
        {/* Background Pattern */}
        <Box className={classes.heroBackgroundPattern} />

        <Container size="lg" className={classes.heroContent}>
          <Stack align="center" gap="xl">
            {/* Logo */}
            <Image
              src={logo}
              alt="VFR3D Logo"
              w={280}
              fit="contain"
              className={classes.heroLogo}
            />

            {/* Tagline Badge */}
            <Badge
              size="lg"
              variant="outline"
              color={BUTTON_COLORS.PRIMARY}
              className={classes.heroBadge}
            >
              Plan, Fly, Repeat
            </Badge>

            {/* Main Headline */}
            <Title order={1} ta="center" className={classes.heroTitle}>
              Experience VFR Flight Planning{' '}
              <Text
                component="span"
                c="#4A9EFF"
                inherit
              >
                in Stunning 3D
              </Text>
            </Title>

            {/* Subtitle */}
            <Text
              size="lg"
              ta="center"
              maw={700}
              className={classes.heroSubtitle}
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
                  variant="filled"
                  color={BUTTON_COLORS.PRIMARY}
                  loading={isLoading}
                  onClick={() => loginWithRedirect()}
                  rightSection={<FiArrowRight size={20} />}
                  className={classes.heroCtaButton}
                >
                  Get Started Free
                </Button>
              ) : isPhone ? (
                // Phone users get mobile-friendly CTAs
                <Group gap="sm">
                  <Button
                    size="xl"
                    variant="filled"
                    color={BUTTON_COLORS.PRIMARY}
                    component={Link}
                    to="/airports"
                    leftSection={<TbMapPin size={20} />}
                    className={classes.heroCtaButton}
                  >
                    Look Up Airport
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    color={BUTTON_COLORS.PRIMARY}
                    component={Link}
                    to="/flights"
                    leftSection={<FaPlane size={18} />}
                  >
                    My Flights
                  </Button>
                </Group>
              ) : (
                // Tablet/Desktop users get the map CTA
                <Button
                  size="xl"
                  variant="filled"
                  color={BUTTON_COLORS.PRIMARY}
                  component={Link}
                  to="/map"
                  rightSection={<FiArrowRight size={20} />}
                  className={classes.heroCtaButton}
                >
                  Open Flight Planner
                </Button>
              )}
              <Button
                size="xl"
                variant="outline"
                color={BUTTON_COLORS.SECONDARY}
                component="a"
                href="#features"
                className={classes.heroExploreButton}
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
          <Paper className={classes.screenshotPaper}>
            <Image
              src={heroImage}
              alt="VFR3D 3D Flight Planning Interface"
              className={classes.screenshotImage}
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
              <Badge size="md" variant="outline" color={BUTTON_COLORS.PRIMARY}>
                Comprehensive Tools
              </Badge>
              <Title order={2} ta="center" fz={32}>
                Everything You Need for VFR Flight Planning
              </Title>
              <Text size="lg" c="#8892A0" ta="center" maw={600}>
                From route visualization to weather briefing, VFR3D provides all the tools
                a pilot needs for safe and efficient flight planning.
              </Text>
            </Stack>

            {/* Feature Cards Grid */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              <FeatureCard
                icon={<FiMap size={24} />}
                title="3D Map Visualization"
                description="Plan your routes on an immersive 3D globe with FAA VFR Sectionals, Terminal Area Charts, and IFR Enroute charts seamlessly integrated."
                features={[
                  'High-resolution 3D terrain',
                  'Multiple chart overlays',
                  'Satellite imagery integration',
                ]}
              />
              <FeatureCard
                icon={<FiLayers size={24} />}
                title="3D Airspace Visualization"
                description="See all airspace classes rendered in 3D with accurate vertical limits. Never be surprised by airspace along your route."
                features={[
                  'Class B, C, D, E airspaces',
                  'MOA, Restricted, Prohibited areas',
                  'Precise altitude depiction',
                ]}
              />
              <FeatureCard
                icon={<FiCloud size={24} />}
                title="Real-Time Weather"
                description="Access live weather data including METARs, TAFs, PIREPs, AIRMETs and SIGMETs with color-coded flight categories."
                features={[
                  'Decoded METAR & TAF',
                  '3D PIREP visualization',
                  'SIGMET/G-AIRMET polygons',
                ]}
              />
              <FeatureCard
                icon={<TbRoute size={24} />}
                title="Interactive Route Planning"
                description="Build your flight route with intuitive point-and-click waypoints. Drag and drop to adjust, with real-time distance calculations."
                features={[
                  'Custom waypoint support',
                  'Drag-and-drop editing',
                  'Airport & navaid search',
                ]}
              />
              <FeatureCard
                icon={<FiFileText size={24} />}
                title="Navigation Log Generation"
                description="Generate professional VFR navigation logs with accurate headings, times, and fuel calculations based on winds aloft."
                features={[
                  'Real winds aloft data',
                  'Fuel burn calculations',
                  'PDF export ready',
                ]}
              />
              <FeatureCard
                icon={<FiInfo size={24} />}
                title="Airport Information"
                description="Access comprehensive data for all US airports including runways, frequencies, diagrams, and chart supplements."
                features={[
                  'Runway details & lighting',
                  'Communication frequencies',
                  'Official FAA diagrams',
                ]}
              />
              <FeatureCard
                icon={<GiRadioTower size={24} />}
                title="Obstacle Awareness"
                description="View obstacles along your route with accurate heights and positions. Stay aware of towers, antennas, and other hazards."
                features={[
                  'FAA obstacle database',
                  'Height visualization',
                  'Lighting information',
                ]}
              />
              <FeatureCard
                icon={<FiSettings size={24} />}
                title="Aircraft Performance Profiles"
                description="Create and save multiple aircraft profiles with climb, cruise, and descent performance for accurate calculations."
                features={[
                  'Multiple aircraft support',
                  'Fuel burn rates',
                  'Speed & climb profiles',
                ]}
              />
              <FeatureCard
                icon={<FiFolder size={24} />}
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
      <Box py={100} className={classes.sectionAlt}>
        <Container size="lg">
          <Stack gap={60}>
            <Stack align="center" gap="md">
              <Badge size="md" variant="outline" color={BUTTON_COLORS.PRIMARY}>
                Simple Workflow
              </Badge>
              <Title order={2} ta="center" fz={32}>
                Plan Your Flight in Minutes
              </Title>
              <Text size="lg" c="#8892A0" ta="center" maw={600}>
                VFR3D streamlines your pre-flight planning with an intuitive workflow.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
              <StepCard
                step={1}
                icon={<TbMapPin size={28} />}
                title="Select Airports"
                description="Search and select your departure and destination airports from our comprehensive database."
              />
              <StepCard
                step={2}
                icon={<TbRoute size={28} />}
                title="Plan Your Route"
                description="Add waypoints, visualize airspaces, and customize your path on the interactive 3D map."
              />
              <StepCard
                step={3}
                icon={<FiCompass size={28} />}
                title="Review Weather"
                description="Check METARs, TAFs, and weather advisories for all airports and along your route."
              />
              <StepCard
                step={4}
                icon={<GiAirplaneDeparture size={28} />}
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
                <Badge size="md" variant="outline" color={BUTTON_COLORS.PRIMARY} w="fit-content">
                  Weather Intelligence
                </Badge>
                <Title order={2} fz={28}>
                  Make Informed Go/No-Go Decisions
                </Title>
                <Text size="lg" c="#8892A0" className={classes.sectionText}>
                  VFR3D gives you the weather picture you need. See current conditions,
                  forecasts, and pilot reports all visualized on your route.
                </Text>
              </Stack>
              <SimpleGrid cols={2} spacing="md">
                <FeatureListItem
                  title="Color-coded flight categories"
                  description="VFR, MVFR, IFR, LIFR at a glance"
                />
                <FeatureListItem
                  title="3D PIREP visualization"
                  description="Pilot reports at actual locations"
                />
                <FeatureListItem
                  title="SIGMET & G-AIRMET display"
                  description="Weather hazards as 3D volumes"
                />
                <FeatureListItem
                  title="Cloud base indicators"
                  description="Ceiling heights along your route"
                />
              </SimpleGrid>
            </SimpleGrid>

            {/* Weather Screenshot - Full Width */}
            <Paper className={classes.screenshotPaperSmall}>
              <Image
                src={weatherImage}
                alt="VFR3D Weather Visualization - METARs, PIREPs, and Weather Advisories"
                className={classes.screenshotImage}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Obstacle Awareness Highlight */}
      <Box py={100} className={classes.sectionAlt}>
        <Container size="lg">
          <Stack gap={50}>
            {/* Header and Feature List */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
              <Stack gap="xl">
                <Badge size="md" variant="outline" color="ifrRed" w="fit-content">
                  Obstacle Awareness
                </Badge>
                <Title order={2} fz={28}>
                  Know What&apos;s Along Your Route
                </Title>
                <Text size="lg" c="#8892A0" className={classes.sectionText}>
                  VFR3D displays obstacles from the FAA database with accurate heights
                  and positions. See towers, antennas, and other hazards in 3D.
                </Text>
              </Stack>
              <SimpleGrid cols={2} spacing="md">
                <FeatureListItem
                  title="FAA obstacle database"
                  description="Towers, antennas, and structures"
                />
                <FeatureListItem
                  title="3D height visualization"
                  description="Heights rendered to scale"
                />
                <FeatureListItem
                  title="Lighting information"
                  description="Lit obstacles for night ops"
                />
                <FeatureListItem
                  title="Route corridor detection"
                  description="Hazards along your path"
                />
              </SimpleGrid>
            </SimpleGrid>

            {/* Obstacles Screenshot - Full Width */}
            <Paper className={classes.screenshotPaperSmall}>
              <Image
                src={obstaclesImage}
                alt="VFR3D Obstacle Visualization - Towers and Hazards Along Route"
                className={classes.screenshotImage}
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
                <Badge size="md" variant="outline" color="warningYellow" w="fit-content">
                  Intuitive Planning
                </Badge>
                <Title order={2} fz={28}>
                  Plan Your Flight Step by Step
                </Title>
                <Text size="lg" c="#8892A0" className={classes.sectionText}>
                  The VFR3D flight planner guides you through building your route
                  with an intuitive interface. Add waypoints, configure your aircraft,
                  and generate your navigation log.
                </Text>
              </Stack>
              <SimpleGrid cols={2} spacing="md">
                <FeatureListItem
                  title="Step-by-step workflow"
                  description="Guided route building process"
                />
                <FeatureListItem
                  title="Drag-and-drop waypoints"
                  description="Easily adjust your route"
                />
                <FeatureListItem
                  title="Performance profiles"
                  description="Accurate fuel & time calcs"
                />
                <FeatureListItem
                  title="One-click PDF export"
                  description="Printable navigation log"
                />
              </SimpleGrid>
            </SimpleGrid>

            {/* Flight Planner Screenshot - Full Width */}
            <Paper className={classes.screenshotPaperSmall}>
              <Image
                src={flightPlannerImage}
                alt="VFR3D Flight Planner - Step-by-Step Route Building"
                className={classes.screenshotImage}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box py={100} className={classes.sectionAlt}>
        <Container size="md">
          <Paper p={60} className={classes.ctaPaper}>
            <Stack align="center" gap="xl">
              <TbPlane size={48} color="#4A9EFF" />
              <Title order={2} fz={28}>
                Ready to Plan, Fly, Repeat?
              </Title>
              <Text size="lg" c="#8892A0" maw={500}>
                Join pilots who are already using VFR3D to plan safer, more efficient VFR flights.
                Get started today — it&apos;s free.
              </Text>
              <Group>
                {!isAuthenticated ? (
                  <Button
                    size="xl"
                    variant="filled"
                    color={BUTTON_COLORS.PRIMARY}
                    loading={isLoading}
                    onClick={() => loginWithRedirect()}
                    rightSection={<FiArrowRight size={20} />}
                  >
                    Start Planning Now
                  </Button>
                ) : isPhone ? (
                  <Button
                    size="xl"
                    variant="filled"
                    color={BUTTON_COLORS.PRIMARY}
                    component={Link}
                    to="/airports"
                    leftSection={<TbMapPin size={20} />}
                  >
                    Look Up Airport
                  </Button>
                ) : (
                  <Button
                    size="xl"
                    variant="filled"
                    color={BUTTON_COLORS.PRIMARY}
                    component={Link}
                    to="/map"
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
      <Box py={40} className={classes.footerSection}>
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Image src={logo} alt="VFR3D" h={30} fit="contain" />
              <Text size="sm" c="#636E7E">
                Plan, Fly, Repeat
              </Text>
            </Group>
            <Text size="sm" c="#636E7E">
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
      <Text className={classes.statValue}>{value}</Text>
      <Text size="xs" c="#636E7E" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
    </Stack>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function FeatureCard({ icon, title, description, features }: FeatureCardProps) {
  return (
    <Card
      padding="xl"
      className={classes.featureCard}
    >
      <Stack gap="md">
        <ThemeIcon size={48} variant="light" color="vfr3dBlue">
          {icon}
        </ThemeIcon>
        <Title order={4}>
          {title}
        </Title>
        <Text size="sm" className={classes.featureCardDescription}>
          {description}
        </Text>
        <Divider className={classes.featureDivider} />
        <Stack gap={6}>
          {features.map((feature, index) => (
            <Group key={index} gap="xs" wrap="nowrap">
              <FiCheckCircle
                size={12}
                color="#4A9EFF"
                className={classes.featureListIcon}
              />
              <Text size="xs" c="#8892A0">
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
  title: string;
  description: string;
}

function FeatureListItem({ title, description }: FeatureListItemProps) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <ThemeIcon
        size={20}
        color="vfr3dBlue"
        variant="light"
        mt={2}
        className={classes.featureListIcon}
      >
        <FiCheckCircle size={12} />
      </ThemeIcon>
      <Box>
        <Text size="sm" c="#D1D5DB" fw={500} lh={1.3}>
          {title}
        </Text>
        <Text size="xs" c="#636E7E" lh={1.3}>
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
    <Card padding="xl" className={classes.stepCard} styles={{ root: { overflow: 'visible' } }}>
      {/* Step Number */}
      <Box className={classes.stepNumber}>
        <Text size="xs" fw={700} c="#0A0C10">
          {step}
        </Text>
      </Box>

      <Stack gap="md" mt="sm">
        <ThemeIcon size={44} variant="light" color="vfr3dBlue">
          {icon}
        </ThemeIcon>
        <Title order={5}>
          {title}
        </Title>
        <Text size="sm" c="#8892A0" className={classes.featureCardDescription}>
          {description}
        </Text>
      </Stack>
    </Card>
  );
}
