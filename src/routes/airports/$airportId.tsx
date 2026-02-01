import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Container,
  Text,
  Stack,
  Box,
  Center,
  Loader,
  Button,
  Card,
  Group,
  Badge,
  Title,
  SimpleGrid,
  Code,
  Alert,
  ThemeIcon,
  Tabs,
  Table,
  ScrollArea,
  Tooltip,
  ActionIcon,
  SegmentedControl,
  Paper,
} from '@mantine/core';
import {
  FiArrowLeft,
  FiExternalLink,
  FiMapPin,
  FiWind,
  FiCloud,
  FiThermometer,
  FiEye,
  FiAlertCircle,
  FiInfo,
  FiRadio,
  FiRefreshCw,
  FiFileText,
  FiAlertTriangle,
} from 'react-icons/fi';
import { TbPlane, TbRuler } from 'react-icons/tb';
import { FaRoute } from 'react-icons/fa';
import { ProtectedRoute } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useIsPhone, useIsDesktop } from '@/hooks';
import { useGetAirportByIcaoCodeOrIdentQuery, useGetRunwaysByAirportCodeQuery } from '@/redux/api/vfr3d/airports.api';
import { useGetMetarForAirportQuery, useGetTafForAirportQuery } from '@/redux/api/vfr3d/weather.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetAirportDiagramUrlByAirportCodeQuery } from '@/redux/api/vfr3d/airportDiagram.api';
import { useGetChartSupplementUrlByAirportCodeQuery } from '@/redux/api/vfr3d/chartSupplements.api';
import { useGetCrosswindForAirportQuery, useGetDensityAltitudeForAirportQuery } from '@/redux/api/vfr3d/performance.api';
import { useGetNotamsForAirportQuery } from '@/redux/api/vfr3d/notams.api';
import { AirportDto, RunwayDto, CommunicationFrequencyDto, MetarDto, TafDto } from '@/redux/api/vfr3d/dtos';
import { WeatherFlightCategories } from '@/utility/enums';
import { getWeatherErrorMessage } from '@/features/Weather';
import { NotamsList } from '@/features/FlightDetails/components/NotamsCard';

export const Route = createFileRoute('/airports/$airportId')({
  component: AirportDetailPage,
});

function AirportDetailPage() {
  return (
    <ProtectedRoute>
      <AirportDetailContent />
    </ProtectedRoute>
  );
}

// Helper functions
const getFlightCategoryColor = (category?: string): string => {
  switch (category) {
    case WeatherFlightCategories.VFR:
      return 'green';
    case WeatherFlightCategories.MVFR:
      return 'blue';
    case WeatherFlightCategories.IFR:
      return 'red';
    case WeatherFlightCategories.LIFR:
      return 'grape';
    default:
      return 'gray';
  }
};

const calculatePatternAltitude = (elevation: number | undefined | null): number | null => {
  if (elevation === undefined || elevation === null) return null;
  return Math.round((elevation + 1000) / 100) * 100;
};

const getCrosswindColor = (crosswindKt: number): string => {
  if (crosswindKt > 15) return 'red';
  if (crosswindKt > 10) return 'yellow';
  return 'green';
};

