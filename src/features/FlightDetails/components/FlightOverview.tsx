import { useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { Stack, SimpleGrid, Paper, Text, Group, Badge, Button } from '@mantine/core';
import { FiClock, FiMap, FiNavigation, FiWind } from 'react-icons/fi';
import { FaPlane, FaGasPump, FaRoute } from 'react-icons/fa';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { setDisplayMode, viewFlightInMap } from '@/redux/slices/flightPlanningSlice';
import { FlightDisplayMode } from '@/utility/enums';
import { AppDispatch } from '@/redux/store';
import { METRIC_COLORS, FLIGHT_POINT_COLORS } from '@/constants/colors';
import { StatCard } from './StatCard';
import { formatDuration, formatWindComponent } from '../utils/formatters';

interface FlightOverviewProps {
  flight: FlightDto;
}

export function FlightOverview({ flight }: FlightOverviewProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleViewOnMap = () => {
    if (flight.id) {
      dispatch(viewFlightInMap(flight.id));
      dispatch(setDisplayMode(FlightDisplayMode.VIEWING));
      navigate({ to: '/map' });
    }
  };

  return (
    <Stack gap="lg">
      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard
          icon={<FaRoute size={20} color={METRIC_COLORS.DISTANCE} />}
          label="Total Distance"
          value={`${flight.totalRouteDistance?.toFixed(1) || '--'} NM`}
          bgColor="blue"
        />
        <StatCard
          icon={<FiClock size={20} color={METRIC_COLORS.TIME} />}
          label="Flight Time"
          value={formatDuration(flight.totalRouteTimeHours)}
          bgColor="cyan"
        />
        <StatCard
          icon={<FaGasPump size={20} color={METRIC_COLORS.FUEL} />}
          label="Fuel Required"
          value={`${flight.totalFuelUsed?.toFixed(1) || '--'} gal`}
          bgColor="teal"
        />
        <StatCard
          icon={<FiWind size={20} color={METRIC_COLORS.WIND} />}
          label="Avg Wind Component"
          value={formatWindComponent(flight.averageWindComponent)}
          bgColor="grape"
        />
      </SimpleGrid>

      {/* Route Display */}
      <Paper
        p="lg"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Text size="sm" c="dimmed" mb="sm">
          Route
        </Text>
        <Text c="white" size="lg" fw={500}>
          {flight.waypoints?.map((wp) => wp.name).join(' -> ') || 'No waypoints'}
        </Text>
        <Group mt="md" gap="xs">
          <Badge variant="light" color="blue">
            {flight.waypoints?.length || 0} waypoints
          </Badge>
          <Badge variant="light" color="cyan">
            {flight.plannedCruisingAltitude?.toLocaleString() || '--'} ft MSL
          </Badge>
          {flight.departureTime && (
            <Badge variant="light" color="grape">
              {new Date(flight.departureTime).toLocaleString()}
            </Badge>
          )}
        </Group>
      </Paper>

      {/* Departure & Destination */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {flight.waypoints && flight.waypoints.length > 0 && (
          <Paper
            p="lg"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Group gap="sm" mb="sm">
              <FaPlane size={16} color={FLIGHT_POINT_COLORS.DEPARTURE} />
              <Text size="sm" c="dimmed">
                Departure
              </Text>
            </Group>
            <Text c="white" size="lg" fw={600}>
              {flight.waypoints[0].name}
            </Text>
            {flight.departureTime && (
              <Text size="sm" c="dimmed">
                {new Date(flight.departureTime).toLocaleString()}
              </Text>
            )}
          </Paper>
        )}
        {flight.waypoints && flight.waypoints.length > 1 && (
          <Paper
            p="lg"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Group gap="sm" mb="sm">
              <FiNavigation size={16} color={FLIGHT_POINT_COLORS.DESTINATION} />
              <Text size="sm" c="dimmed">
                Destination
              </Text>
            </Group>
            <Text c="white" size="lg" fw={600}>
              {flight.waypoints[flight.waypoints.length - 1].name}
            </Text>
            {flight.legs && flight.legs.length > 0 && (
              <Text size="sm" c="dimmed">
                ETA:{' '}
                {flight.legs[flight.legs.length - 1].endLegTime
                  ? new Date(flight.legs[flight.legs.length - 1].endLegTime!).toLocaleString()
                  : '--'}
              </Text>
            )}
          </Paper>
        )}
      </SimpleGrid>

      {/* View on Map Button */}
      <Button
        variant="gradient"
        gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
        size="lg"
        leftSection={<FiMap size={20} />}
        onClick={handleViewOnMap}
      >
        View Flight on Map
      </Button>
    </Stack>
  );
}
