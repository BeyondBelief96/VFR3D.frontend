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
  Divider,
  Code,
  Alert,
  ThemeIcon,
  Collapse,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  FiArrowLeft,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiWind,
  FiCloud,
  FiThermometer,
  FiEye,
  FiAlertCircle,
  FiInfo,
  FiRadio,
} from 'react-icons/fi';
import { TbPlane, TbRuler } from 'react-icons/tb';
import { ProtectedRoute } from '@/components/Auth';
import { PageErrorState } from '@/components/Common';
import { useGetAirportByIcaoCodeOrIdentQuery, useGetRunwaysByAirportCodeQuery } from '@/redux/api/vfr3d/airports.api';
import { useGetMetarForAirportQuery, useGetTafForAirportQuery } from '@/redux/api/vfr3d/weather.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetAirportDiagramUrlByAirportCodeQuery } from '@/redux/api/vfr3d/airportDiagram.api';
import { useGetChartSupplementUrlByAirportCodeQuery } from '@/redux/api/vfr3d/chartSupplements.api';
import { useGetCrosswindForAirportQuery, useGetDensityAltitudeForAirportQuery } from '@/redux/api/vfr3d/performance.api';
import { AirportDto, RunwayDto, CommunicationFrequencyDto, MetarDto, TafDto } from '@/redux/api/vfr3d/dtos';
import { WeatherFlightCategories } from '@/utility/enums';
import { getWeatherErrorMessage } from '@/features/Weather';

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
  const { data: metar, isLoading: isLoadingMetar, error: metarError } = useGetMetarForAirportQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent, refetchOnMountOrArgChange: true, pollingInterval: 600000 }
  );

  const { data: taf, isLoading: isLoadingTaf, error: tafError } = useGetTafForAirportQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent, refetchOnMountOrArgChange: true, pollingInterval: 600000 }
  );

  const { data: runways, isLoading: isRunwaysLoading } = useGetRunwaysByAirportCodeQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent }
  );

  const { data: frequencies, isLoading: isFrequenciesLoading } = useGetFrequenciesByServicedFacilityQuery(
    airport?.arptId ?? '',
    { skip: !airport?.arptId }
  );

  const { data: chartSupplementUrl } = useGetChartSupplementUrlByAirportCodeQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent }
  );

  const { data: airportDiagramUrl } = useGetAirportDiagramUrlByAirportCodeQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent }
  );

  const { data: densityAltitude, isLoading: isDensityAltitudeLoading } = useGetDensityAltitudeForAirportQuery(
    { icaoCodeOrIdent },
    { skip: !icaoCodeOrIdent }
  );

  const { data: crosswindData } = useGetCrosswindForAirportQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent }
  );

  // Loading state
  if (isAirportLoading) {
    return (
      <Container size="sm" py="xl" style={{ minHeight: 'calc(100vh - 60px)' }}>
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
      <Container size="sm" py="xl" style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Stack gap="lg">
          <Button component={Link} to="/airports" variant="subtle" color="gray" leftSection={<FiArrowLeft size={16} />}>
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
        <Container size="sm">
          <Stack gap="md">
            {/* Back button */}
            <Button
              component={Link}
              to="/airports"
              variant="subtle"
              color="white"
              size="compact-sm"
              leftSection={<FiArrowLeft size={14} />}
              style={{ alignSelf: 'flex-start', marginLeft: -8 }}
            >
              Back
            </Button>

            {/* Airport ID and Name */}
            <Group gap="sm" align="center">
              <Title order={1} c="white" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                {airport.icaoId || airport.arptId}
              </Title>
              {metar?.flightCategory && (
                <Badge size="lg" color={getFlightCategoryColor(metar.flightCategory)}>
                  {metar.flightCategory}
                </Badge>
              )}
            </Group>

            <Text c="blue.1" size="lg">
              {airport.arptName}
            </Text>

            {/* Location */}
            <Group gap="xs">
              <FiMapPin size={14} color="var(--mantine-color-blue-3)" />
              <Text c="blue.2" size="sm">
                {airport.city}, {airport.stateCode}
              </Text>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container size="sm" py="md">
        <Stack gap="md">
          {/* Quick Stats Card */}
          <Card padding="md" radius="md" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
            <SimpleGrid cols={3} spacing="xs">
              <StatBox
                label="Elevation"
                value={airport.elev ? `${airport.elev.toLocaleString()}'` : '--'}
              />
              <StatBox
                label="TPA"
                value={calculatePatternAltitude(airport.elev) ? `${calculatePatternAltitude(airport.elev)?.toLocaleString()}'` : '--'}
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

          {/* Weather Section */}
          <WeatherSection
            metar={metar}
            taf={taf}
            isLoadingMetar={isLoadingMetar}
            isLoadingTaf={isLoadingTaf}
            metarError={metarError}
            tafError={tafError}
          />

          {/* Runways Section */}
          <RunwaysSection
            runways={runways}
            isLoading={isRunwaysLoading}
            crosswindData={crosswindData}
          />

          {/* Frequencies Section */}
          <FrequenciesSection frequencies={frequencies} isLoading={isFrequenciesLoading} />

          {/* Airport Info Section */}
          <AirportInfoSection airport={airport} />
        </Stack>
      </Container>
    </Box>
  );
}

