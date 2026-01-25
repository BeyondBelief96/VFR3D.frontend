import { useState, useMemo } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
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
  Tabs,
  SimpleGrid,
  Box,
  Badge,
  Paper,
  ActionIcon,
  NumberInput,
  Select,
  Collapse,
  Table,
  Accordion,
  ScrollArea,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useDispatch } from 'react-redux';
import {
  FiArrowLeft,
  FiMap,
  FiNavigation,
  FiClock,
  FiWind,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiDownload,
} from 'react-icons/fi';
import { FaPlane, FaGasPump, FaRoute } from 'react-icons/fa';
import { ProtectedRoute, useAuth } from '@/components/Auth';
import {
  useGetFlightQuery,
  useUpdateFlightMutation,
  useRegenerateNavlogMutation,
} from '@/redux/api/vfr3d/flights.api';
import { useGetAircraftQuery } from '@/redux/api/vfr3d/aircraft.api';
import {
  useGetAirportsByIcaoCodesOrIdentsQuery,
  useGetRunwaysByAirportCodeQuery,
} from '@/redux/api/vfr3d/airports.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetCrosswindForAirportQuery } from '@/redux/api/vfr3d/performance.api';
import { RunwayInformation } from '@/features/Airports/InformationPopup/AirportInfo/RunwayInformation';
import {
  useGetMetarForAirportQuery,
  useGetTafForAirportQuery,
} from '@/redux/api/vfr3d/weather.api';
import { NavLogTable } from '@/features/Flights/FlightPlanningDrawer/NavLogTable';
import { FlightLogPdf } from '@/features/Flights';
import { mapFlightToNavlogData } from '@/utility/utils';
import {
  FlightDto,
  AirportDto,
  UpdateFlightRequestDto,
  WaypointType,
  CommunicationFrequencyDto,
} from '@/redux/api/vfr3d/dtos';
import { setDisplayMode, viewFlightInMap } from '@/redux/slices/flightPlanningSlice';
import { FlightDisplayMode } from '@/utility/enums';
import { AppDispatch } from '@/redux/store';

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

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Group gap="md" wrap="nowrap">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: `rgba(59, 130, 246, 0.15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            {label}
          </Text>
          <Text size="xl" fw={700} c="white">
            {value}
          </Text>
          {subtext && (
            <Text size="xs" c="dimmed">
              {subtext}
            </Text>
          )}
        </Box>
      </Group>
    </Paper>
  );
}

// Format helpers
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
  return `${isHeadwind ? '+' : '-'}${abs.toFixed(0)} kt ${isHeadwind ? 'headwind' : 'tailwind'}`;
};

// Overview Tab Component
function FlightOverview({ flight }: { flight: FlightDto }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleViewOnMap = () => {
    if (flight.id) {
      dispatch(viewFlightInMap(flight.id));
      dispatch(setDisplayMode(FlightDisplayMode.VIEWING));
      navigate({ to: '/viewer' });
    }
  };

  return (
    <Stack gap="lg">
      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard
          icon={<FaRoute size={20} color="var(--mantine-color-blue-4)" />}
          label="Total Distance"
          value={`${flight.totalRouteDistance?.toFixed(1) || '--'} NM`}
        />
        <StatCard
          icon={<FiClock size={20} color="var(--mantine-color-cyan-4)" />}
          label="Flight Time"
          value={formatDuration(flight.totalRouteTimeHours)}
        />
        <StatCard
          icon={<FaGasPump size={20} color="var(--mantine-color-teal-4)" />}
          label="Fuel Required"
          value={`${flight.totalFuelUsed?.toFixed(1) || '--'} gal`}
        />
        <StatCard
          icon={<FiWind size={20} color="var(--mantine-color-grape-4)" />}
          label="Avg Wind Component"
          value={formatWindComponent(flight.averageWindComponent)}
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
          {flight.waypoints?.map((wp) => wp.name).join(' → ') || 'No waypoints'}
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
              <FaPlane size={16} color="var(--mantine-color-green-4)" />
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
              <FiNavigation size={16} color="var(--mantine-color-red-4)" />
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

// Flight category color helper
const getFlightCategoryColor = (category?: string): string => {
  switch (category) {
    case 'VFR':
      return 'green';
    case 'MVFR':
      return 'blue';
    case 'IFR':
      return 'red';
    case 'LIFR':
      return 'grape';
    default:
      return 'gray';
  }
};

// Weather Card Component
function WeatherCard({ icaoId }: { icaoId: string }) {
  const [expanded, setExpanded] = useState(true);

  const { data: metar, isLoading: metarLoading } = useGetMetarForAirportQuery(icaoId, {
    skip: !icaoId,
  });

  const { data: taf, isLoading: tafLoading } = useGetTafForAirportQuery(icaoId, {
    skip: !icaoId,
  });

  const isVariableWind = metar?.windDirDegrees === 'VRB' || metar?.windDirDegrees === 'Variable';

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <Badge variant="filled" color="blue" size="lg">
            {icaoId}
          </Badge>
          {metar?.flightCategory && (
            <Badge variant="filled" color={getFlightCategoryColor(metar.flightCategory)} size="lg">
              {metar.flightCategory}
            </Badge>
          )}
        </Group>
        <ActionIcon variant="subtle" onClick={() => setExpanded(!expanded)}>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </ActionIcon>
      </Group>

      <Collapse in={expanded}>
        <Stack gap="md">
          {/* METAR Section */}
          <Box>
            <Text size="sm" c="dimmed" mb="xs" fw={500}>
              Current Conditions (METAR)
            </Text>
            {metarLoading ? (
              <Loader size="sm" />
            ) : metar ? (
              <Stack gap="sm">
                {/* Raw METAR */}
                <Text
                  size="xs"
                  c="gray.4"
                  style={{
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '8px',
                    borderRadius: '4px',
                    wordBreak: 'break-word',
                  }}
                >
                  {metar.rawText || 'No raw data'}
                </Text>

                {/* Decoded METAR Grid */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                  {/* Wind */}
                  {(metar.windDirDegrees || metar.windSpeedKt) && (
                    <Box>
                      <Group gap={4}>
                        <FiWind size={12} color="var(--mantine-color-gray-5)" />
                        <Text size="xs" c="dimmed">Wind</Text>
                      </Group>
                      <Text size="sm" c="white" fw={500}>
                        {isVariableWind ? 'Variable' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt || '--'}kt
                        {metar.windGustKt && (
                          <Text span c="yellow" fw={600}> G{metar.windGustKt}kt</Text>
                        )}
                      </Text>
                    </Box>
                  )}

                  {/* Visibility */}
                  {metar.visibilityStatuteMi && (
                    <Box>
                      <Text size="xs" c="dimmed">Visibility</Text>
                      <Text size="sm" c="white" fw={500}>
                        {metar.visibilityStatuteMi} SM
                      </Text>
                    </Box>
                  )}

                  {/* Temperature / Dewpoint */}
                  {(metar.tempC !== undefined || metar.dewpointC !== undefined) && (
                    <Box>
                      <Text size="xs" c="dimmed">Temp / Dewpoint</Text>
                      <Text size="sm" c="white" fw={500}>
                        {metar.tempC !== undefined ? `${metar.tempC}°C` : '--'} / {metar.dewpointC !== undefined ? `${metar.dewpointC}°C` : '--'}
                      </Text>
                    </Box>
                  )}

                  {/* Altimeter */}
                  {metar.altimInHg && (
                    <Box>
                      <Text size="xs" c="dimmed">Altimeter</Text>
                      <Text size="sm" c="white" fw={600}>
                        {metar.altimInHg.toFixed(2)}" Hg
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Sky Conditions */}
                {metar.skyCondition && metar.skyCondition.length > 0 && (
                  <Box>
                    <Group gap={4} mb={4}>
                      <Text size="xs" c="dimmed">Sky Conditions</Text>
                    </Group>
                    <Group gap="xs">
                      {metar.skyCondition.map((sky, idx) => (
                        <Badge key={idx} variant="light" color="blue" size="sm">
                          {sky.skyCover}
                          {sky.cloudBaseFtAgl && ` @ ${sky.cloudBaseFtAgl.toLocaleString()} ft`}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                {/* Weather Phenomena */}
                {metar.wxString && (
                  <Box>
                    <Text size="xs" c="dimmed">Weather</Text>
                    <Badge variant="light" color="orange" size="sm">
                      {metar.wxString}
                    </Badge>
                  </Box>
                )}

                {/* Observation Time */}
                {metar.observationTime && (
                  <Text size="xs" c="dimmed">
                    Observed: {new Date(metar.observationTime).toLocaleString()}
                  </Text>
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No METAR available
              </Text>
            )}
          </Box>

          {/* TAF Section */}
          <Box>
            <Text size="sm" c="dimmed" mb="xs" fw={500}>
              Forecast (TAF)
            </Text>
            {tafLoading ? (
              <Loader size="sm" />
            ) : taf ? (
              <Stack gap="sm">
                {/* Raw TAF */}
                <Text
                  size="xs"
                  c="gray.4"
                  style={{
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '8px',
                    borderRadius: '4px',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {taf.rawText || 'No raw data'}
                </Text>

                {/* Validity Period */}
                {(taf.validTimeFrom || taf.validTimeTo) && (
                  <Text size="xs" c="dimmed">
                    Valid: {taf.validTimeFrom && new Date(taf.validTimeFrom).toLocaleString()} -{' '}
                    {taf.validTimeTo && new Date(taf.validTimeTo).toLocaleString()}
                  </Text>
                )}

                {/* Forecast Periods */}
                {taf.forecast && taf.forecast.length > 0 && (
                  <Accordion
                    variant="separated"
                    radius="md"
                    styles={{
                      item: {
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                      },
                      control: {
                        padding: '8px 12px',
                      },
                      panel: {
                        padding: '8px 12px',
                      },
                    }}
                  >
                    {taf.forecast.slice(0, 6).map((fcst, idx) => {
                      const changeLabel = fcst.changeIndicator === 'FM' ? 'From' :
                        fcst.changeIndicator === 'TEMPO' ? 'Temporary' :
                        fcst.changeIndicator === 'BECMG' ? 'Becoming' :
                        fcst.changeIndicator === 'PROB' ? 'Probability' :
                        fcst.changeIndicator || 'Initial';

                      return (
                        <Accordion.Item key={idx} value={`forecast-${idx}`}>
                          <Accordion.Control>
                            <Group gap="xs">
                              <Badge variant="light" color="cyan" size="sm">
                                {changeLabel}
                              </Badge>
                              {fcst.probability && (
                                <Badge variant="light" color="yellow" size="sm">
                                  {fcst.probability}%
                                </Badge>
                              )}
                              {fcst.fcstTimeFrom && (
                                <Text size="xs" c="dimmed">
                                  {new Date(fcst.fcstTimeFrom).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {fcst.fcstTimeTo &&
                                    ` - ${new Date(fcst.fcstTimeTo).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}`}
                                </Text>
                              )}
                            </Group>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                              {/* Wind */}
                              {(fcst.windDirDegrees || fcst.windSpeedKt) && (
                                <Box>
                                  <Text size="xs" c="dimmed">Wind</Text>
                                  <Text size="sm" c="white">
                                    {fcst.windDirDegrees}° @ {fcst.windSpeedKt}kt
                                    {fcst.windGustKt && (
                                      <Text span c="yellow"> G{fcst.windGustKt}</Text>
                                    )}
                                  </Text>
                                </Box>
                              )}
                              {/* Visibility */}
                              {fcst.visibilityStatuteMi && (
                                <Box>
                                  <Text size="xs" c="dimmed">Visibility</Text>
                                  <Text size="sm" c="white">{fcst.visibilityStatuteMi} SM</Text>
                                </Box>
                              )}
                              {/* Sky Conditions */}
                              {fcst.skyConditions && fcst.skyConditions.length > 0 && (
                                <Box>
                                  <Text size="xs" c="dimmed">Sky</Text>
                                  <Text size="sm" c="white">
                                    {fcst.skyConditions
                                      .map((s) => `${s.skyCover}${s.cloudBaseFtAgl ? ` @ ${s.cloudBaseFtAgl}ft` : ''}`)
                                      .join(', ')}
                                  </Text>
                                </Box>
                              )}
                              {/* Weather */}
                              {fcst.wxString && (
                                <Box>
                                  <Text size="xs" c="dimmed">Weather</Text>
                                  <Text size="sm" c="white">{fcst.wxString}</Text>
                                </Box>
                              )}
                            </SimpleGrid>
                          </Accordion.Panel>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                )}

                {taf.forecast && taf.forecast.length > 6 && (
                  <Text size="xs" c="dimmed">
                    + {taf.forecast.length - 6} more forecast periods
                  </Text>
                )}

                {/* Issue Time */}
                {taf.issueTime && (
                  <Text size="xs" c="dimmed">
                    Issued: {new Date(taf.issueTime).toLocaleString()}
                  </Text>
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No TAF available
              </Text>
            )}
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
}

// Airport Detail Card Component - Shows runways and frequencies
function AirportDetailCard({ airport }: { airport: AirportDto }) {
  const ident = airport.icaoId || airport.arptId || '';

  const { data: runways, isLoading: runwaysLoading } = useGetRunwaysByAirportCodeQuery(ident, {
    skip: !ident,
  });

  const { data: frequencies, isLoading: frequenciesLoading } =
    useGetFrequenciesByServicedFacilityQuery(ident, {
      skip: !ident,
    });

  // Fetch crosswind data based on current METAR
  const { data: crosswindData, isLoading: crosswindLoading } = useGetCrosswindForAirportQuery(
    ident,
    {
      skip: !ident,
    }
  );

  // Group frequencies by use
  const groupedFrequencies = useMemo(() => {
    if (!frequencies) return {};
    return frequencies.reduce(
      (acc, freq) => {
        const use = freq.frequencyUse || 'Other';
        if (!acc[use]) acc[use] = [];
        acc[use].push(freq);
        return acc;
      },
      {} as Record<string, CommunicationFrequencyDto[]>
    );
  }, [frequencies]);

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      {/* Airport Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Badge variant="filled" color="blue" size="lg">
            {ident}
          </Badge>
          <Box>
            <Text c="white" fw={600} size="lg">
              {airport.arptName}
            </Text>
            <Text c="dimmed" size="sm">
              {airport.city}, {airport.stateCode}
            </Text>
          </Box>
        </Group>
        <Badge variant="light" color="cyan">
          {airport.elev?.toLocaleString() || '--'} ft MSL
        </Badge>
      </Group>

      {/* Basic Info */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="md">
        <Box>
          <Text size="xs" c="dimmed">
            Fuel Types
          </Text>
          <Text size="sm" c="white">
            {airport.fuelTypes || 'N/A'}
          </Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Chart Name
          </Text>
          <Text size="sm" c="white">
            {airport.chartName || 'N/A'}
          </Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Mag Variation
          </Text>
          <Text size="sm" c="white">
            {airport.magVarn ? `${airport.magVarn}° ${airport.magHemis || ''}` : 'N/A'}
          </Text>
        </Box>
        <Box>
          <Text size="xs" c="dimmed">
            Status
          </Text>
          <Text size="sm" c="white">
            {airport.arptStatus || 'N/A'}
          </Text>
        </Box>
      </SimpleGrid>

      <Accordion
        variant="separated"
        styles={{
          item: {
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            '&[data-active]': {
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
            },
          },
          control: {
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
            },
          },
        }}
      >
        {/* Runways Section with Crosswind Data */}
        <Accordion.Item value="runways">
          <Accordion.Control>
            <Group gap="sm">
              <Text c="white" fw={500}>
                Runways
              </Text>
              {runways && (
                <Badge size="sm" variant="light" color="blue">
                  {runways.length}
                </Badge>
              )}
              {crosswindData?.recommendedRunway && (
                <Badge size="sm" variant="filled" color="green">
                  Best: Rwy {crosswindData.recommendedRunway}
                </Badge>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {runwaysLoading || crosswindLoading ? (
              <Center py="md">
                <Loader size="sm" />
              </Center>
            ) : (
              <RunwayInformation
                runwayInformation={runways}
                crosswindData={crosswindData}
                isCrosswindLoading={crosswindLoading}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Frequencies Section */}
        <Accordion.Item value="frequencies">
          <Accordion.Control>
            <Group gap="sm">
              <Text c="white" fw={500}>
                Frequencies
              </Text>
              {frequencies && (
                <Badge size="sm" variant="light" color="cyan">
                  {frequencies.length}
                </Badge>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {frequenciesLoading ? (
              <Center py="md">
                <Loader size="sm" />
              </Center>
            ) : frequencies && frequencies.length > 0 ? (
              <Stack gap="sm">
                {Object.entries(groupedFrequencies).map(([use, freqs]) => (
                  <Box key={use}>
                    <Text size="xs" c="dimmed" fw={500} mb="xs">
                      {use}
                    </Text>
                    <ScrollArea>
                      <Table
                        striped
                        styles={{
                          table: { minWidth: 400 },
                          th: { color: 'var(--mantine-color-gray-4)', fontSize: '11px' },
                          td: { color: 'white', fontSize: '12px' },
                        }}
                      >
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Frequency</Table.Th>
                            <Table.Th>Name/Call</Table.Th>
                            <Table.Th>Remarks</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {freqs.map((freq, idx) => (
                            <Table.Tr key={`${freq.id}-${idx}`}>
                              <Table.Td>
                                <Text fw={600} c="cyan">
                                  {freq.frequency || '--'}
                                </Text>
                              </Table.Td>
                              <Table.Td>{freq.towerOrCommCall || freq.facilityName || '--'}</Table.Td>
                              <Table.Td>
                                <Text size="xs" lineClamp={1}>
                                  {freq.remark || freq.sectorization || '--'}
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" size="sm" ta="center" py="md">
                No frequency information available
              </Text>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
}

// Settings Tab Component
function FlightSettings({
  flight,
  userId,
}: {
  flight: FlightDto;
  userId: string;
}) {
  const [departureTime, setDepartureTime] = useState<Date | null>(
    flight.departureTime ? new Date(flight.departureTime) : null
  );
  const [altitude, setAltitude] = useState<number>(flight.plannedCruisingAltitude || 3000);
  const [profileId, setProfileId] = useState<string | null>(
    flight.aircraftPerformanceProfile?.id || null
  );
  const [aircraftId, setAircraftId] = useState<string | null>(
    flight.aircraftPerformanceProfile?.aircraftId || flight.aircraftId || null
  );
  const [hasChanges, setHasChanges] = useState(false);

  const { data: aircraftList, isLoading: isLoadingAircraft } = useGetAircraftQuery(userId, {
    skip: !userId,
  });

  const [updateFlight, { isLoading: isUpdating }] = useUpdateFlightMutation();
  const [regenerateNavlog, { isLoading: isRegenerating }] = useRegenerateNavlogMutation();

  // Get the selected aircraft and its profiles
  const selectedAircraft = useMemo(() => {
    return aircraftList?.find((a) => a.id === aircraftId);
  }, [aircraftList, aircraftId]);

  const profiles = selectedAircraft?.performanceProfiles || [];

  // Auto-select aircraft based on current profile when data loads
  useMemo(() => {
    if (aircraftList && profileId && !aircraftId) {
      const aircraftWithProfile = aircraftList.find((a) =>
        a.performanceProfiles?.some((p) => p.id === profileId)
      );
      if (aircraftWithProfile?.id) {
        setAircraftId(aircraftWithProfile.id);
      }
    }
  }, [aircraftList, profileId, aircraftId]);

  const handleAircraftChange = (newAircraftId: string | null) => {
    setAircraftId(newAircraftId);
    // Clear profile selection when aircraft changes
    setProfileId(null);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!flight.id) return;

    try {
      const flightUpdate: UpdateFlightRequestDto = {
        departureTime: departureTime || undefined,
        plannedCruisingAltitude: altitude,
        aircraftPerformanceProfileId: profileId || undefined,
      };

      await updateFlight({ userId, flightId: flight.id, flight: flightUpdate }).unwrap();

      notifications.show({
        title: 'Flight Updated',
        message: 'Flight settings have been saved.',
        color: 'green',
      });
      setHasChanges(false);
    } catch (error) {
      notifications.show({
        title: 'Update Failed',
        message: 'Unable to update flight settings.',
        color: 'red',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!flight.id) return;

    try {
      await regenerateNavlog({ userId, flightId: flight.id }).unwrap();

      notifications.show({
        title: 'Nav Log Regenerated',
        message: 'The navigation log has been recalculated.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Regeneration Failed',
        message: 'Unable to regenerate the navigation log.',
        color: 'red',
      });
    }
  };

  const aircraftOptions = useMemo(() => {
    return (
      aircraftList?.map((a) => ({
        value: a.id!,
        label: a.tailNumber ? `${a.aircraftType} (${a.tailNumber})` : a.aircraftType || 'Unnamed Aircraft',
      })) || []
    );
  }, [aircraftList]);

  const profileOptions = useMemo(() => {
    return profiles.map((p) => ({
      value: p.id!,
      label: p.profileName || 'Unnamed Profile',
      description: p.cruiseTrueAirspeed && p.cruiseFuelBurn
        ? `${p.cruiseTrueAirspeed} kts / ${p.cruiseFuelBurn} gph`
        : undefined,
    }));
  }, [profiles]);

  const inputStyles = {
    input: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      color: 'white',
    },
  };

  return (
    <Stack gap="lg">
      {/* Aircraft & Profile Selection */}
      <Paper
        p="lg"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Group gap="sm" mb="md">
          <FaPlane size={18} color="var(--vfr3d-primary)" />
          <Text fw={600} c="white">
            Aircraft & Performance
          </Text>
        </Group>

        <Stack gap="md">
          <Select
            label="Aircraft"
            placeholder={isLoadingAircraft ? 'Loading aircraft...' : 'Select an aircraft'}
            data={aircraftOptions}
            value={aircraftId}
            onChange={handleAircraftChange}
            disabled={isLoadingAircraft}
            styles={inputStyles}
            rightSection={isLoadingAircraft ? <Loader size="xs" /> : undefined}
          />

          {aircraftId && (
            <Select
              label="Performance Profile"
              placeholder={profiles.length === 0 ? 'No profiles available' : 'Select a profile'}
              data={profileOptions}
              value={profileId}
              onChange={(val) => {
                setProfileId(val);
                setHasChanges(true);
              }}
              disabled={profiles.length === 0}
              styles={inputStyles}
            />
          )}

          {aircraftId && profiles.length === 0 && (
            <Text size="sm" c="yellow">
              This aircraft has no performance profiles. Add profiles on the Aircraft page.
            </Text>
          )}

          {!aircraftId && aircraftList && aircraftList.length === 0 && (
            <Text size="sm" c="dimmed">
              No aircraft configured. Visit the Aircraft page to add your aircraft.
            </Text>
          )}
        </Stack>
      </Paper>

      {/* Flight Parameters */}
      <Paper
        p="lg"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Text fw={600} c="white" mb="md">
          Flight Parameters
        </Text>

        <Stack gap="md">
          <DateTimePicker
            label="Departure Time (UTC)"
            placeholder="Select departure time"
            value={departureTime}
            onChange={(date) => {
              setDepartureTime(date);
              setHasChanges(true);
            }}
            styles={inputStyles}
          />

          <NumberInput
            label="Cruising Altitude (ft MSL)"
            value={altitude}
            onChange={(val) => {
              setAltitude(typeof val === 'number' ? val : 3000);
              setHasChanges(true);
            }}
            min={500}
            max={45000}
            step={500}
            styles={inputStyles}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="cyan"
              leftSection={<FiRefreshCw size={16} />}
              onClick={handleRegenerate}
              loading={isRegenerating}
            >
              Regenerate Nav Log
            </Button>
            <Button
              leftSection={<FiSave size={16} />}
              onClick={handleSave}
              loading={isUpdating}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
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
      .filter((name, index, self) => self.indexOf(name) === index); // unique
  }, [flight?.waypoints]);

  const { data: airports } = useGetAirportsByIcaoCodesOrIdentsQuery(airportIdents, {
    skip: airportIdents.length === 0,
  });

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

  const navlogData = mapFlightToNavlogData(flight);

  return (
    <Container
      size="lg"
      py="xl"
      style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--vfr3d-background)' }}
    >
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              component={Link}
              to="/flights"
            >
              <FiArrowLeft size={20} />
            </ActionIcon>
            <Box>
              <Title order={2} c="white">
                {flight.name || 'Unnamed Flight'}
              </Title>
              <Text size="sm" c="dimmed">
                {flight.departureTime
                  ? new Date(flight.departureTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'No date set'}
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Badge variant="filled" color="blue" size="lg">
              {flight.waypoints?.length || 0} waypoints
            </Badge>
            <PDFDownloadLink
              document={<FlightLogPdf flightData={flight} airports={airports} />}
              fileName={`${flight.name || 'flight'}-navlog.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {/* @ts-expect-error Known TypeScript issue with react-pdf children render prop */}
              {({ loading }: { loading: boolean }) => (
                <Button
                  variant="light"
                  color="blue"
                  leftSection={loading ? <Loader size="xs" /> : <FiDownload size={16} />}
                  disabled={loading}
                >
                  {loading ? 'Preparing...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </Group>
        </Group>

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
              <Tabs.Tab value="airports">Airports</Tabs.Tab>
              <Tabs.Tab value="weather">Weather</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview">
              <FlightOverview flight={flight} />
            </Tabs.Panel>

            <Tabs.Panel value="navlog">
              {flight.legs && flight.legs.length > 0 ? (
                <NavLogTable navlog={navlogData} isRoundTrip={false} />
              ) : (
                <Center py="xl">
                  <Stack align="center" gap="md">
                    <FaRoute size={48} style={{ opacity: 0.3 }} />
                    <Text c="dimmed">
                      No navigation log available. Try regenerating from the Settings tab.
                    </Text>
                  </Stack>
                </Center>
              )}
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
