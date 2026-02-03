import { Stack, Paper, Group, Text, Badge, Center, Loader, SimpleGrid, Box, Tooltip } from '@mantine/core';
import { FiWind } from 'react-icons/fi';
import { RunwayDto, AirportCrosswindResponseDto } from '@/redux/api/vfr3d/dtos';

const getCrosswindColor = (crosswindKt: number): string => {
  if (crosswindKt > 15) return 'red';
  if (crosswindKt > 10) return 'yellow';
  return 'green';
};

interface RunwayCardProps {
  runway: RunwayDto;
  crosswindData?: AirportCrosswindResponseDto;
}

function RunwayCard({ runway, crosswindData }: RunwayCardProps) {
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
              const cw = crosswindData.runways?.find((r) => r.runwayEndId === end.runwayEndId);
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

interface RunwaysContentProps {
  runways?: RunwayDto[];
  isLoading: boolean;
  crosswindData?: AirportCrosswindResponseDto;
}

export function RunwaysContent({ runways, isLoading, crosswindData }: RunwaysContentProps) {
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
