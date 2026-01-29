import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Center,
  Loader,
  Stack,
  Card,
  Text,
  Tabs,
} from '@mantine/core';
import { FaBalanceScale } from 'react-icons/fa';
import { ProtectedRoute, useAuth } from '@/components/Auth';
import { useGetFlightQuery } from '@/redux/api/vfr3d/flights.api';
import { useGetAirportsByIcaoCodesOrIdentsQuery } from '@/redux/api/vfr3d/airports.api';
import { useFlightPdfData } from '@/features/Flights/hooks/useFlightPdfData';
import { FlightWeightBalancePanel } from '@/features/WeightBalance';
import { WaypointType } from '@/redux/api/vfr3d/dtos';
import {
  FlightHeader,
  FlightOverview,
  NavLogContent,
  FlightSettings,
  WeatherCard,
  AirportDetailCard,
} from '@/features/FlightDetails';

export const Route = createFileRoute('/flights/$flightId')({
  component: FlightDetailsPage,
});

function FlightDetailsPage() {
  return (
    <ProtectedRoute>
      <FlightDetailsContent />
    </ProtectedRoute>
  );
}

function FlightDetailsContent() {
  const { flightId } = Route.useParams();
  const { user } = useAuth();
  const userId = user?.sub || '';

  const {
    data: flight,
    isLoading,
    isError,
  } = useGetFlightQuery(
    { userId, flightId },
    {
      skip: !userId || !flightId,
    }
  );

  // Extract airport identifiers from waypoints
  const airportIdents = useMemo(() => {
    if (!flight?.waypoints) return [];
    return flight.waypoints
      .filter((wp) => wp.waypointType === WaypointType.Airport && wp.name)
      .map((wp) => wp.name!)
      .filter((name, index, self) => self.indexOf(name) === index);
  }, [flight?.waypoints]);

  const { data: airports } = useGetAirportsByIcaoCodesOrIdentsQuery(airportIdents, {
    skip: airportIdents.length === 0,
  });

  // Get all PDF data (weather, runways, frequencies, crosswind, weight balance)
  const pdfData = useFlightPdfData(flight, userId);

  if (isLoading) {
    return (
      <Center h="calc(100vh - 60px)" bg="var(--vfr3d-background)">
        <Loader size="xl" color="blue" />
      </Center>
    );
  }

  if (isError || !flight) {
    return (
      <Container
        size="lg"
        py="xl"
        style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
      >
        <Card bg="red.9" p="md">
          <Text c="white">Error loading flight. Please try again.</Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      size="lg"
      py="xl"
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
    >
      <Stack gap="lg">
        {/* Header */}
        <FlightHeader flight={flight} pdfData={pdfData} />

        {/* Tabs */}
        <Card
          padding="lg"
          radius="md"
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Tabs defaultValue="overview" color="blue">
            <Tabs.List mb="md">
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="navlog">Nav Log</Tabs.Tab>
              <Tabs.Tab value="weight-balance" leftSection={<FaBalanceScale size={14} />}>
                Weight & Balance
              </Tabs.Tab>
              <Tabs.Tab value="airports">Airports</Tabs.Tab>
              <Tabs.Tab value="weather">Weather</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview">
              <FlightOverview flight={flight} />
            </Tabs.Panel>

            <Tabs.Panel value="navlog">
              <NavLogContent flight={flight} userId={userId} />
            </Tabs.Panel>

            <Tabs.Panel value="weight-balance">
              <FlightWeightBalancePanel flight={flight} userId={userId} />
            </Tabs.Panel>

            <Tabs.Panel value="airports">
              {airports && airports.length > 0 ? (
                <Stack gap="lg">
                  {airports.map((airport) => (
                    <AirportDetailCard key={airport.siteNo} airport={airport} />
                  ))}
                </Stack>
              ) : (
                <Center py="xl">
                  <Text c="dimmed">No airport information available</Text>
                </Center>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="weather">
              {airportIdents.length > 0 ? (
                <Stack gap="md">
                  {airportIdents.map((ident) => (
                    <WeatherCard key={ident} icaoId={ident} />
                  ))}
                </Stack>
              ) : (
                <Center py="xl">
                  <Text c="dimmed">No airports in route to show weather for</Text>
                </Center>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="settings">
              <FlightSettings flight={flight} userId={userId} />
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}
