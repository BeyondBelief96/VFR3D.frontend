import {
  Paper,
  Group,
  Badge,
  Box,
  Text,
  SimpleGrid,
  Tabs,
  Center,
  Loader,
  Stack,
  ActionIcon,
  Tooltip,
  Overlay,
} from '@mantine/core';
import { FiRefreshCw } from 'react-icons/fi';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import { SURFACE, BORDER, OVERLAY, TAB_STYLES } from '@/constants/surfaces';
import { useGetRunwaysByAirportCodeQuery } from '@/redux/api/vfr3d/airports.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetCrosswindForAirportQuery } from '@/redux/api/vfr3d/performance.api';
import { useGetAirportDiagramUrlByAirportCodeQuery } from '@/redux/api/vfr3d/airportDiagram.api';
import { useGetChartSupplementUrlByAirportCodeQuery } from '@/redux/api/vfr3d/chartSupplements.api';
import { RunwayInformation } from '@/features/Airports/InformationPopup/AirportInfo/RunwayInformation';
import { AirportCrosswindResponseDto } from '@/redux/api/vfr3d/dtos';
import { FrequencyTable } from '@/components/Frequencies';
import { AirportDocumentsContent } from '@/features/Airports/components';

const hasUniqueBestRunway = (crosswindData?: AirportCrosswindResponseDto): boolean => {
  if (!crosswindData?.runways || !crosswindData.recommendedRunway) return false;

  const recommended = crosswindData.runways.find(
    (r) => r.runwayEndId === crosswindData.recommendedRunway
  );
  if (!recommended) return false;

  const recommendedXw = Math.abs(recommended.crosswindKt ?? 0);
  const recommendedHw = Math.abs(recommended.headwindKt ?? 0);

  // Count runways with equivalent crosswind (within 0.5 kt tolerance)
  const equivalentCount = crosswindData.runways.filter((r) => {
    const xw = Math.abs(r.crosswindKt ?? 0);
    const hw = Math.abs(r.headwindKt ?? 0);
    return Math.abs(xw - recommendedXw) < 0.5 && Math.abs(hw - recommendedHw) < 0.5;
  }).length;

  return equivalentCount === 1;
};

interface AirportDetailCardProps {
  airport: AirportDto;
}

export function AirportDetailCard({ airport }: AirportDetailCardProps) {
  const ident = airport.icaoId || airport.arptId || '';

  const {
    data: runways,
    isLoading: runwaysLoading,
    isFetching: runwaysFetching,
    refetch: refetchRunways,
  } = useGetRunwaysByAirportCodeQuery(ident, {
    skip: !ident,
  });

  const {
    data: frequencies,
    isLoading: frequenciesLoading,
    isFetching: frequenciesFetching,
    refetch: refetchFrequencies,
  } = useGetFrequenciesByServicedFacilityQuery(ident, {
    skip: !ident,
  });

  const {
    data: crosswindData,
    isLoading: crosswindLoading,
    isFetching: crosswindFetching,
    refetch: refetchCrosswind,
  } = useGetCrosswindForAirportQuery(ident, {
    skip: !ident,
  });

  const { data: chartSupplementUrl } = useGetChartSupplementUrlByAirportCodeQuery(ident, {
    skip: !ident,
  });

  const { data: airportDiagrams } = useGetAirportDiagramUrlByAirportCodeQuery(ident, {
    skip: !ident,
  });

  const isRefreshing = runwaysFetching || frequenciesFetching || crosswindFetching;
  const isInitialLoading = runwaysLoading || frequenciesLoading || crosswindLoading;

  const handleRefresh = () => {
    refetchRunways();
    refetchFrequencies();
    refetchCrosswind();
  };

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: SURFACE.CARD_HOVER,
        border: `1px solid ${BORDER.SUBTLE}`,
        position: 'relative',
      }}
    >
      {/* Refreshing overlay */}
      {isRefreshing && !isInitialLoading && (
        <Overlay color={OVERLAY.DEFAULT} backgroundOpacity={0.7} blur={1} center zIndex={10}>
          <Stack align="center" gap="xs">
            <Loader size="sm" color="blue" />
            <Text size="xs" c="dimmed">
              Refreshing airport data...
            </Text>
          </Stack>
        </Overlay>
      )}

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
        <Group gap="xs">
          <Badge variant="light" color="cyan">
            {airport.elev?.toLocaleString() || '--'} ft MSL
          </Badge>
          <Tooltip label="Refresh airport data">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <FiRefreshCw size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
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

      <Tabs
        defaultValue="runways"
        color="blue"
        styles={TAB_STYLES}
      >
        <Tabs.List mb="sm">
          <Tabs.Tab value="runways">
            Runways
            {runways && (
              <Badge size="xs" variant="light" color="blue" ml="xs">
                {runways.length}
              </Badge>
            )}
            {hasUniqueBestRunway(crosswindData) && (
              <Badge size="xs" variant="filled" color="green" ml="xs">
                Best: {crosswindData?.recommendedRunway}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="frequencies">
            Frequencies
            {frequencies && (
              <Badge size="xs" variant="light" color="blue" ml="xs">
                {frequencies.length}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="runways">
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
        </Tabs.Panel>

        <Tabs.Panel value="frequencies">
          {frequenciesLoading ? (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          ) : (
            <FrequencyTable
              frequencies={frequencies}
              variant="compact"
              showGroupHeader={true}
              showGroupPaper={false}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="documents">
          <AirportDocumentsContent
            chartSupplementUrl={chartSupplementUrl}
            airportDiagrams={airportDiagrams}
            compact
          />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
