import { Stack, Text, SimpleGrid, Paper, Group, Badge, Center } from '@mantine/core';
import { FiExternalLink, FiFileText } from 'react-icons/fi';
import { AirportDiagramsResponseDto } from '@/redux/api/vfr3d/dtos';

interface AirportDocumentsContentProps {
  chartSupplementUrl?: { pdfUrl: string };
  airportDiagrams?: AirportDiagramsResponseDto;
  compact?: boolean;
}

export function AirportDocumentsContent({
  chartSupplementUrl,
  airportDiagrams,
  compact = false,
}: AirportDocumentsContentProps) {
  const hasChartSupplement = !!chartSupplementUrl?.pdfUrl;
  const availableDiagrams = airportDiagrams?.diagrams?.filter((d) => d.pdfUrl) || [];
  const hasDocuments = hasChartSupplement || availableDiagrams.length > 0;

  if (!hasDocuments) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <FiFileText size={32} color="var(--mantine-color-dimmed)" />
          <Text c="dimmed" size="sm">
            No documents available for this airport
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {/* Chart Supplement */}
      {hasChartSupplement && (
        <DocumentCard
          title="Chart Supplement"
          description="Official FAA publication with detailed airport information, procedures, and special notices"
          url={chartSupplementUrl!.pdfUrl}
          compact={compact}
        />
      )}

      {/* Airport Diagrams */}
      {availableDiagrams.length > 0 && (
        <>
          {availableDiagrams.length === 1 ? (
            <DocumentCard
              title="Airport Diagram"
              description="Visual layout of runways, taxiways, and airport facilities"
              url={availableDiagrams[0].pdfUrl!}
              compact={compact}
            />
          ) : (
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" fw={500} c="white">
                  Airport Diagrams
                </Text>
                <Badge size="xs" variant="light" color="blue">
                  {availableDiagrams.length} available
                </Badge>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: compact ? 1 : 2 }} spacing="sm">
                {availableDiagrams.map((diagram, index) => (
                  <DocumentCard
                    key={diagram.pdfUrl || index}
                    title={diagram.chartName || `Diagram ${index + 1}`}
                    url={diagram.pdfUrl!}
                    compact={compact}
                    small
                  />
                ))}
              </SimpleGrid>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}

interface DocumentCardProps {
  title: string;
  description?: string;
  url: string;
  compact?: boolean;
  small?: boolean;
}

function DocumentCard({ title, description, url, compact = false, small = false }: DocumentCardProps) {
  return (
    <Paper
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      p={compact || small ? 'sm' : 'md'}
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
      }}
      styles={{
        root: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            borderColor: 'rgba(37, 99, 235, 0.4)',
          },
        },
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Group gap="xs">
            <FiFileText size={small ? 14 : 16} color="var(--mantine-color-blue-4)" />
            <Text size={small ? 'sm' : 'md'} fw={500} c="white">
              {title}
            </Text>
          </Group>
          {description && !compact && !small && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {description}
            </Text>
          )}
        </Stack>
        <FiExternalLink size={16} color="var(--mantine-color-blue-4)" style={{ flexShrink: 0 }} />
      </Group>
    </Paper>
  );
}
