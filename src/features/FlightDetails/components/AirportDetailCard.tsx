import { useMemo } from 'react';
import {
  Paper,
  Group,
  Badge,
  Box,
  Text,
  SimpleGrid,
  Accordion,
  Center,
  Loader,
  Stack,
  Table,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Overlay,
} from '@mantine/core';
import { FiRefreshCw } from 'react-icons/fi';
import { AirportDto, CommunicationFrequencyDto } from '@/redux/api/vfr3d/dtos';
import { useGetRunwaysByAirportCodeQuery } from '@/redux/api/vfr3d/airports.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetCrosswindForAirportQuery } from '@/redux/api/vfr3d/performance.api';
import { RunwayInformation } from '@/features/Airports/InformationPopup/AirportInfo/RunwayInformation';

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

  const isRefreshing = runwaysFetching || frequenciesFetching || crosswindFetching;
  const isInitialLoading = runwaysLoading || frequenciesLoading || crosswindLoading;

  const handleRefresh = () => {
    refetchRunways();
    refetchFrequencies();
    refetchCrosswind();
  };

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
        position: 'relative',
      }}
    >
      {/* Refreshing overlay */}
      {isRefreshing && !isInitialLoading && (
        <Overlay
          color="rgba(15, 23, 42, 0.7)"
          backgroundOpacity={0.7}
          blur={1}
          center
          zIndex={10}
        >
          <Stack align="center" gap="xs">
            <Loader size="sm" color="blue" />
            <Text size="xs" c="dimmed">Refreshing airport data...</Text>
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
