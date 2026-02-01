import { Link } from '@tanstack/react-router';
import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Box,
  ThemeIcon,
  SimpleGrid,
  Image,
} from '@mantine/core';
import { FiMap, FiCloud } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { TbMapPin } from 'react-icons/tb';
import logo from '@/assets/images/logo_2.png';

/**
 * Component shown to phone users who navigate to /map.
 * Provides clear messaging and quick-access buttons to available features.
 */
export function MapUnavailableMobile() {
  return (
    <Container
      size="sm"
      py="xl"
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Stack align="center" gap="xl">
        {/* Logo */}
        <Image src={logo} alt="VFR3D" w={180} fit="contain" />

        {/* Icon */}
        <ThemeIcon
          size={80}
          radius="xl"
          variant="light"
          color="blue"
          style={{ opacity: 0.8 }}
        >
          <FiMap size={40} />
        </ThemeIcon>

        {/* Message */}
        <Stack align="center" gap="xs">
          <Title order={2} ta="center" c="white">
            3D Map Requires a Larger Screen
          </Title>
          <Text c="dimmed" ta="center" maw={400} size="lg">
            The interactive 3D flight planning map works best on tablets and desktops.
            Please use a larger device to access the map.
          </Text>
        </Stack>

        {/* Suggestion */}
        <Box
          p="md"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 'var(--mantine-radius-md)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <Text size="sm" ta="center" c="blue.3">
            For the best experience, open VFR3D on a tablet or desktop computer.
          </Text>
        </Box>

        {/* Quick Access Buttons */}
        <Stack gap="md" w="100%">
          <Text size="sm" c="dimmed" ta="center" fw={500}>
            While on mobile, you can still:
          </Text>

          <SimpleGrid cols={1} spacing="sm">
            <Button
              component={Link}
              to="/airports"
              size="lg"
              variant="filled"
              color="blue"
              leftSection={<TbMapPin size={20} />}
              fullWidth
            >
              Look Up Airport
            </Button>

            <Button
              component={Link}
              to="/flights"
              size="lg"
              variant="light"
              color="blue"
              leftSection={<FaPlane size={18} />}
              fullWidth
            >
              View My Flights
            </Button>

            <Button
              component={Link}
              to="/weather-imagery"
              size="lg"
              variant="light"
              color="cyan"
              leftSection={<FiCloud size={20} />}
              fullWidth
            >
              Weather Imagery
            </Button>
          </SimpleGrid>
        </Stack>
      </Stack>
    </Container>
  );
}

export default MapUnavailableMobile;