function AirportDetailContent() {
  const { airportId } = Route.useParams();
  const isPhone = useIsPhone();
  const isDesktop = useIsDesktop();
  const [notamViewMode, setNotamViewMode] = useState<'raw' | 'readable'>('raw');

  // Fetch airport data
  const {
    data: airport,
    isLoading: isAirportLoading,
    isError: isAirportError,
    refetch,
    isFetching,
  } = useGetAirportByIcaoCodeOrIdentQuery(airportId, { skip: !airportId });

  const icaoCodeOrIdent = airport?.icaoId || airport?.arptId || airportId || '';

  // Fetch all related data
  const {
    data: metar,
    isLoading: isLoadingMetar,
    isFetching: isMetarFetching,
    error: metarError,
    refetch: refetchMetar,
  } = useGetMetarForAirportQuery(icaoCodeOrIdent, {
    skip: !icaoCodeOrIdent,
    refetchOnMountOrArgChange: true,
    pollingInterval: 600000,
  });

  const {
    data: taf,
    isLoading: isLoadingTaf,
    isFetching: isTafFetching,
    error: tafError,
    refetch: refetchTaf,
  } = useGetTafForAirportQuery(icaoCodeOrIdent, {
    skip: !icaoCodeOrIdent,
    refetchOnMountOrArgChange: true,
    pollingInterval: 600000,
  });

  const {
    data: runways,
    isLoading: isRunwaysLoading,
    isFetching: isRunwaysFetching,
    refetch: refetchRunways,
  } = useGetRunwaysByAirportCodeQuery(icaoCodeOrIdent, { skip: !icaoCodeOrIdent });

  const {
    data: frequencies,
    isLoading: isFrequenciesLoading,
    isFetching: isFrequenciesFetching,
    refetch: refetchFrequencies,
  } = useGetFrequenciesByServicedFacilityQuery(airport?.arptId ?? '', { skip: !airport?.arptId });

  const { data: chartSupplementUrl } = useGetChartSupplementUrlByAirportCodeQuery(icaoCodeOrIdent, {
    skip: !icaoCodeOrIdent,
  });

  const { data: airportDiagramUrl } = useGetAirportDiagramUrlByAirportCodeQuery(icaoCodeOrIdent, {
    skip: !icaoCodeOrIdent,
  });

  const {
    data: densityAltitude,
    isLoading: isDensityAltitudeLoading,
    isFetching: isDensityAltFetching,
    refetch: refetchDensityAlt,
  } = useGetDensityAltitudeForAirportQuery({ icaoCodeOrIdent }, { skip: !icaoCodeOrIdent });

  const {
    data: crosswindData,
    isFetching: isCrosswindFetching,
    refetch: refetchCrosswind,
  } = useGetCrosswindForAirportQuery(icaoCodeOrIdent, { skip: !icaoCodeOrIdent });

  const {
    data: notamsData,
    isLoading: isNotamsLoading,
    isFetching: isNotamsFetching,
    error: notamsError,
    refetch: refetchNotams,
  } = useGetNotamsForAirportQuery(icaoCodeOrIdent, { skip: !icaoCodeOrIdent });

  // Handle refresh all
  const isRefreshingAll =
    isMetarFetching ||
    isTafFetching ||
    isRunwaysFetching ||
    isFrequenciesFetching ||
    isDensityAltFetching ||
    isCrosswindFetching ||
    isNotamsFetching;

  const handleRefreshAll = () => {
    refetchMetar();
    refetchTaf();
    refetchRunways();
    refetchFrequencies();
    refetchDensityAlt();
    refetchCrosswind();
    refetchNotams();
  };

  // Count critical NOTAMs
  const criticalNotamCount = useMemo(() => {
    if (!notamsData?.notams) return 0;
    return notamsData.notams.filter((n) => {
      const text = n.properties?.coreNOTAMData?.notam?.text?.toUpperCase() || '';
      return text.includes('CLSD') || text.includes('CLOSED') || text.includes('INOP') || text.includes('U/S');
    }).length;
  }, [notamsData]);

  // Loading state
  if (isAirportLoading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Center py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading airport information...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Error state
  if (isAirportError || !airport) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Stack gap="lg">
          <Button
            component={Link}
            to="/airports"
            variant="subtle"
            color="gray"
            leftSection={<FiArrowLeft size={16} />}
          >
            Back to Search
          </Button>
          <PageErrorState
            title="Airport Not Found"
            message={`We couldn't find an airport with the code "${airportId}". Please check the code and try again.`}
            onRetry={() => refetch()}
            isRetrying={isFetching}
            fullPage={false}
          />
        </Stack>
      </Container>
    );
  }

  const hasChartSupplement = !!chartSupplementUrl?.pdfUrl;
  const hasAirportDiagram = !!airportDiagramUrl?.pdfUrl;

  return (
    <Box style={{ minHeight: 'calc(100vh - 60px)', backgroundColor: 'var(--mantine-color-vfr3dSurface-9)' }}>
      {/* Header */}
      <Box
        py="lg"
        px="md"
        style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
        }}
      >
        <Container size="xl">
          <Stack gap="md">
            {/* Back button and actions */}
            <Group justify="space-between" wrap="wrap">
              <Button
                component={Link}
                to="/airports"
                variant="subtle"
                color="white"
                size="compact-sm"
                leftSection={<FiArrowLeft size={14} />}
              >
                Back
              </Button>
              <Group gap="sm">
                <Tooltip label="Refresh all data">
                  <Button
                    color="green" 
                    size={isPhone ? 'xs' : 'sm'}
                    leftSection={<FiRefreshCw size={14} />}
                    onClick={handleRefreshAll}
                    loading={isRefreshingAll}
                  >
                    {isPhone ? 'Refresh' : 'Refresh All'}
                  </Button>
                </Tooltip>
              </Group>
            </Group>

            {/* Airport ID and Name */}
            <Group gap="md" align="flex-start" wrap="wrap">
              <Box>
                <Group gap="sm" align="center">
                  <Title order={1} c="white" style={{ fontSize: isPhone ? '2rem' : '3rem' }}>
                    {airport.icaoId || airport.arptId}
                  </Title>
                  {metar?.flightCategory && (
                    <Badge size="lg" color={getFlightCategoryColor(metar.flightCategory)}>
                      {metar.flightCategory}
                    </Badge>
                  )}
                </Group>
                <Text c="blue.1" size={isPhone ? 'md' : 'lg'} mt={4}>
                  {airport.arptName}
                </Text>
                <Group gap="xs" mt={4}>
                  <FiMapPin size={14} color="var(--mantine-color-blue-3)" />
                  <Text c="blue.2" size="sm">
                    {airport.city}, {airport.stateCode}
                  </Text>
                </Group>
              </Box>

              {/* Quick Stats - Desktop only in header */}
              {!isPhone && (
                <SimpleGrid cols={3} spacing="lg" style={{ marginLeft: 'auto' }}>
                  <QuickStat label="Elevation" value={airport.elev ? `${airport.elev.toLocaleString()}'` : '--'} />
                  <QuickStat
                    label="TPA"
                    value={
                      calculatePatternAltitude(airport.elev)
                        ? `${calculatePatternAltitude(airport.elev)?.toLocaleString()}'`
                        : '--'
                    }
                  />
                  <QuickStat
                    label="Density Alt"
                    value={
                      isDensityAltitudeLoading
                        ? '...'
                        : densityAltitude?.densityAltitudeFt
                          ? `${densityAltitude.densityAltitudeFt.toLocaleString()}'`
                          : '--'
                    }
                    highlight={
                      densityAltitude?.densityAltitudeFt && airport.elev
                        ? densityAltitude.densityAltitudeFt - airport.elev > 1000
                        : false
                    }
                  />
                </SimpleGrid>
              )}
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container size="xl" py="lg">
        <Stack gap="lg">
          {/* Quick Stats Card - Mobile only */}
          {isPhone && (
            <Card padding="md" radius="md" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
              <SimpleGrid cols={3} spacing="xs">
                <StatBox label="Elevation" value={airport.elev ? `${airport.elev.toLocaleString()}'` : '--'} />
                <StatBox
                  label="TPA"
                  value={
                    calculatePatternAltitude(airport.elev)
                      ? `${calculatePatternAltitude(airport.elev)?.toLocaleString()}'`
                      : '--'
                  }
                />
                <StatBox
                  label="Density Alt"
                  value={
                    isDensityAltitudeLoading
                      ? '...'
                      : densityAltitude?.densityAltitudeFt
                        ? `${densityAltitude.densityAltitudeFt.toLocaleString()}'`
                        : '--'
                  }
                  highlight={
                    densityAltitude?.densityAltitudeFt && airport.elev
                      ? densityAltitude.densityAltitudeFt - airport.elev > 1000
                      : false
                  }
                />
              </SimpleGrid>
            </Card>
          )}

          {/* Document Links */}
          {(hasChartSupplement || hasAirportDiagram) && (
            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
              {hasChartSupplement && (
                <Button
                  component="a"
                  href={chartSupplementUrl!.pdfUrl}
                  target="_blank"
                  variant="light"
                  color="blue"
                  size="md"
                  leftSection={<FiExternalLink size={16} />}
                  fullWidth
                >
                  Chart Supplement
                </Button>
              )}
              {hasAirportDiagram && (
                <Button
                  component="a"
                  href={airportDiagramUrl!.pdfUrl}
                  target="_blank"
                  variant="light"
                  color="blue"
                  size="md"
                  leftSection={<FiExternalLink size={16} />}
                  fullWidth
                >
                  Airport Diagram
                </Button>
              )}
            </SimpleGrid>
          )}

          {/* Tabs */}
          <Card
            padding="lg"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <Tabs defaultValue="weather" color="blue">
              {isDesktop ? (
                <Tabs.List mb="md" grow>
                  <Tabs.Tab value="weather" leftSection={<FiCloud size={14} />}>
                    Weather
                  </Tabs.Tab>
                  <Tabs.Tab value="runways" leftSection={<TbPlane size={14} />}>
                    Runways
                  </Tabs.Tab>
                  <Tabs.Tab value="frequencies" leftSection={<FiRadio size={14} />}>
                    Frequencies
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="notams"
                    leftSection={<FiFileText size={14} />}
                    rightSection={
                      criticalNotamCount > 0 ? (
                        <Badge size="xs" color="red" variant="filled">
                          {criticalNotamCount}
                        </Badge>
                      ) : notamsData?.totalCount ? (
                        <Badge size="xs" color="gray" variant="light">
                          {notamsData.totalCount}
                        </Badge>
                      ) : null
                    }
                  >
                    NOTAMs
                  </Tabs.Tab>
                  <Tabs.Tab value="info" leftSection={<FiInfo size={14} />}>
                    Info
                  </Tabs.Tab>
                </Tabs.List>
              ) : (
                <Tabs.List mb="md" grow>
                  <Tabs.Tab value="weather" leftSection={<FiCloud size={16} />} />
                  <Tabs.Tab value="runways" leftSection={<TbPlane size={16} />} />
                  <Tabs.Tab value="frequencies" leftSection={<FiRadio size={16} />} />
                  <Tabs.Tab
                    value="notams"
                    leftSection={<FiFileText size={16} />}
                    rightSection={
                      criticalNotamCount > 0 ? (
                        <Badge size="xs" color="red" variant="filled">
                          {criticalNotamCount}
                        </Badge>
                      ) : null
                    }
                  />
                  <Tabs.Tab value="info" leftSection={<FiInfo size={16} />} />
                </Tabs.List>
              )}

              {/* Weather Tab */}
              <Tabs.Panel value="weather">
                <WeatherContent
                  metar={metar}
                  taf={taf}
                  isLoadingMetar={isLoadingMetar}
                  isLoadingTaf={isLoadingTaf}
                  metarError={metarError}
                  tafError={tafError}
                  onRefreshMetar={() => refetchMetar()}
                  onRefreshTaf={() => refetchTaf()}
                  isMetarRefreshing={isMetarFetching}
                  isTafRefreshing={isTafFetching}
                />
              </Tabs.Panel>

              {/* Runways Tab */}
              <Tabs.Panel value="runways">
                <RunwaysContent
                  runways={runways}
                  isLoading={isRunwaysLoading}
                  crosswindData={crosswindData}
                />
              </Tabs.Panel>

              {/* Frequencies Tab */}
              <Tabs.Panel value="frequencies">
                <FrequenciesContent frequencies={frequencies} isLoading={isFrequenciesLoading} isPhone={isPhone} />
              </Tabs.Panel>

              {/* NOTAMs Tab */}
              <Tabs.Panel value="notams">
                <Stack gap="md">
                  <Group justify="space-between" wrap="wrap">
                    <Group gap="sm">
                      <Text fw={500} c="white">
                        NOTAMs for {icaoCodeOrIdent}
                      </Text>
                      {notamsData?.totalCount !== undefined && (
                        <Badge variant="light" color="gray" size="sm">
                          {notamsData.totalCount} total
                        </Badge>
                      )}
                      {criticalNotamCount > 0 && (
                        <Badge variant="filled" color="red" size="sm">
                          {criticalNotamCount} critical
                        </Badge>
                      )}
                    </Group>
                    <Group gap="sm">
                      <SegmentedControl
                        size="xs"
                        value={notamViewMode}
                        onChange={(v) => setNotamViewMode(v as 'raw' | 'readable')}
                        data={[
                          { label: 'Raw', value: 'raw' },
                          { label: 'Translated', value: 'readable' },
                        ]}
                      />
                      <Tooltip label="Refresh NOTAMs">
                        <ActionIcon
                          variant="light"
                          color="orange"
                          onClick={() => refetchNotams()}
                          loading={isNotamsFetching}
                        >
                          <FiRefreshCw size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {notamViewMode === 'readable' && (
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

                  {isNotamsLoading ? (
                    <Center py="xl">
                      <Stack align="center" gap="sm">
                        <Loader size="md" />
                        <Text size="sm" c="dimmed">
                          Fetching NOTAMs...
                        </Text>
                      </Stack>
                    </Center>
                  ) : notamsError ? (
                    <Alert icon={<FiAlertCircle size={16} />} title="Failed to load NOTAMs" color="red" variant="light">
                      <Text size="sm">We couldn't retrieve NOTAMs for this airport. Please try again.</Text>
                    </Alert>
                  ) : (
                    <NotamsList notamsData={notamsData} viewMode={notamViewMode} />
                  )}
                </Stack>
              </Tabs.Panel>

              {/* Info Tab */}
              <Tabs.Panel value="info">
                <AirportInfoContent airport={airport} />
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

// Quick Stat for header (desktop)
function QuickStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box ta="center">
      <Text size="xs" c="blue.3" tt="uppercase" fw={500}>
        {label}
      </Text>
      <Text size="xl" c={highlight ? 'yellow' : 'white'} fw={700}>
        {value}
      </Text>
    </Box>
  );
}

