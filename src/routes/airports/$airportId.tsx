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
  Alert,
  Tabs,
  Tooltip,
  ActionIcon,
  SegmentedControl,
} from '@mantine/core';
import {
  FiArrowLeft,
  FiExternalLink,
  FiMapPin,
  FiCloud,
  FiAlertCircle,
  FiInfo,
  FiRadio,
  FiRefreshCw,
  FiFileText,
  FiAlertTriangle,
} from 'react-icons/fi';
import { TbPlane } from 'react-icons/tb';
import { ProtectedRoute } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useIsPhone, useIsDesktop } from '@/hooks';
import {
  useGetAirportByIcaoCodeOrIdentQuery,
  useGetRunwaysByAirportCodeQuery,
} from '@/redux/api/vfr3d/airports.api';
import {
  useGetMetarForAirportQuery,
  useGetTafForAirportQuery,
} from '@/redux/api/vfr3d/weather.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetAirportDiagramUrlByAirportCodeQuery } from '@/redux/api/vfr3d/airportDiagram.api';
import { useGetChartSupplementUrlByAirportCodeQuery } from '@/redux/api/vfr3d/chartSupplements.api';
import {
  useGetCrosswindForAirportQuery,
  useGetDensityAltitudeForAirportQuery,
} from '@/redux/api/vfr3d/performance.api';
import { useGetNotamsForAirportQuery } from '@/redux/api/vfr3d/notams.api';
import { WeatherFlightCategories } from '@/utility/enums';
import { NotamsList } from '@/features/FlightDetails/components/NotamsCard';
import { isCriticalNotam } from '@/features/FlightDetails/utils/notamAbbreviations';
import {
  QuickStat,
  StatBox,
  WeatherContent,
  RunwaysContent,
  FrequenciesContent,
  AirportInfoContent,
} from '@/features/Airports/components';

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
      const text = n.properties?.coreNOTAMData?.notam?.text || '';
      return isCriticalNotam(text);
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
    <Box
      style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
      }}
    >
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
                    color="teal"
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
                  <QuickStat
                    label="Elevation"
                    value={airport.elev ? `${airport.elev.toLocaleString()}'` : '--'}
                  />
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
                <StatBox
                  label="Elevation"
                  value={airport.elev ? `${airport.elev.toLocaleString()}'` : '--'}
                />
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
                  color="blue"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'indigo', deg: 45 }}
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
                  color="blue"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'indigo', deg: 45 }}
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
                <FrequenciesContent
                  frequencies={frequencies}
                  isLoading={isFrequenciesLoading}
                  isPhone={isPhone}
                />
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
                    <Alert
                      icon={<FiAlertCircle size={16} />}
                      title="Failed to load NOTAMs"
                      color="red"
                      variant="light"
                    >
                      <Text size="sm">
                        We couldn't retrieve NOTAMs for this airport. Please try again.
                      </Text>
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
