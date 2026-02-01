import { useMemo, useState } from 'react';
import {
  Stack,
  Center,
  Text,
  Alert,
  Group,
  Badge,
  Loader,
  Button,
  SegmentedControl,
  Box,
  ScrollArea,
} from '@mantine/core';
import { FiAlertTriangle, FiInfo, FiClock, FiRefreshCw } from 'react-icons/fi';
import { useIsPhone } from '@/hooks';
import {
  FlightDto,
  WaypointType,
  NotamQueryByRouteRequest,
  RoutePointDto,
} from '@/redux/api/vfr3d/dtos';
import { useGetNotamsByRouteQuery } from '@/redux/api/vfr3d/notams.api';
import { NotamsList, FlightTimeWindow } from './NotamsCard';

interface NotamsPanelProps {
  flight: FlightDto;
}

const CORRIDOR_RADIUS_NM = 10;
const AIRPORT_RADIUS_NM = 5;

export function NotamsPanel({ flight }: NotamsPanelProps) {
  const isPhone = useIsPhone();

  // Calculate the flight time window
  const flightTimeWindow = useMemo((): FlightTimeWindow | undefined => {
    if (!flight?.departureTime) return undefined;

    const startTime = new Date(flight.departureTime);
    if (isNaN(startTime.getTime())) return undefined;

    // Calculate end time based on total route time (in hours)
    // Add a buffer of 1 hour for preflight/postflight
    const routeHours = flight.totalRouteTimeHours || 0;
    const bufferHours = 1;
    const totalMillis = (routeHours + bufferHours) * 60 * 60 * 1000;

    const endTime = new Date(startTime.getTime() + totalMillis);

    return {
      start: startTime,
      end: endTime,
    };
  }, [flight?.departureTime, flight?.totalRouteTimeHours]);

  // Build the route query from waypoints
  const routeQuery = useMemo((): NotamQueryByRouteRequest | null => {
    if (!flight?.waypoints || flight.waypoints.length === 0) {
      return null;
    }

    const airportIdentifiers: string[] = [];
    const routePoints: RoutePointDto[] = [];

    flight.waypoints.forEach((wp) => {
      if (wp.waypointType === WaypointType.Airport && wp.name) {
        // Add airport identifier for airport-specific NOTAMs
        if (!airportIdentifiers.includes(wp.name)) {
          airportIdentifiers.push(wp.name);
        }
        // Also add as route point
        routePoints.push({
          airportIdentifier: wp.name,
          name: wp.name,
          latitude: wp.latitude,
          longitude: wp.longitude,
          radiusNm: AIRPORT_RADIUS_NM,
          isAirport: true,
        });
      } else if (wp.latitude !== undefined && wp.longitude !== undefined) {
        // Add non-airport waypoint for corridor NOTAMs
        routePoints.push({
          name: wp.name || 'Waypoint',
          latitude: wp.latitude,
          longitude: wp.longitude,
          radiusNm: CORRIDOR_RADIUS_NM,
          isAirport: false,
        });
      }
    });

    return {
      airportIdentifiers,
      routePoints,
      corridorRadiusNm: CORRIDOR_RADIUS_NM,
      includeCorridorNotams: true,
    };
  }, [flight?.waypoints]);

  // Fetch NOTAMs for the route
  const {
    data: notamsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetNotamsByRouteQuery(routeQuery!, {
    skip: !routeQuery,
  });

  // Extract airport identifiers for individual display
  const airportIdents = useMemo(() => {
    if (!flight?.waypoints) return [];
    return flight.waypoints
      .filter((wp) => wp.waypointType === WaypointType.Airport && wp.name)
      .map((wp) => wp.name!)
      .filter((name, index, self) => self.indexOf(name) === index);
  }, [flight?.waypoints]);

  // Group NOTAMs by location
  const notamsByLocation = useMemo(() => {
    if (!notamsData?.notams) return new Map<string, typeof notamsData>();

    const grouped = new Map<string, typeof notamsData.notams>();

    notamsData.notams.forEach((notam) => {
      const location =
        notam.properties?.coreNOTAMData?.notam?.location ||
        notam.properties?.coreNOTAMData?.notam?.icaoLocation ||
        'Route Corridor';

      if (!grouped.has(location)) {
        grouped.set(location, []);
      }
      grouped.get(location)!.push(notam);
    });

    // Convert to full response objects per location
    const result = new Map<string, typeof notamsData>();
    grouped.forEach((notams, location) => {
      result.set(location, {
        notams,
        totalCount: notams.length,
        retrievedAt: notamsData.retrievedAt,
        queryLocation: location,
      });
    });

    return result;
  }, [notamsData]);

  // Sort locations - airports first (matching our route), then others
  const sortedLocations = useMemo(() => {
    const locations = Array.from(notamsByLocation.keys());

    return locations.sort((a, b) => {
      const aIsRouteAirport = airportIdents.includes(a);
      const bIsRouteAirport = airportIdents.includes(b);

      if (aIsRouteAirport && !bIsRouteAirport) return -1;
      if (!aIsRouteAirport && bIsRouteAirport) return 1;

      // Sort route airports by order in route
      if (aIsRouteAirport && bIsRouteAirport) {
        return airportIdents.indexOf(a) - airportIdents.indexOf(b);
      }

      return a.localeCompare(b);
    });
  }, [notamsByLocation, airportIdents]);

  // Count critical NOTAMs
  const criticalCount = useMemo(() => {
    if (!notamsData?.notams) return 0;
    return notamsData.notams.filter((n) => {
      const text = n.properties?.coreNOTAMData?.notam?.text?.toUpperCase() || '';
      return (
        text.includes('CLSD') ||
        text.includes('CLOSED') ||
        text.includes('INOP') ||
        text.includes('U/S')
      );
    }).length;
  }, [notamsData]);

  // Format flight time window for display
  const flightTimeDisplay = useMemo(() => {
    if (!flightTimeWindow) return null;
    const formatTime = (date: Date) => {
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
    return `${formatTime(flightTimeWindow.start)} - ${formatTime(flightTimeWindow.end)}`;
  }, [flightTimeWindow]);

  if (!flight?.waypoints || flight.waypoints.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No waypoints in this flight to fetch NOTAMs for</Text>
      </Center>
    );
  }

  // Format the retrieved timestamp
  const lastUpdatedDisplay = useMemo(() => {
    if (!notamsData?.retrievedAt) return null;
    const date = new Date(notamsData.retrievedAt);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [notamsData?.retrievedAt]);

  // State for active tab and view mode
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'readable'>('raw');

  // Set default active location when data loads
  const effectiveActiveLocation = activeLocation || sortedLocations[0] || null;

  // Get NOTAM counts per location for tab badges
  const locationCounts = useMemo(() => {
    const counts: Record<string, { total: number; critical: number }> = {};
    sortedLocations.forEach((location) => {
      const locationData = notamsByLocation.get(location);
      const notams = locationData?.notams || [];
      const critical = notams.filter((n) => {
        const text = n.properties?.coreNOTAMData?.notam?.text?.toUpperCase() || '';
        return text.includes('CLSD') || text.includes('CLOSED') || text.includes('INOP') || text.includes('U/S');
      }).length;
      counts[location] = { total: notams.length, critical };
    });
    return counts;
  }, [sortedLocations, notamsByLocation]);

  return (
    <Stack gap="md">
      {/* Header with summary and refresh */}
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Group gap="sm" wrap="wrap">
              <Text fw={500} c="gray.3">
                NOTAMs for Route
              </Text>
              {isLoading || isFetching ? (
                <Loader size="xs" />
              ) : notamsData?.totalCount !== undefined ? (
                <Badge variant="light" color="gray" size="sm">
                  {notamsData.totalCount} total
                </Badge>
              ) : null}
              {criticalCount > 0 && (
                <Badge variant="filled" color="red" size="sm">
                  {criticalCount} critical
                </Badge>
              )}
            </Group>
            {flightTimeDisplay && (
              <Group gap="xs">
                <FiClock size={12} color="var(--mantine-color-blue-5)" />
                <Text size="xs" c="blue.4">
                  {isPhone ? flightTimeDisplay : `Flight window: ${flightTimeDisplay}`}
                </Text>
              </Group>
            )}
          </Stack>

          {!isPhone && (
            <Group gap="md">
              <SegmentedControl
                size="xs"
                value={viewMode}
                onChange={(v) => setViewMode(v as 'raw' | 'readable')}
                data={[
                  { label: 'Raw', value: 'raw' },
                  { label: 'Translated', value: 'readable' },
                ]}
              />
              <Button
                variant="light"
                color="orange"
                size="xs"
                leftSection={<FiRefreshCw size={14} />}
                onClick={() => refetch()}
                loading={isFetching}
              >
                Refresh
              </Button>
            </Group>
          )}
        </Group>

        {/* Mobile controls */}
        {isPhone && (
          <Group gap="sm" justify="space-between">
            <SegmentedControl
              size="xs"
              value={viewMode}
              onChange={(v) => setViewMode(v as 'raw' | 'readable')}
              data={[
                { label: 'Raw', value: 'raw' },
                { label: 'Translated', value: 'readable' },
              ]}
            />
            <Button
              variant="light"
              color="orange"
              size="xs"
              leftSection={<FiRefreshCw size={14} />}
              onClick={() => refetch()}
              loading={isFetching}
            >
              Refresh
            </Button>
          </Group>
        )}
      </Stack>

      {/* View mode warning */}
      {viewMode === 'readable' && (
        <Alert
          icon={<FiAlertTriangle size={14} />}
          color="yellow"
          variant="light"
          py="xs"
          styles={{ message: { fontSize: '12px' } }}
        >
          Translated text may contain errors. Always verify with raw NOTAM text.
        </Alert>
      )}

      {/* Error state */}
      {isError && (
        <Alert
          icon={<FiAlertTriangle size={16} />}
          title="Failed to load NOTAMs"
          color="red"
          variant="light"
        >
          <Text size="sm">
            We couldn't retrieve NOTAMs for this route. Please try again.
          </Text>
          <Text
            size="xs"
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => refetch()}
            mt="xs"
          >
            Retry
          </Text>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <Center py="xl">
          <Stack align="center" gap="sm">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              Fetching NOTAMs...
            </Text>
          </Stack>
        </Center>
      )}

      {/* Content with Tabs */}
      {!isLoading && !isError && (
        <>
          {sortedLocations.length > 0 ? (
            <Stack gap="md">
              {/* Airport selector buttons */}
              <ScrollArea type={isPhone ? 'auto' : 'never'} scrollbarSize={4}>
                <Group gap="sm" wrap={isPhone ? 'nowrap' : 'wrap'}>
                  {sortedLocations.map((location) => {
                    const counts = locationCounts[location];
                    const isActive = location === effectiveActiveLocation;

                    return (
                      <Button
                        key={location}
                        variant={isActive ? 'filled' : 'default'}
                        color={isActive ? 'blue' : 'gray'}
                        size={isPhone ? 'xs' : 'sm'}
                        onClick={() => setActiveLocation(location)}
                        styles={{
                          root: {
                            backgroundColor: isActive
                              ? 'var(--mantine-color-blue-6)'
                              : 'rgba(30, 41, 59, 0.6)',
                            borderColor: isActive
                              ? 'var(--mantine-color-blue-5)'
                              : 'rgba(148, 163, 184, 0.3)',
                            borderWidth: isActive ? '2px' : '1px',
                            color: isActive ? 'white' : 'var(--mantine-color-gray-4)',
                            fontWeight: isActive ? 700 : 500,
                            flexShrink: 0,
                          },
                        }}
                        rightSection={
                          <Badge
                            size="xs"
                            variant={isActive ? 'white' : 'filled'}
                            color={counts?.critical > 0 ? 'red' : isActive ? 'blue' : 'gray'}
                            styles={{
                              root: isActive ? {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                              } : {},
                            }}
                          >
                            {counts?.total || 0}
                          </Badge>
                        }
                      >
                        {location}
                      </Button>
                    );
                  })}
                </Group>
              </ScrollArea>

              {/* Content for selected location */}
              <Box>
                {effectiveActiveLocation && (
                  <NotamsList
                    notamsData={notamsByLocation.get(effectiveActiveLocation)}
                    viewMode={viewMode}
                    flightTimeWindow={flightTimeWindow}
                  />
                )}
              </Box>
            </Stack>
          ) : (
            <Alert
              icon={<FiInfo size={16} />}
              color="blue"
              variant="light"
            >
              <Text size="sm">
                No NOTAMs found for the airports and corridor along your route.
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                This is good news - no known issues affecting your flight.
              </Text>
            </Alert>
          )}

          {/* Footer info */}
          <Group justify="space-between" mt="xs">
            {lastUpdatedDisplay && (
              <Text size="xs" c="dimmed">
                Last updated: {lastUpdatedDisplay}
              </Text>
            )}
            <Text size="xs" c="dimmed" fs="italic">
              Always verify NOTAMs through official FAA sources before flight.
            </Text>
          </Group>
        </>
      )}
    </Stack>
  );
}
