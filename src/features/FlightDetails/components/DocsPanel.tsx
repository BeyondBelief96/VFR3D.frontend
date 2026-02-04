import { Stack, Text, Paper, Group, Badge, Center, Loader } from '@mantine/core';
import { FiFileText } from 'react-icons/fi';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import { useGetAirportDiagramUrlByAirportCodeQuery } from '@/redux/api/vfr3d/airportDiagram.api';
import { useGetChartSupplementUrlByAirportCodeQuery } from '@/redux/api/vfr3d/chartSupplements.api';
import { AirportDocumentsContent } from '@/features/Airports/components';

interface DocsPanelProps {
  airports: AirportDto[] | undefined;
}

export function DocsPanel({ airports }: DocsPanelProps) {
  if (!airports || airports.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <FiFileText size={32} color="var(--mantine-color-dimmed)" />
          <Text c="dimmed" size="sm">
            No airports in route to show documents for
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      {airports.map((airport) => {
        const ident = airport.icaoId || airport.arptId || '';
        return <AirportDocsCard key={airport.siteNo} airport={airport} ident={ident} />;
      })}
    </Stack>
  );
}

interface AirportDocsCardProps {
  airport: AirportDto;
  ident: string;
}

function AirportDocsCard({ airport, ident }: AirportDocsCardProps) {
  const { data: chartSupplementUrl, isLoading: chartLoading } =
    useGetChartSupplementUrlByAirportCodeQuery(ident, {
      skip: !ident,
    });

  const { data: airportDiagrams, isLoading: diagramsLoading } =
    useGetAirportDiagramUrlByAirportCodeQuery(ident, {
      skip: !ident,
    });

  const isLoading = chartLoading || diagramsLoading;

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
      }}
    >
      {/* Airport Header */}
      <Group gap="sm" mb="md">
        <Badge variant="filled" color="blue" size="lg">
          {ident}
        </Badge>
        <Text c="white" fw={600} size="lg">
          {airport.arptName}
        </Text>
        <Text c="dimmed" size="sm">
          {airport.city}, {airport.stateCode}
        </Text>
      </Group>

      {/* Documents */}
      {isLoading ? (
        <Center py="md">
          <Loader size="sm" color="blue" />
        </Center>
      ) : (
        <AirportDocumentsContent
          chartSupplementUrl={chartSupplementUrl}
          airportDiagrams={airportDiagrams}
        />
      )}
    </Paper>
  );
}
