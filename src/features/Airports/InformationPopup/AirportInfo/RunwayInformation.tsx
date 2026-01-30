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

const getEquivalentRunways = (crosswindData?: AirportCrosswindResponseDto): string[] => {
  if (!crosswindData?.runways || !crosswindData.recommendedRunway) return [];

  const recommended = crosswindData.runways.find(
    (r) => r.runwayEndId === crosswindData.recommendedRunway
  );
  if (!recommended) return [];

  const recommendedXw = Math.abs(recommended.crosswindKt ?? 0);
  const recommendedHw = Math.abs(recommended.headwindKt ?? 0);

  // Find all runways with equivalent crosswind (within 0.5 kt tolerance for floating point)
  return crosswindData.runways
    .filter((r) => {
      const xw = Math.abs(r.crosswindKt ?? 0);
      const hw = Math.abs(r.headwindKt ?? 0);
      return Math.abs(xw - recommendedXw) < 0.5 && Math.abs(hw - recommendedHw) < 0.5;
    })
    .map((r) => r.runwayEndId ?? '')
    .filter(Boolean);
};

const CrosswindDisplay: React.FC<{
  crosswind: RunwayCrosswindComponentDto;
}> = ({ crosswind }) => {
  const xw = Math.abs(crosswind.crosswindKt ?? 0);
  const hw = Math.abs(crosswind.headwindKt ?? 0);

  return (
    <Group gap="md">
      <Badge size="lg" variant="light" color={getCrosswindColor(xw)}>
        XW {xw.toFixed(0)} kt
      </Badge>
      <Badge size="lg" variant="light" color={crosswind.hasHeadwind ? 'green' : 'yellow'}>
        {crosswind.hasHeadwind ? 'HW' : 'TW'} {hw.toFixed(0)} kt
      </Badge>
    </Group>
  );
};

const RunwayEndDetails: React.FC<{
  runwayEnd: RunwayEndDto;
  crosswind?: RunwayCrosswindComponentDto;
  isRecommended?: boolean;
  isFirst?: boolean;
}> = ({ runwayEnd, crosswind, isRecommended, isFirst }) => (
  <Box
    pt={isFirst ? 0 : 'sm'}
    mt={isFirst ? 0 : 'sm'}
    style={
      isFirst
        ? undefined
        : {
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }
    }
  >
    <Group justify="space-between" align="center" mb="xs">
      <Group gap="xs">
        <Text fw={600}>Rwy {runwayEnd.runwayEndId}</Text>
        {isRecommended && (
          <Badge color="green" size="xs">
            Best
          </Badge>
        )}
      </Group>
      {crosswind && <CrosswindDisplay crosswind={crosswind} />}
    </Group>

    <Group gap="lg" wrap="wrap">
      {runwayEnd.trueAlignment !== undefined && (
        <Text size="xs">
          <Text span c="dimmed">
            Hdg:{' '}
          </Text>
          {runwayEnd.trueAlignment}°
        </Text>
      )}
      {runwayEnd.elevation !== undefined && runwayEnd.elevation !== null && (
        <Text size="xs">
          <Text span c="dimmed">
            Elev:{' '}
          </Text>
          {runwayEnd.elevation.toFixed(0)}'
        </Text>
      )}
      <Text size="xs">
        <Text span c="dimmed">
          Pattern:{' '}
        </Text>
        {runwayEnd.rightHandTrafficPattern ? 'Right' : 'Left'}
      </Text>
      {/* Lighting info inline */}
      {(runwayEnd.hasRunwayEndLights ||
        runwayEnd.hasCenterlineLights ||
        runwayEnd.hasTouchdownZoneLights ||
        (runwayEnd.visualGlideSlopeIndicator &&
          runwayEnd.visualGlideSlopeIndicator !== 'Unknown' &&
          runwayEnd.visualGlideSlopeIndicator !== 'None')) && (
        <Group gap={4}>
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
      )}
    </Group>
  </Box>
);

const RunwayCard: React.FC<{
  runway: RunwayDto;
  crosswindData?: AirportCrosswindResponseDto;
  showBest: boolean;
}> = ({ runway, crosswindData, showBest }) => {
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
              const isRecommended = showBest && end.runwayEndId === crosswindData.recommendedRunway;
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
        <Box px="sm" pb="sm">
          {runway.runwayEnds &&
            runway.runwayEnds.length > 0 &&
            runway.runwayEnds.map((runwayEnd, index) => (
              <RunwayEndDetails
                key={runwayEnd.id || runwayEnd.runwayEndId}
                runwayEnd={runwayEnd}
                crosswind={getCrosswindForRunwayEnd(runwayEnd.runwayEndId ?? '')}
                isRecommended={showBest && runwayEnd.runwayEndId === crosswindData?.recommendedRunway}
                isFirst={index === 0}
              />
            ))}
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

  const equivalentRunways = getEquivalentRunways(crosswindData);
  const showBest = equivalentRunways.length === 1;

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
            {showBest && crosswindData.recommendedRunway && (
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
          showBest={showBest}
        />
      ))}
    </Stack>
  );
};

export default RunwayInformation;