// Stat Box for mobile card
function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box ta="center">
      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
        {label}
      </Text>
      <Text size="lg" c={highlight ? 'yellow' : 'white'} fw={600}>
        {value}
      </Text>
    </Box>
  );
}

// Weather Content
function WeatherContent({
  metar,
  taf,
  isLoadingMetar,
  isLoadingTaf,
  metarError,
  tafError,
  onRefreshMetar,
  onRefreshTaf,
  isMetarRefreshing,
  isTafRefreshing,
}: {
  metar?: MetarDto;
  taf?: TafDto;
  isLoadingMetar: boolean;
  isLoadingTaf: boolean;
  metarError: unknown;
  tafError: unknown;
  onRefreshMetar: () => void;
  onRefreshTaf: () => void;
  isMetarRefreshing: boolean;
  isTafRefreshing: boolean;
}) {
  const hasValidMetar = metar && !metarError;
  const isVariableWind = metar?.windDirDegrees === 'VRB' || metar?.windDirDegrees === 'Variable';

  return (
    <Stack gap="lg">
      {/* METAR Section */}
      <Paper p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size="md" variant="light" color="blue">
              <FiCloud size={16} />
            </ThemeIcon>
            <Text fw={600} c="white">
              Current Conditions (METAR)
            </Text>
          </Group>
          <Group gap="sm">
            {hasValidMetar && metar.flightCategory && (
              <Badge color={getFlightCategoryColor(metar.flightCategory)} size="lg">
                {metar.flightCategory}
              </Badge>
            )}
            <Tooltip label="Refresh METAR">
              <ActionIcon
                variant="light"
                color="orange"
                onClick={onRefreshMetar}
                loading={isMetarRefreshing}
              >
                <FiRefreshCw size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {isLoadingMetar ? (
          <Group gap="sm">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">
              Loading METAR...
            </Text>
          </Group>
        ) : metarError ? (
          <Alert icon={<FiAlertCircle size={16} />} color="red" variant="light" title="METAR unavailable">
            {getWeatherErrorMessage(metarError as any)}
          </Alert>
        ) : hasValidMetar ? (
          <Stack gap="md">
            {/* Raw METAR */}
            <Code block style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              {metar.rawText}
            </Code>

            {/* Decoded Weather */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              {(metar.windDirDegrees || metar.windSpeedKt) && (
                <WeatherItem
                  icon={<FiWind size={16} />}
                  label="Wind"
                  value={
                    <>
                      {isVariableWind ? 'VRB' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt}kt
                      {metar.windGustKt && (
                        <Text span c="yellow" fw={600}>
                          {' '}
                          G{metar.windGustKt}
                        </Text>
                      )}
                    </>
                  }
                />
              )}
              {metar.visibilityStatuteMi && (
                <WeatherItem icon={<FiEye size={16} />} label="Visibility" value={`${metar.visibilityStatuteMi} SM`} />
              )}
              {(metar.tempC !== undefined || metar.dewpointC !== undefined) && (
                <WeatherItem
                  icon={<FiThermometer size={16} />}
                  label="Temp/Dew"
                  value={`${metar.tempC}°C / ${metar.dewpointC}°C`}
                />
              )}
              {metar.altimInHg && (
                <WeatherItem icon={<TbRuler size={16} />} label="Altimeter" value={`${metar.altimInHg.toFixed(2)}"`} />
              )}
            </SimpleGrid>

            {/* Sky Conditions */}
            {metar.skyCondition && metar.skyCondition.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Sky Conditions
                </Text>
                <Group gap="xs">
                  {metar.skyCondition.map((sky, idx) => (
                    <Badge key={idx} variant="light" color="blue">
                      {sky.skyCover}
                      {sky.cloudBaseFtAgl ? ` @ ${sky.cloudBaseFtAgl.toLocaleString()}'` : ''}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            {metar.observationTime && (
              <Text size="xs" c="dimmed">
                Observed: {new Date(metar.observationTime).toLocaleString()}
              </Text>
            )}
          </Stack>
        ) : (
          <Text c="dimmed" size="sm">
            No METAR available
          </Text>
        )}
      </Paper>

      {/* TAF Section */}
      <Paper p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size="md" variant="light" color="cyan">
              <FaRoute size={14} />
            </ThemeIcon>
            <Text fw={600} c="white">
              Forecast (TAF)
            </Text>
          </Group>
          <Tooltip label="Refresh TAF">
            <ActionIcon
              variant="light"
              color="orange"
              onClick={onRefreshTaf}
              loading={isTafRefreshing}
            >
              <FiRefreshCw size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {isLoadingTaf ? (
          <Group gap="sm">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">
              Loading TAF...
            </Text>
          </Group>
        ) : tafError ? (
          <Alert icon={<FiAlertCircle size={16} />} color="orange" variant="light" title="TAF unavailable">
            {getWeatherErrorMessage(tafError as any)}
          </Alert>
        ) : taf ? (
          <Stack gap="md">
            <Code block style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {taf.rawText}
            </Code>
            {taf.issueTime && (
              <Text size="xs" c="dimmed">
                Issued: {new Date(taf.issueTime).toLocaleString()}
              </Text>
            )}
          </Stack>
        ) : (
          <Text c="dimmed" size="sm">
            No TAF available
          </Text>
        )}
      </Paper>
    </Stack>
  );
}

function WeatherItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Group gap="sm" wrap="nowrap">
      <Box c="blue.4">{icon}</Box>
      <Box>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="sm" c="white" fw={500}>
          {value}
        </Text>
      </Box>
    </Group>
  );
}

// Runways Content
function RunwaysContent({
  runways,
  isLoading,
  crosswindData,
}: {
  runways?: RunwayDto[];
  isLoading: boolean;
  crosswindData?: any;
}) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading runways...
          </Text>
        </Group>
      </Center>
    );
  }

  if (!runways || runways.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No runway information available</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {/* Current Wind Banner */}
      {crosswindData && (crosswindData.windDirectionDegrees || crosswindData.isVariableWind) && (
        <Paper p="md" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <Group justify="space-between" wrap="wrap">
            <Group gap="sm">
              <FiWind size={18} color="var(--mantine-color-blue-4)" />
              <Text size="sm" c="white">
                <Text span c="dimmed">
                  Current Wind:{' '}
                </Text>
                {crosswindData.isVariableWind ? (
                  'Variable'
                ) : (
                  <>
                    {crosswindData.windDirectionDegrees}° @ {crosswindData.windSpeedKt}kt
                    {crosswindData.windGustKt && (
                      <Text span c="yellow" fw={600}>
                        {' '}
                        G{crosswindData.windGustKt}
                      </Text>
                    )}
                  </>
                )}
              </Text>
            </Group>
            {crosswindData.recommendedRunway && (
              <Badge color="green" size="lg">
                Recommended: Runway {crosswindData.recommendedRunway}
              </Badge>
            )}
          </Group>
        </Paper>
      )}

      {/* Runway Cards */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {runways.map((runway) => (
          <RunwayCard key={runway.id || runway.runwayId} runway={runway} crosswindData={crosswindData} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function RunwayCard({ runway, crosswindData }: { runway: RunwayDto; crosswindData?: any }) {
  const formatSurface = (type?: string) => {
    if (!type || type === 'Unknown') return 'Unknown';
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Paper p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} size="lg" c="white">
            Runway {runway.runwayId}
          </Text>
          <Badge variant="outline" size="md">
            {runway.length?.toLocaleString()} × {runway.width} ft
          </Badge>
        </Group>

        <SimpleGrid cols={2} spacing="xs">
          <Box>
            <Text size="xs" c="dimmed">
              Surface
            </Text>
            <Text size="sm" c="white">
              {formatSurface(runway.surfaceType)}
            </Text>
          </Box>
          {runway.edgeLightIntensity && runway.edgeLightIntensity !== 'None' && (
            <Box>
              <Text size="xs" c="dimmed">
                Lighting
              </Text>
              <Text size="sm" c="white">
                {runway.edgeLightIntensity}
              </Text>
            </Box>
          )}
        </SimpleGrid>

        {/* Crosswind info for each runway end */}
        {crosswindData?.runways && runway.runwayEnds && (
          <Group gap="xs" mt="xs">
            {runway.runwayEnds.map((end) => {
              const cw = crosswindData.runways.find((r: any) => r.runwayEndId === end.runwayEndId);
              if (!cw) return null;
              const xw = Math.abs(cw.crosswindKt ?? 0);
              const hw = cw.headwindKt ?? 0;
              const isRecommended = end.runwayEndId === crosswindData.recommendedRunway;
              return (
                <Tooltip
                  key={end.runwayEndId}
                  label={`Headwind: ${hw >= 0 ? '+' : ''}${hw.toFixed(0)}kt, Crosswind: ${xw.toFixed(0)}kt`}
                >
                  <Badge
                    size="md"
                    color={isRecommended ? 'green' : getCrosswindColor(xw)}
                    variant={isRecommended ? 'filled' : 'light'}
                  >
                    {end.runwayEndId}: XW {xw.toFixed(0)}kt
                  </Badge>
                </Tooltip>
              );
            })}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

// Frequencies Content
function FrequenciesContent({
  frequencies,
  isLoading,
  isPhone,
}: {
  frequencies?: CommunicationFrequencyDto[];
  isLoading: boolean;
  isPhone: boolean;
}) {
  const translateFreqUse = (freqUse: string | null): string => {
    const translations: Record<string, string> = {
      'APCH/P': 'Approach',
      'DEP/P': 'Departure',
      'LCL/P': 'Tower',
      'GND/P': 'Ground',
      'CD PRE TAXI CLNC': 'Clearance Delivery',
      'CD/P': 'Clearance',
      'D-ATIS': 'ATIS',
      UNICOM: 'UNICOM',
      CTAF: 'CTAF',
      'EMERG': 'Emergency',
      'APP/DEP': 'Approach/Departure',
    };
    return translations[freqUse || ''] || freqUse || 'Other';
  };

  // Group frequencies by use
  const groupedFrequencies = useMemo(() => {
    if (!frequencies) return {};
    return frequencies.reduce(
      (acc, freq) => {
        const use = translateFreqUse(freq.frequencyUse ?? '');
        if (!acc[use]) acc[use] = [];
        acc[use].push(freq);
        return acc;
      },
      {} as Record<string, CommunicationFrequencyDto[]>
    );
  }, [frequencies]);

  // Sort frequency groups
  const sortOrder = [
    'CTAF',
    'UNICOM',
    'Tower',
    'Ground',
    'Clearance Delivery',
    'Clearance',
    'ATIS',
    'Approach',
    'Departure',
    'Approach/Departure',
    'Emergency',
  ];

  const sortedGroups = useMemo(() => {
    return Object.keys(groupedFrequencies).sort((a, b) => {
      const indexA = sortOrder.indexOf(a);
      const indexB = sortOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedFrequencies]);

  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="sm">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading frequencies...
          </Text>
        </Group>
      </Center>
    );
  }

  if (!frequencies || frequencies.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No frequency information available</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      {sortedGroups.map((group) => (
        <Paper key={group} p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <Group gap="sm" mb="md">
            <ThemeIcon size="sm" variant="light" color="cyan">
              <FiRadio size={12} />
            </ThemeIcon>
            <Text fw={600} c="white">
              {group}
            </Text>
            <Badge size="sm" variant="light" color="gray">
              {groupedFrequencies[group].length}
            </Badge>
          </Group>

          <ScrollArea>
            <Table
              striped
              highlightOnHover
              styles={{
                table: { minWidth: isPhone ? 300 : 500 },
                th: { color: 'var(--mantine-color-gray-4)', fontSize: '12px' },
                td: { color: 'white', fontSize: '13px' },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Frequency</Table.Th>
                  <Table.Th>Name/Call</Table.Th>
                  {!isPhone && <Table.Th>Remarks</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {groupedFrequencies[group].map((freq, idx) => (
                  <Table.Tr key={`${freq.id}-${idx}`}>
                    <Table.Td>
                      <Text fw={600} c="cyan" style={{ fontFamily: 'monospace' }}>
                        {freq.frequency || '--'}
                      </Text>
                    </Table.Td>
                    <Table.Td>{freq.towerOrCommCall || freq.facilityName || '--'}</Table.Td>
                    {!isPhone && (
                      <Table.Td>
                        <Text size="xs" lineClamp={2}>
                          {freq.remark || freq.sectorization || '--'}
                        </Text>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ))}
    </Stack>
  );
}

// Airport Info Content
function AirportInfoContent({ airport }: { airport: AirportDto }) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {/* General Info */}
      <Paper p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Group gap="sm" mb="md">
          <ThemeIcon size="md" variant="light" color="blue">
            <FiInfo size={16} />
          </ThemeIcon>
          <Text fw={600} c="white">
            General Information
          </Text>
        </Group>
        <Stack gap="sm">
          {airport.icaoId && <InfoRow label="ICAO Code" value={airport.icaoId} />}
          {airport.arptId && <InfoRow label="FAA ID" value={airport.arptId} />}
          {airport.siteTypeCode && <InfoRow label="Type" value={airport.siteTypeCode} />}
          {airport.fuelTypes && <InfoRow label="Fuel Available" value={airport.fuelTypes} />}
          {airport.arptStatus && <InfoRow label="Status" value={airport.arptStatus} />}
        </Stack>
      </Paper>

      {/* Location */}
      <Paper p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <Group gap="sm" mb="md">
          <ThemeIcon size="md" variant="light" color="green">
            <FiMapPin size={16} />
          </ThemeIcon>
          <Text fw={600} c="white">
            Location
          </Text>
        </Group>
        <Stack gap="sm">
          {airport.city && <InfoRow label="City" value={airport.city} />}
          {airport.stateName && <InfoRow label="State" value={airport.stateName} />}
          {airport.latDecimal && airport.longDecimal && (
            <InfoRow label="Coordinates" value={`${airport.latDecimal.toFixed(4)}°, ${airport.longDecimal.toFixed(4)}°`} />
          )}
          {airport.magVarn && <InfoRow label="Mag Variation" value={`${airport.magVarn}° ${airport.magHemis || ''}`} />}
          {airport.elev && <InfoRow label="Field Elevation" value={`${airport.elev.toLocaleString()} ft MSL`} />}
        </Stack>
      </Paper>

      {/* Contact Info (if available) */}
      {(airport.contactName || airport.contactPhoneNumber) && (
        <Paper p="md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
          <Group gap="sm" mb="md">
            <ThemeIcon size="md" variant="light" color="grape">
              <FiRadio size={16} />
            </ThemeIcon>
            <Text fw={600} c="white">
              Contact
            </Text>
          </Group>
          <Stack gap="sm">
            {airport.contactName && <InfoRow label="Name" value={airport.contactName} />}
            {airport.contactPhoneNumber && <InfoRow label="Phone" value={airport.contactPhoneNumber} />}
          </Stack>
        </Paper>
      )}
    </SimpleGrid>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" c="white" ta="right" fw={500}>
        {value}
      </Text>
    </Group>
  );
}
