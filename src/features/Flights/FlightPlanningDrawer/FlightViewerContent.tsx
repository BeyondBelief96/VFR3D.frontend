import React from 'react';
import {
  Box,
  Text,
  Group,
  Stack,
  Badge,
  Paper,
  Divider,
  Skeleton,
  Alert,
} from '@mantine/core';
import {
  FiMapPin,
  FiClock,
  FiNavigation,
  FiDroplet,
  FiWind,
  FiAlertCircle,
} from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import { FlightDto } from '@/redux/api/vfr3d/dtos';
import { NavLogTable } from './NavLogTable';
import classes from './FlightViewerContent.module.css';

interface FlightViewerContentProps {
  flight?: FlightDto;
  isLoading: boolean;
  isError: boolean;
}

// Helper functions
const formatDuration = (hours?: number): string => {
  if (!hours) return '--';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const formatDateTime = (date?: string): string => {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatWindComponent = (component?: number): string => {
  if (component === undefined || component === null) return '--';
  const isHeadwind = component >= 0;
  return `${isHeadwind ? '+' : ''}${Math.round(component)} kt ${isHeadwind ? 'HW' : 'TW'}`;
};

export const FlightViewerContent: React.FC<FlightViewerContentProps> = ({
  flight,
  isLoading,
  isError,
}) => {
  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={100} radius="md" />
        <Skeleton height={60} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (isError || !flight) {
    return (
      <Alert
        icon={<FiAlertCircle size={16} />}
        title="Flight not found"
        color="red"
        variant="light"
      >
        Unable to load flight data. The flight may have been deleted or you don't have access.
      </Alert>
    );
  }

  const routeString =
    flight.waypoints?.map((wp) => wp.name).join(' → ') || 'No waypoints';

  // Create a navlog-like response from the flight data for the NavLogTable
  const navlogData = flight.legs
    ? {
        legs: flight.legs,
        totalRouteDistance: flight.totalRouteDistance,
        totalRouteTimeHours: flight.totalRouteTimeHours,
        totalFuelUsed: flight.totalFuelUsed,
        averageWindComponent: flight.averageWindComponent,
      }
    : null;

  return (
    <Stack gap="md">
      {/* Flight Header */}
      <Paper p="md" radius="md" className={classes.headerPaper}>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <FaPlane size={18} color="var(--mantine-color-blue-4)" />
            <Text size="lg" fw={600} c="white">
              {flight.name || 'Unnamed Flight'}
            </Text>
          </Group>
          {flight.relatedFlightId && (
            <Badge variant="light" color="cyan" size="sm">
              Round Trip
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed" mb="md">
          {routeString}
        </Text>

        {/* Flight Stats Grid */}
        <Group grow gap="xs">
          <Box>
            <Group gap={4}>
              <FiNavigation size={12} className={classes.iconGray} />
              <Text size="xs" c="dimmed">Distance</Text>
            </Group>
            <Text size="sm" fw={500} c="white">
              {flight.totalRouteDistance?.toFixed(1) || '--'} NM
            </Text>
          </Box>

          <Box>
            <Group gap={4}>
              <FiClock size={12} className={classes.iconGray} />
              <Text size="xs" c="dimmed">Duration</Text>
            </Group>
            <Text size="sm" fw={500} c="white">
              {formatDuration(flight.totalRouteTimeHours)}
            </Text>
          </Box>

          <Box>
            <Group gap={4}>
              <FiDroplet size={12} className={classes.iconGray} />
              <Text size="xs" c="dimmed">Fuel</Text>
            </Group>
            <Text size="sm" fw={500} c="white">
              {flight.totalFuelUsed?.toFixed(1) || '--'} gal
            </Text>
          </Box>

          <Box>
            <Group gap={4}>
              <FiWind size={12} className={classes.iconGray} />
              <Text size="xs" c="dimmed">Avg Wind</Text>
            </Group>
            <Text
              size="sm"
              fw={500}
              c={
                flight.averageWindComponent !== undefined
                  ? flight.averageWindComponent >= 0
                    ? 'red.4'
                    : 'green.4'
                  : 'white'
              }
            >
              {formatWindComponent(flight.averageWindComponent)}
            </Text>
          </Box>
        </Group>
      </Paper>

      {/* Flight Details */}
      <Paper p="md" radius="md" className={classes.detailsPaper}>
        <Group gap="xl">
          <Box>
            <Text size="xs" c="dimmed">Departure Time</Text>
            <Text size="sm" c="white">{formatDateTime(flight.departureTime)}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">Cruise Altitude</Text>
            <Text size="sm" c="white">
              {flight.plannedCruisingAltitude?.toLocaleString() || '--'} ft MSL
            </Text>
          </Box>
          {flight.aircraftPerformanceProfile && (
            <Box>
              <Text size="xs" c="dimmed">Aircraft Profile</Text>
              <Text size="sm" c="white">
                {flight.aircraftPerformanceProfile.profileName || 'Unknown'}
              </Text>
            </Box>
          )}
        </Group>
      </Paper>

      {/* Navigation Log */}
      {navlogData && navlogData.legs && navlogData.legs.length > 0 ? (
        <>
          <Divider
            label={
              <Group gap="xs">
                <FiMapPin size={14} />
                <Text size="sm">Navigation Log</Text>
              </Group>
            }
            labelPosition="left"
            color="gray.5"
          />
          <NavLogTable navlog={navlogData} isRoundTrip={false} />
        </>
      ) : (
        <Paper p="lg" radius="md" ta="center" className={classes.emptyNavlogPaper}>
          <FiMapPin size={32} className={classes.iconOpacity} />
          <Text size="sm" c="dimmed">
            No navigation log data available for this flight.
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

export default FlightViewerContent;
