import {
  Stack,
  Paper,
  Group,
  ThemeIcon,
  Text,
  Badge,
  Tooltip,
  ActionIcon,
  Loader,
  Alert,
  Code,
  SimpleGrid,
  Box,
} from '@mantine/core';
import { FiCloud, FiRefreshCw, FiAlertCircle, FiWind, FiEye, FiThermometer } from 'react-icons/fi';
import { TbRuler } from 'react-icons/tb';
import { FaRoute } from 'react-icons/fa';
import { MetarDto, TafDto } from '@/redux/api/vfr3d/dtos';
import { getWeatherErrorMessage } from '@/features/Weather';
import { WeatherFlightCategories } from '@/utility/enums';
import { SURFACE_INNER } from '@/constants/surfaces';

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

interface WeatherItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function WeatherItem({ icon, label, value }: WeatherItemProps) {
  return (
    <Group gap="sm" wrap="nowrap">
      <Box c="blue.4">{icon}</Box>
      <Box>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="sm" c="white" fw={500}>
          {value}
        </Text>
      </Box>
    </Group>
  );
}

interface WeatherContentProps {
  metar?: MetarDto;
  taf?: TafDto;
  isLoadingMetar: boolean;
  isLoadingTaf: boolean;
  metarError: unknown;
  tafError: unknown;
  onRefreshMetar: () => void;
  onRefreshTaf: () => void;
  isMetarRefreshing: boolean;
  isTafRefreshing: boolean;
}

export function WeatherContent({
  metar,
  taf,
  isLoadingMetar,
  isLoadingTaf,
  metarError,
  tafError,
  onRefreshMetar,
  onRefreshTaf,
  isMetarRefreshing,
  isTafRefreshing,
}: WeatherContentProps) {
  const hasValidMetar = metar && !metarError;
  const isVariableWind = metar?.windDirDegrees === 'VRB' || metar?.windDirDegrees === 'Variable';

  return (
    <Stack gap="lg">
      {/* METAR Section */}
      <Paper p="md" style={{ backgroundColor: SURFACE_INNER.DEFAULT }}>
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size="md" variant="light" color="blue">
              <FiCloud size={16} />
            </ThemeIcon>
            <Text fw={600} c="white">
              Current Conditions (METAR)
            </Text>
          </Group>
          <Group gap="sm">
            {hasValidMetar && metar.flightCategory && (
              <Badge color={getFlightCategoryColor(metar.flightCategory)} size="lg">
                {metar.flightCategory}
              </Badge>
            )}
            <Tooltip label="Refresh METAR">
              <ActionIcon variant="light" color="orange" onClick={onRefreshMetar} loading={isMetarRefreshing}>
                <FiRefreshCw size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {isLoadingMetar ? (
          <Group gap="sm">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">
              Loading METAR...
            </Text>
          </Group>
        ) : metarError ? (
          <Alert icon={<FiAlertCircle size={16} />} color="red" variant="light" title="METAR unavailable">
            {getWeatherErrorMessage(metarError as { status?: number; message?: string })}
          </Alert>
        ) : hasValidMetar ? (
          <Stack gap="md">
            {/* Raw METAR */}
            <Code block style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              {metar.rawText}
            </Code>

            {/* Decoded Weather */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              {(metar.windDirDegrees || metar.windSpeedKt) && (
                <WeatherItem
                  icon={<FiWind size={16} />}
                  label="Wind"
                  value={
                    <>
                      {isVariableWind ? 'VRB' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt}kt
                      {metar.windGustKt && (
                        <Text span c="yellow" fw={600}>
                          {' '}
                          G{metar.windGustKt}
                        </Text>
                      )}
                    </>
                  }
                />
              )}
              {metar.visibilityStatuteMi && (
                <WeatherItem icon={<FiEye size={16} />} label="Visibility" value={`${metar.visibilityStatuteMi} SM`} />
              )}
              {(metar.tempC !== undefined || metar.dewpointC !== undefined) && (
                <WeatherItem
                  icon={<FiThermometer size={16} />}
                  label="Temp/Dew"
                  value={`${metar.tempC}°C / ${metar.dewpointC}°C`}
                />
              )}
              {metar.altimInHg && (
                <WeatherItem icon={<TbRuler size={16} />} label="Altimeter" value={`${metar.altimInHg.toFixed(2)}"`} />
              )}
            </SimpleGrid>

            {/* Sky Conditions */}
            {metar.skyCondition && metar.skyCondition.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Sky Conditions
                </Text>
                <Group gap="xs">
                  {metar.skyCondition.map((sky, idx) => (
                    <Badge key={idx} variant="light" color="blue">
                      {sky.skyCover}
                      {sky.cloudBaseFtAgl ? ` @ ${sky.cloudBaseFtAgl.toLocaleString()}'` : ''}
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
          <Text c="dimmed" size="sm">
            No METAR available
          </Text>
        )}
      </Paper>

      {/* TAF Section */}
      <Paper p="md" style={{ backgroundColor: SURFACE_INNER.DEFAULT }}>
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size="md" variant="light" color="cyan">
              <FaRoute size={14} />
            </ThemeIcon>
            <Text fw={600} c="white">
              Forecast (TAF)
            </Text>
          </Group>
          <Tooltip label="Refresh TAF">
            <ActionIcon variant="light" color="orange" onClick={onRefreshTaf} loading={isTafRefreshing}>
              <FiRefreshCw size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {isLoadingTaf ? (
          <Group gap="sm">
            <Loader size="xs" />
            <Text size="sm" c="dimmed">
              Loading TAF...
            </Text>
          </Group>
        ) : tafError ? (
          <Alert icon={<FiAlertCircle size={16} />} color="orange" variant="light" title="TAF unavailable">
            {getWeatherErrorMessage(tafError as { status?: number; message?: string })}
          </Alert>
        ) : taf ? (
          <Stack gap="md">
            <Code block style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {taf.rawText}
            </Code>
            {taf.issueTime && (
              <Text size="xs" c="dimmed">
                Issued: {new Date(taf.issueTime).toLocaleString()}
              </Text>
            )}
          </Stack>
        ) : (
          <Text c="dimmed" size="sm">
            No TAF available
          </Text>
        )}
      </Paper>
    </Stack>
  );
}
