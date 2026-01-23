import React, { useState } from 'react';
import {
  Badge,
  Box,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { FiChevronDown } from 'react-icons/fi';
import {
  AirportCrosswindResponseDto,
  RunwayCrosswindComponentDto,
  RunwayDto,
  RunwayEndDto,
} from '@/redux/api/vfr3d/dtos';

interface RunwayInformationProps {
  runwayInformation: RunwayDto[] | undefined;
  crosswindData?: AirportCrosswindResponseDto;
  isCrosswindLoading?: boolean;
}

const formatSurfaceType = (surfaceType?: string): string => {
  if (!surfaceType || surfaceType === 'Unknown') return 'Unknown';
  return surfaceType.replace(/([A-Z])/g, ' $1').trim();
};

const getCrosswindColor = (crosswindKt: number): string => {
  if (crosswindKt > 15) return 'red';
  if (crosswindKt > 10) return 'yellow';
  return 'green';
};

const CrosswindDisplay: React.FC<{
  crosswind: RunwayCrosswindComponentDto;
  isRecommended?: boolean;
}> = ({ crosswind, isRecommended }) => {
  const xw = Math.abs(crosswind.crosswindKt ?? 0);
  const hw = Math.abs(crosswind.headwindKt ?? 0);

  return (
    <Paper
      p="xs"
      radius="md"
      style={{
        backgroundColor: isRecommended ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        border: isRecommended ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {isRecommended && (
        <Text size="xs" c="green" fw={600} ta="center" mb={4}>
          Recommended
        </Text>
      )}
      <Group justify="center" gap="lg">
        <Box ta="center">
          <Text size="xs" c="dimmed">
            Crosswind
          </Text>
          <Text size="lg" fw={700} c={getCrosswindColor(xw)}>
            {xw.toFixed(0)} kt
          </Text>
        </Box>
        <Box ta="center">
          <Text size="xs" c="dimmed">
            {crosswind.hasHeadwind ? 'Headwind' : 'Tailwind'}
          </Text>
          <Text size="lg" fw={700} c={crosswind.hasHeadwind ? 'green' : 'yellow'}>
            {hw.toFixed(0)} kt
          </Text>
        </Box>
      </Group>
    </Paper>
  );
};

const RunwayEndDetails: React.FC<{
  runwayEnd: RunwayEndDto;
  crosswind?: RunwayCrosswindComponentDto;
  isRecommended?: boolean;
}> = ({ runwayEnd, crosswind, isRecommended }) => (
  <Paper
    p="sm"
    radius="md"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: isRecommended ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    <Text fw={600} ta="center" mb="xs">
      Runway {runwayEnd.runwayEndId}
      {isRecommended && (
        <Badge color="green" size="xs" ml="xs">
          Best
        </Badge>
      )}
    </Text>

    {crosswind && <CrosswindDisplay crosswind={crosswind} isRecommended={isRecommended} />}

    <Group justify="space-around" mt="sm" wrap="wrap">
      {runwayEnd.trueAlignment !== undefined && (
        <Box ta="center">
          <Text size="xs" c="dimmed">
            Heading
          </Text>
          <Text size="sm" fw={500}>
            {runwayEnd.trueAlignment}°
          </Text>
        </Box>
      )}
      {runwayEnd.elevation !== undefined && (
        <Box ta="center">
          <Text size="xs" c="dimmed">
            Elev
          </Text>
          <Text size="sm" fw={500}>
            {runwayEnd.elevation.toFixed(0)}'
          </Text>
        </Box>
      )}
      <Box ta="center">
        <Text size="xs" c="dimmed">
          Pattern
        </Text>
        <Text size="sm" fw={500}>
          {runwayEnd.rightHandTrafficPattern ? 'Right' : 'Left'}
        </Text>
      </Box>
    </Group>

    {/* Lighting badges */}
    <Group gap={4} justify="center" mt="xs">
      {runwayEnd.hasRunwayEndLights && (
        <Badge size="xs" color="green">
          REIL
        </Badge>
      )}
      {runwayEnd.hasCenterlineLights && (
        <Badge size="xs" color="green">
          CL
        </Badge>
      )}
      {runwayEnd.hasTouchdownZoneLights && (
        <Badge size="xs" color="green">
          TDZ
        </Badge>
      )}
      {runwayEnd.visualGlideSlopeIndicator &&
        runwayEnd.visualGlideSlopeIndicator !== 'Unknown' &&
        runwayEnd.visualGlideSlopeIndicator !== 'None' && (
          <Badge size="xs" color="blue">
            {runwayEnd.visualGlideSlopeIndicator}
          </Badge>
        )}
    </Group>
  </Paper>
);

const RunwayCard: React.FC<{
  runway: RunwayDto;
  crosswindData?: AirportCrosswindResponseDto;
}> = ({ runway, crosswindData }) => {
  const [expanded, setExpanded] = useState(false);

  const getCrosswindForRunwayEnd = (runwayEndId: string): RunwayCrosswindComponentDto | undefined => {
    return crosswindData?.runways?.find((r) => r.runwayEndId === runwayEndId);
  };

  return (
    <Paper
      radius="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      }}
    >
      <UnstyledButton
        onClick={() => setExpanded(!expanded)}
        w="100%"
        p="sm"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Group gap="sm">
          <Text fw={600}>Runway {runway.runwayId}</Text>
          <Badge variant="outline" size="sm">
            {runway.length?.toLocaleString()} × {runway.width} ft
          </Badge>
        </Group>
        <FiChevronDown
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </UnstyledButton>

      {/* Summary info */}
      <Box px="sm" pb="sm">
        <Group gap="lg">
          <Text size="xs">
            <Text span c="dimmed">
              Surface:{' '}
            </Text>
            {formatSurfaceType(runway.surfaceType)}
          </Text>
          {runway.edgeLightIntensity && runway.edgeLightIntensity !== 'None' && (
            <Text size="xs">
              <Text span c="dimmed">
                Edge Lights:{' '}
              </Text>
              {runway.edgeLightIntensity}
            </Text>
          )}
        </Group>

        {/* Crosswind summary badges */}
        {crosswindData?.runways && runway.runwayEnds && (
          <Group gap="xs" mt="xs">
            {runway.runwayEnds.map((end) => {
              const cw = getCrosswindForRunwayEnd(end.runwayEndId ?? '');
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
      </Box>

      <Collapse in={expanded}>
        <Box p="sm" pt={0}>
          {runway.runwayEnds && runway.runwayEnds.length > 0 && (
            <Stack gap="sm">
              {runway.runwayEnds.map((runwayEnd) => (
                <RunwayEndDetails
                  key={runwayEnd.id || runwayEnd.runwayEndId}
                  runwayEnd={runwayEnd}
                  crosswind={getCrosswindForRunwayEnd(runwayEnd.runwayEndId ?? '')}
                  isRecommended={runwayEnd.runwayEndId === crosswindData?.recommendedRunway}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export const RunwayInformation: React.FC<RunwayInformationProps> = ({
  runwayInformation,
  crosswindData,
}) => {
  if (!runwayInformation || runwayInformation.length === 0) {
    return (
      <Text c="dimmed" ta="center">
        No runway information available
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {/* Wind summary */}
      {crosswindData && (crosswindData.windDirectionDegrees || crosswindData.isVariableWind) && (
        <Paper
          p="sm"
          radius="md"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Group justify="space-between" wrap="wrap">
            <Text size="sm" fw={500}>
              Current Wind:{' '}
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
            {crosswindData.recommendedRunway && (
              <Badge color="green">Recommended: Rwy {crosswindData.recommendedRunway}</Badge>
            )}
          </Group>
        </Paper>
      )}

      {runwayInformation.map((runway) => (
        <RunwayCard
          key={runway.id || runway.runwayId}
          runway={runway}
          crosswindData={crosswindData}
        />
      ))}
    </Stack>
  );
};

export default RunwayInformation;
