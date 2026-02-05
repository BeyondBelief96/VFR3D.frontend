import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Button,
  Center,
  Loader,
  Badge,
  ActionIcon,
  SimpleGrid,
  Box,
  Modal,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FiPlus, FiTrash2, FiClock, FiNavigation, FiDroplet, FiWind } from 'react-icons/fi';
import { BUTTON_COLORS, BUTTON_GRADIENTS, ACTION_ICON_COLORS } from '@/constants/colors';
import { SURFACE, SURFACE_INNER, BORDER, ICON_BG, MODAL_STYLES, THEME_COLORS } from '@/constants/surfaces';
import { FaPlane } from 'react-icons/fa';
import { TbMapPin } from 'react-icons/tb';
import { useAuth0 } from '@auth0/auth0-react';
import { ProtectedRoute } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useIsPhone } from '@/hooks';
import { useGetFlightsQuery, useDeleteFlightMutation } from '@/redux/api/vfr3d/flights.api';
import { FlightDto } from '@/redux/api/vfr3d/dtos';

export const Route = createFileRoute('/flights/')({
  component: FlightsPage,
});

function FlightsPage() {
  return (
    <ProtectedRoute>
      <FlightsContent />
    </ProtectedRoute>
  );
}

// Helper functions
const formatDuration = (hours: number | null | undefined): string => {
  if (!hours) return '--';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatWindComponent = (headwindKt: number | null | undefined): string => {
  if (headwindKt === null || headwindKt === undefined) return '--';
  const isHeadwind = headwindKt >= 0;
  const abs = Math.abs(headwindKt);
  return `${isHeadwind ? '+' : '-'}${abs.toFixed(0)} kt ${isHeadwind ? 'HW' : 'TW'}`;
};

interface FlightCardProps {
  flight: FlightDto;
  onDelete: (flightId: string) => void;
  isDeleting: boolean;
}

function FlightCard({ flight, onDelete, isDeleting }: FlightCardProps) {
  const departureDate = flight.departureTime
    ? new Date(flight.departureTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date';

  const departureTime = flight.departureTime
    ? new Date(flight.departureTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Card
      padding="lg"
      radius="md"
      style={{
        backgroundColor: SURFACE.CARD,
        border: `1px solid ${BORDER.CARD}`,
        transition: 'all 0.2s ease',
      }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" wrap="nowrap">
          <Link
            to="/flights/$flightId"
            params={{ flightId: flight.id! }}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <Group gap="sm" wrap="nowrap">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: ICON_BG.BLUE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaPlane size={18} color={THEME_COLORS.PRIMARY} />
              </Box>
              <Box>
                <Text c="white" fw={600} size="lg" lineClamp={1}>
                  {flight.name || 'Unnamed Flight'}
                </Text>
                <Text c="dimmed" size="sm">
                  {departureDate} {departureTime && `• ${departureTime}`}
                </Text>
              </Box>
            </Group>
          </Link>
          <ActionIcon
            variant="light"
            color={ACTION_ICON_COLORS.DELETE}
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (flight.id) onDelete(flight.id);
            }}
            loading={isDeleting}
          >
            <FiTrash2 size={18} />
          </ActionIcon>
        </Group>

        {/* Route Display */}
        <Box
          style={{
            backgroundColor: SURFACE_INNER.DEFAULT,
            borderRadius: 'var(--mantine-radius-md)',
            padding: 'var(--mantine-spacing-sm)',
          }}
        >
          <Text c="white" size="sm" ta="center">
            {flight.waypoints?.map((wp) => wp.name).join(' → ') || 'No waypoints'}
          </Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
          <Box ta="center">
            <Group gap={4} justify="center" mb={2}>
              <FiNavigation size={14} color="var(--mantine-color-blue-4)" />
              <Text size="xs" c="dimmed">
                Distance
              </Text>
            </Group>
            <Text c="white" fw={600} size="sm">
              {flight.totalRouteDistance?.toFixed(1) || '--'} NM
            </Text>
          </Box>
          <Box ta="center">
            <Group gap={4} justify="center" mb={2}>
              <FiClock size={14} color="var(--mantine-color-cyan-4)" />
              <Text size="xs" c="dimmed">
                Time
              </Text>
            </Group>
            <Text c="white" fw={600} size="sm">
              {formatDuration(flight.totalRouteTimeHours)}
            </Text>
          </Box>
          <Box ta="center">
            <Group gap={4} justify="center" mb={2}>
              <FiDroplet size={14} color="var(--mantine-color-teal-4)" />
              <Text size="xs" c="dimmed">
                Fuel
              </Text>
            </Group>
            <Text c="white" fw={600} size="sm">
              {flight.totalFuelUsed?.toFixed(1) || '--'} gal
            </Text>
          </Box>
          <Box ta="center">
            <Group gap={4} justify="center" mb={2}>
              <FiWind size={14} color="var(--mantine-color-grape-4)" />
              <Text size="xs" c="dimmed">
                Wind
              </Text>
            </Group>
            <Text c="white" fw={600} size="sm">
              {formatWindComponent(flight.averageWindComponent)}
            </Text>
          </Box>
        </SimpleGrid>

        {/* Footer badges */}
        <Group gap="xs">
          {flight.aircraftPerformanceProfile?.profileName && (
            <Badge size="sm" variant="light" color="grape">
              {flight.aircraftPerformanceProfile.profileName}
            </Badge>
          )}
          <Badge size="sm" variant="light" color="blue">
            {flight.waypoints?.length || 0} waypoints
          </Badge>
          <Badge size="sm" variant="light" color="cyan">
            {flight.plannedCruisingAltitude?.toLocaleString() || '--'} ft
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
}

function FlightsContent() {
  const { user } = useAuth0();
  const userId = user?.sub || '';
  const isPhone = useIsPhone();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState<string | null>(null);

  const { data: flights, isLoading, isError, isFetching, refetch } = useGetFlightsQuery(userId, {
    skip: !userId,
  });

  const [deleteFlight, { isLoading: isDeleting }] = useDeleteFlightMutation();

  const handleDeleteClick = (flightId: string) => {
    setFlightToDelete(flightId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!flightToDelete || !userId) return;

    try {
      await deleteFlight({ userId, flightId: flightToDelete }).unwrap();
      notifications.show({
        title: 'Flight Deleted',
        message: 'The flight has been deleted successfully.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Delete Failed',
        message: 'Unable to delete the flight. Please try again.',
        color: 'red',
      });
    } finally {
      setDeleteModalOpen(false);
      setFlightToDelete(null);
    }
  };

  return (
    <Container
      size="lg"
      py="xl"
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: THEME_COLORS.SURFACE_9 }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} c="white">
            My Flights
          </Title>
          {isPhone ? (
            <Button
              leftSection={<TbMapPin size={18} />}
              variant="gradient"
              gradient={BUTTON_GRADIENTS.PRIMARY}
              component={Link}
              to="/airports"
            >
              Look Up Airport
            </Button>
          ) : (
            <Button
              leftSection={<FiPlus />}
              variant="gradient"
              gradient={BUTTON_GRADIENTS.PRIMARY}
              component={Link}
              to="/map"
            >
              Plan New Flight
            </Button>
          )}
        </Group>

        {isLoading && (
          <Center py="xl">
            <Loader size="lg" color="blue" />
          </Center>
        )}

        {isError && (
          <PageErrorState
            title="Unable to Load Flights"
            message="We couldn't load your flights. This might be a temporary issue with our servers."
            onRetry={() => refetch()}
            isRetrying={isFetching}
            fullPage={false}
          />
        )}

        {flights && flights.length === 0 && (
          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: SURFACE.CARD,
              border: `1px solid ${BORDER.SUBTLE}`,
            }}
          >
            <Stack align="center" gap="lg" py="xl">
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: ICON_BG.BLUE_LIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaPlane size={32} style={{ opacity: 0.5, color: THEME_COLORS.PRIMARY }} />
              </Box>
              <Text c="white" size="lg" fw={500}>
                No Flights Yet
              </Text>
              <Text c="dimmed" ta="center" maw={400}>
                Start planning your first flight to see it here. Your saved flights will appear on
                this page.
              </Text>
              {isPhone ? (
                <Button
                  variant="gradient"
                  gradient={BUTTON_GRADIENTS.PRIMARY}
                  component={Link}
                  to="/airports"
                  leftSection={<TbMapPin size={18} />}
                >
                  Look Up Airport
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  gradient={BUTTON_GRADIENTS.PRIMARY}
                  component={Link}
                  to="/map"
                  leftSection={<FiPlus />}
                >
                  Plan Your First Flight
                </Button>
              )}
            </Stack>
          </Card>
        )}

        {flights && flights.length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting && flightToDelete === flight.id}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Flight"
        centered
        styles={{
          header: MODAL_STYLES.header,
          body: MODAL_STYLES.body,
          content: MODAL_STYLES.content,
        }}
      >
        <Stack gap="md">
          <Text c="dimmed">
            Are you sure you want to delete this flight? This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color={BUTTON_COLORS.SECONDARY} onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="light" color={BUTTON_COLORS.DESTRUCTIVE} onClick={handleDeleteConfirm} loading={isDeleting}>
              Delete Flight
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
