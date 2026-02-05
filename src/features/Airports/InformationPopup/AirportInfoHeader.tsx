import { Box, Group, Stack, Text, Title, Badge, ActionIcon, Loader } from '@mantine/core';
import { FiX } from 'react-icons/fi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { AirportDto, DensityAltitudeResponseDto, MetarDto } from '@/redux/api/vfr3d/dtos';
import { BORDER } from '@/constants/surfaces';
import { WeatherFlightCategories } from '@/utility/enums';

/**
 * Calculate pattern altitude (TPA) based on field elevation
 * Standard: 1000 ft AGL, rounded to nearest 100 ft MSL
 */
const calculatePatternAltitude = (elevation: number | undefined | null): number | null => {
  if (elevation === undefined || elevation === null) return null;
  const patternAgl = 1000;
  const patternMsl = elevation + patternAgl;
  return Math.round(patternMsl / 100) * 100;
};

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

interface AirportHeaderProps {
  airport: AirportDto;
  metar?: MetarDto;
  metarError: FetchBaseQueryError | SerializedError | undefined;
  handleClose: () => void;
  densityAltitude?: DensityAltitudeResponseDto;
  isDensityAltitudeLoading?: boolean;
}

const AirportInfoHeader: React.FC<AirportHeaderProps> = ({
  airport,
  metar,
  metarError,
  handleClose,
  densityAltitude,
  isDensityAltitudeLoading,
}) => {
  const hasValidMetar = metar && !metarError;

  // Determine if density altitude is concerning - use bright colors for visibility on dark background
  const getDensityAltitudeColor = () => {
    if (!densityAltitude?.densityAltitudeFt || !airport.elev) return 'blue.1'; // Light blue for normal
    const difference = densityAltitude.densityAltitudeFt - airport.elev;
    if (difference > 2000) return 'red.4'; // Bright red for warning
    if (difference > 1000) return 'yellow.4'; // Bright yellow for caution
    return 'blue.1'; // Light blue for normal
  };

  return (
    <Box
      p="md"
      style={{
        background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
        borderBottom: `1px solid ${BORDER.LIGHT}`,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs">
            <Text size="xs" c="blue.2" tt="uppercase" fw={500}>
              Airport
            </Text>
            {hasValidMetar && metar?.flightCategory && (
              <Badge size="xs" color={getFlightCategoryColor(metar.flightCategory)}>
                {metar.flightCategory}
              </Badge>
            )}
          </Group>

          <Group gap="md" align="baseline">
            <Title order={2} c="white">
              {airport.icaoId || airport.arptId || ''}
            </Title>
            <Text c="blue.1" size="sm" lineClamp={1}>
              {airport.arptName}
            </Text>
          </Group>

          {/* Elevation, TPA, DA */}
          <Group gap="sm" wrap="wrap">
            {airport.elev !== undefined && airport.elev !== null && (
              <>
                <Text size="sm" c="blue.1">
                  <Text span c="blue.2">Elev:</Text>{' '}
                  <Text span fw={500}>{airport.elev.toLocaleString()} ft</Text>
                </Text>
                <Text size="sm" c="blue.2">•</Text>
                <Text size="sm" c="blue.1">
                  <Text span c="blue.2">TPA:</Text>{' '}
                  <Text span fw={500}>{calculatePatternAltitude(airport.elev)?.toLocaleString()} ft</Text>
                </Text>
              </>
            )}
            {isDensityAltitudeLoading ? (
              <Group gap={4}>
                <Loader size="xs" color="white" />
                <Text size="sm" c="blue.1">Loading DA...</Text>
              </Group>
            ) : densityAltitude?.densityAltitudeFt && (
              <>
                <Text size="sm" c="blue.2">•</Text>
                <Text size="sm" c={getDensityAltitudeColor()}>
                  <Text span c="blue.2">DA:</Text>{' '}
                  <Text span fw={500}>{densityAltitude.densityAltitudeFt.toLocaleString()} ft</Text>
                </Text>
              </>
            )}
          </Group>

          {/* METAR snippet */}
          {hasValidMetar && metar?.rawText && (
            <Box pt="xs">
              <Text size="xs" c="blue.1" ff="monospace" lineClamp={1}>
                {metar.rawText.split(' ').slice(0, 6).join(' ')}...
              </Text>
              {metar.observationTime && (
                <Text size="xs" c="blue.3" mt={2}>
                  Obs: {new Date(metar.observationTime).toLocaleString()}
                </Text>
              )}
            </Box>
          )}
        </Stack>

        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={handleClose}
          style={{ color: 'white', flexShrink: 0 }}
        >
          <FiX size={20} />
        </ActionIcon>
      </Group>
    </Box>
  );
};

export default AirportInfoHeader;