// Stat Box Component
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

// Collapsible Section Component
function CollapsibleSection({
  icon,
  title,
  children,
  defaultOpen = false,
  rightSection,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  rightSection?: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure(defaultOpen);

  return (
    <Card padding={0} radius="md" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', overflow: 'hidden' }}>
      <UnstyledButton onClick={toggle} w="100%" p="md">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size="md" variant="light" color="blue">
              {icon}
            </ThemeIcon>
            <Text fw={600} c="white">
              {title}
            </Text>
          </Group>
          <Group gap="sm" wrap="nowrap">
            {rightSection}
            {opened ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </Group>
        </Group>
      </UnstyledButton>
      <Collapse in={opened}>
        <Box px="md" pb="md">
          {children}
        </Box>
      </Collapse>
    </Card>
  );
}

// Weather Section
function WeatherSection({
  metar,
  taf,
  isLoadingMetar,
  isLoadingTaf,
  metarError,
  tafError,
}: {
  metar?: MetarDto;
  taf?: TafDto;
  isLoadingMetar: boolean;
  isLoadingTaf: boolean;
  metarError: unknown;
  tafError: unknown;
}) {
  const hasValidMetar = metar && !metarError;
  const isVariableWind = metar?.windDirDegrees === 'VRB' || metar?.windDirDegrees === 'Variable';

  return (
    <CollapsibleSection icon={<FiCloud size={16} />} title="Weather" defaultOpen={true}>
      <Stack gap="md">
        {/* METAR */}
        {isLoadingMetar ? (
          <Group gap="sm">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">Loading METAR...</Text>
          </Group>
        ) : metarError ? (
          <Alert icon={<FiAlertCircle size={16} />} color="red" variant="light" title="METAR unavailable">
            {getWeatherErrorMessage(metarError as any)}
          </Alert>
        ) : hasValidMetar ? (
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600} c="white">Current Conditions</Text>
              {metar.flightCategory && (
                <Badge color={getFlightCategoryColor(metar.flightCategory)}>
                  {metar.flightCategory}
                </Badge>
              )}
            </Group>

            {/* Raw METAR */}
            <Code block style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {metar.rawText}
            </Code>

            {/* Decoded Weather */}
            <SimpleGrid cols={2} spacing="xs">
              {(metar.windDirDegrees || metar.windSpeedKt) && (
                <WeatherItem
                  icon={<FiWind size={14} />}
                  label="Wind"
                  value={
                    <>
                      {isVariableWind ? 'VRB' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt}kt
                      {metar.windGustKt && <Text span c="yellow"> G{metar.windGustKt}</Text>}
                    </>
                  }
                />
              )}
              {metar.visibilityStatuteMi && (
                <WeatherItem icon={<FiEye size={14} />} label="Visibility" value={`${metar.visibilityStatuteMi} SM`} />
              )}
              {(metar.tempC !== undefined || metar.dewpointC !== undefined) && (
                <WeatherItem
                  icon={<FiThermometer size={14} />}
                  label="Temp/Dew"
                  value={`${metar.tempC}°C / ${metar.dewpointC}°C`}
                />
              )}
              {metar.altimInHg && (
                <WeatherItem icon={<TbRuler size={14} />} label="Altimeter" value={`${metar.altimInHg.toFixed(2)}"`} />
              )}
            </SimpleGrid>

            {/* Sky Conditions */}
            {metar.skyCondition && metar.skyCondition.length > 0 && (
              <Box>
                <Text size="xs" c="dimmed" mb={4}>Sky Conditions</Text>
                <Group gap="xs">
                  {metar.skyCondition.map((sky, idx) => (
                    <Badge key={idx} variant="light" color="blue" size="sm">
                      {sky.skyCover}{sky.cloudBaseFtAgl ? ` @ ${sky.cloudBaseFtAgl.toLocaleString()}'` : ''}
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
          <Text c="dimmed" size="sm">No METAR available</Text>
        )}

        <Divider color="dark.4" />

        {/* TAF */}
        {isLoadingTaf ? (
          <Group gap="sm">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">Loading TAF...</Text>
          </Group>
        ) : tafError ? (
          <Alert icon={<FiAlertCircle size={16} />} color="orange" variant="light" title="TAF unavailable">
            {getWeatherErrorMessage(tafError as any)}
          </Alert>
        ) : taf ? (
          <Stack gap="sm">
            <Text size="sm" fw={600} c="white">Forecast (TAF)</Text>
            <Code block style={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
              {taf.rawText}
            </Code>
            {taf.issueTime && (
              <Text size="xs" c="dimmed">
                Issued: {new Date(taf.issueTime).toLocaleString()}
              </Text>
            )}
          </Stack>
        ) : (
          <Text c="dimmed" size="sm">No TAF available</Text>
        )}
      </Stack>
    </CollapsibleSection>
  );
}

function WeatherItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Group gap="xs" wrap="nowrap">
      {icon}
      <Box>
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="sm" c="white">{value}</Text>
      </Box>
    </Group>
  );
}

// Runways Section
function RunwaysSection({
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
      <Card padding="md" radius="md" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
        <Group gap="sm">
          <Loader size="xs" />
          <Text size="sm" c="dimmed">Loading runways...</Text>
        </Group>
      </Card>
    );
  }

  if (!runways || runways.length === 0) {
    return (
      <CollapsibleSection icon={<TbPlane size={16} />} title="Runways">
        <Text c="dimmed" size="sm">No runway information available</Text>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      icon={<TbPlane size={16} />}
      title="Runways"
      defaultOpen={true}
      rightSection={
        crosswindData?.recommendedRunway && (
          <Badge color="green" size="sm">Best: {crosswindData.recommendedRunway}</Badge>
        )
      }
    >
      <Stack gap="sm">
        {/* Current Wind */}
        {crosswindData && (crosswindData.windDirectionDegrees || crosswindData.isVariableWind) && (
          <Card padding="sm" radius="sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Text size="sm">
              <Text span c="dimmed">Wind: </Text>
              {crosswindData.isVariableWind ? (
                'Variable'
              ) : (
                <>
                  {crosswindData.windDirectionDegrees}° @ {crosswindData.windSpeedKt}kt
                  {crosswindData.windGustKt && <Text span c="yellow" fw={600}> G{crosswindData.windGustKt}</Text>}
                </>
              )}
            </Text>
          </Card>
        )}

        {/* Runway Cards */}
        {runways.map((runway) => (
          <RunwayCard key={runway.id || runway.runwayId} runway={runway} crosswindData={crosswindData} />
        ))}
      </Stack>
    </CollapsibleSection>
  );
}

function RunwayCard({ runway, crosswindData }: { runway: RunwayDto; crosswindData?: any }) {
  const formatSurface = (type?: string) => {
    if (!type || type === 'Unknown') return 'Unknown';
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Card padding="sm" radius="sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} c="white">Runway {runway.runwayId}</Text>
          <Badge variant="outline" size="sm">
            {runway.length?.toLocaleString()} × {runway.width} ft
          </Badge>
        </Group>

        <Text size="xs" c="dimmed">
          Surface: {formatSurface(runway.surfaceType)}
          {runway.edgeLightIntensity && runway.edgeLightIntensity !== 'None' && ` • Lights: ${runway.edgeLightIntensity}`}
        </Text>

        {/* Crosswind info for each runway end */}
        {crosswindData?.runways && runway.runwayEnds && (
          <Group gap="xs">
            {runway.runwayEnds.map((end) => {
              const cw = crosswindData.runways.find((r: any) => r.runwayEndId === end.runwayEndId);
              if (!cw) return null;
              const xw = Math.abs(cw.crosswindKt ?? 0);
              const isRecommended = end.runwayEndId === crosswindData.recommendedRunway;
              return (
                <Badge
                  key={end.runwayEndId}
                  size="sm"
                  color={isRecommended ? 'green' : getCrosswindColor(xw)}
                  variant={isRecommended ? 'filled' : 'light'}
                >
                  {end.runwayEndId}: XW {xw.toFixed(0)}kt
                </Badge>
              );
            })}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

// Frequencies Section
function FrequenciesSection({
  frequencies,
  isLoading,
}: {
  frequencies?: CommunicationFrequencyDto[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card padding="md" radius="md" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
        <Group gap="sm">
          <Loader size="xs" />
          <Text size="sm" c="dimmed">Loading frequencies...</Text>
        </Group>
      </Card>
    );
  }

  if (!frequencies || frequencies.length === 0) {
    return (
      <CollapsibleSection icon={<FiRadio size={16} />} title="Frequencies">
        <Text c="dimmed" size="sm">No frequency information available</Text>
      </CollapsibleSection>
    );
  }

  const translateFreqUse = (freqUse: string | null): string => {
    const translations: Record<string, string> = {
      'APCH/P': 'Approach',
      'DEP/P': 'Departure',
      'LCL/P': 'Tower',
      'GND/P': 'Ground',
      'CD PRE TAXI CLNC': 'Clearance',
      'D-ATIS': 'ATIS',
      'UNICOM': 'UNICOM',
    };
    return translations[freqUse || ''] || freqUse || 'Other';
  };

  // Group and sort frequencies
  const sortedFreqs = [...frequencies].sort((a, b) => {
    const order = ['LCL/P', 'GND/P', 'APCH/P', 'DEP/P', 'CD PRE TAXI CLNC', 'D-ATIS', 'UNICOM'];
    const indexA = order.indexOf(a.frequencyUse ?? '');
    const indexB = order.indexOf(b.frequencyUse ?? '');
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <CollapsibleSection icon={<FiRadio size={16} />} title="Frequencies">
      <Stack gap="xs">
        {sortedFreqs.slice(0, 10).map((freq, idx) => (
          <Group key={idx} justify="space-between" wrap="nowrap" py={4}>
            <Text size="sm" c="dimmed">{translateFreqUse(freq.frequencyUse ?? '')}</Text>
            <Text size="sm" c="white" fw={600} ff="monospace">{freq.frequency}</Text>
          </Group>
        ))}
        {frequencies.length > 10 && (
          <Text size="xs" c="dimmed" ta="center">
            + {frequencies.length - 10} more frequencies
          </Text>
        )}
      </Stack>
    </CollapsibleSection>
  );
}

// Airport Info Section
function AirportInfoSection({ airport }: { airport: AirportDto }) {
  return (
    <CollapsibleSection icon={<FiInfo size={16} />} title="Airport Information">
      <Stack gap="md">
        {/* General Info */}
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="xs">General</Text>
          <Stack gap={4}>
            {airport.icaoId && <InfoRow label="ICAO" value={airport.icaoId} />}
            {airport.arptId && <InfoRow label="FAA ID" value={airport.arptId} />}
            {airport.siteTypeCode && <InfoRow label="Type" value={airport.siteTypeCode} />}
            {airport.fuelTypes && <InfoRow label="Fuel" value={airport.fuelTypes} />}
          </Stack>
        </Box>

        <Divider color="dark.4" />

        {/* Location */}
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="xs">Location</Text>
          <Stack gap={4}>
            {airport.city && <InfoRow label="City" value={airport.city} />}
            {airport.stateName && <InfoRow label="State" value={airport.stateName} />}
            {airport.latDecimal && airport.longDecimal && (
              <InfoRow
                label="Coordinates"
                value={`${airport.latDecimal.toFixed(4)}°, ${airport.longDecimal.toFixed(4)}°`}
              />
            )}
            {airport.magVarn && (
              <InfoRow label="Mag Var" value={`${airport.magVarn}° ${airport.magHemis || ''}`} />
            )}
          </Stack>
        </Box>

        {/* Contact Info (if available) */}
        {(airport.contactName || airport.contactPhoneNumber) && (
          <>
            <Divider color="dark.4" />
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="xs">Contact</Text>
              <Stack gap={4}>
                {airport.contactName && <InfoRow label="Name" value={airport.contactName} />}
                {airport.contactPhoneNumber && <InfoRow label="Phone" value={airport.contactPhoneNumber} />}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </CollapsibleSection>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="sm" c="white" ta="right">{value}</Text>
    </Group>
  );
}
