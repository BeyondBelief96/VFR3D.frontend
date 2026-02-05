import React from 'react';
import { Alert, Box, Group, Loader, Paper, Stack, Text, Title, Badge, Accordion, Code } from '@mantine/core';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { MetarDto, TafDto } from '@/redux/api/vfr3d/dtos';
import { FiAlertCircle, FiCloud, FiWind, FiEye, FiThermometer } from 'react-icons/fi';
import { WeatherFlightCategories } from '@/utility/enums';
import { getWeatherErrorMessage } from '@/features/Weather';
import { WHITE_BG, BORDER } from '@/constants/surfaces';

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

const MetarSection: React.FC<{ metar: MetarDto }> = ({ metar }) => {
  const isVariableWind = metar.windDirDegrees === 'VRB' || metar.windDirDegrees === 'Variable';

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        backgroundColor: WHITE_BG.FAINT,
        border: `1px solid ${BORDER.LIGHT}`,
      }}
    >
      <Group justify="space-between" mb="sm">
        <Title order={5}>METAR</Title>
        {metar.flightCategory && (
          <Badge color={getFlightCategoryColor(metar.flightCategory)} size="lg">
            {metar.flightCategory}
          </Badge>
        )}
      </Group>

      {/* Raw Text */}
      <Code block mb="md" style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
        {metar.rawText}
      </Code>

      {/* Decoded Data */}
      <Stack gap="xs">
        {/* Wind */}
        {(metar.windDirDegrees || metar.windSpeedKt) && (
          <Group gap="xs">
            <FiWind size={16} />
            <Text size="sm">
              <Text span c="dimmed">Wind: </Text>
              {isVariableWind ? 'Variable' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt}kt
              {metar.windGustKt && (
                <Text span c="yellow" fw={600}>
                  {' '}G{metar.windGustKt}kt
                </Text>
              )}
            </Text>
          </Group>
        )}

        {/* Visibility */}
        {metar.visibilityStatuteMi && (
          <Group gap="xs">
            <FiEye size={16} />
            <Text size="sm">
              <Text span c="dimmed">Visibility: </Text>
              {metar.visibilityStatuteMi} SM
            </Text>
          </Group>
        )}

        {/* Temperature */}
        {(metar.tempC !== undefined || metar.dewpointC !== undefined) && (
          <Group gap="xs">
            <FiThermometer size={16} />
            <Text size="sm">
              <Text span c="dimmed">Temp/Dew: </Text>
              {metar.tempC}°C / {metar.dewpointC}°C
            </Text>
          </Group>
        )}

        {/* Altimeter */}
        {metar.altimInHg && (
          <Text size="sm">
            <Text span c="dimmed">Altimeter: </Text>
            {metar.altimInHg.toFixed(2)}" Hg
          </Text>
        )}

        {/* Sky Conditions */}
        {metar.skyCondition && metar.skyCondition.length > 0 && (
          <Box>
            <Group gap="xs" mb={4}>
              <FiCloud size={16} />
              <Text size="sm" c="dimmed">Sky:</Text>
            </Group>
            <Stack gap={2} pl="md">
              {metar.skyCondition.map((sky, idx) => (
                <Text key={idx} size="sm">
                  {sky.skyCover}
                  {sky.cloudBaseFtAgl && ` @ ${sky.cloudBaseFtAgl.toLocaleString()} ft AGL`}
                </Text>
              ))}
            </Stack>
          </Box>
        )}

        {/* Weather */}
        {metar.wxString && (
          <Text size="sm">
            <Text span c="dimmed">Weather: </Text>
            {metar.wxString}
          </Text>
        )}

        {/* Observation Time */}
        {metar.observationTime && (
          <Text size="xs" c="dimmed" mt="xs">
            Observed: {new Date(metar.observationTime).toLocaleString()}
          </Text>
        )}
      </Stack>
    </Paper>
  );
};

const TafSection: React.FC<{ taf: TafDto }> = ({ taf }) => {
  return (
    <Paper
      p="md"
      radius="md"
      style={{
        backgroundColor: WHITE_BG.FAINT,
        border: `1px solid ${BORDER.LIGHT}`,
      }}
    >
      <Title order={5} mb="sm">TAF (Forecast)</Title>

      {/* Raw Text */}
      <Code block mb="md" style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
        {taf.rawText}
      </Code>

      {/* Validity Period */}
      {(taf.validTimeFrom || taf.validTimeTo) && (
        <Text size="xs" c="dimmed" mb="sm">
          Valid: {taf.validTimeFrom && new Date(taf.validTimeFrom).toLocaleString()} -{' '}
          {taf.validTimeTo && new Date(taf.validTimeTo).toLocaleString()}
        </Text>
      )}

      {/* Forecast Periods */}
      {taf.forecast && taf.forecast.length > 0 && (
        <Accordion variant="separated" radius="md">
          {taf.forecast.map((fcst, idx) => (
            <Accordion.Item key={idx} value={`forecast-${idx}`}>
              <Accordion.Control>
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {fcst.changeIndicator || 'Initial'}
                  </Text>
                  {fcst.fcstTimeFrom && (
                    <Text size="xs" c="dimmed">
                      {new Date(fcst.fcstTimeFrom).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {fcst.fcstTimeTo &&
                        ` - ${new Date(fcst.fcstTimeTo).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                    </Text>
                  )}
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {(fcst.windDirDegrees || fcst.windSpeedKt) && (
                    <Text size="sm">
                      <Text span c="dimmed">Wind: </Text>
                      {fcst.windDirDegrees}° @ {fcst.windSpeedKt}kt
                      {fcst.windGustKt && (
                        <Text span c="yellow"> G{fcst.windGustKt}kt</Text>
                      )}
                    </Text>
                  )}
                  {fcst.visibilityStatuteMi && (
                    <Text size="sm">
                      <Text span c="dimmed">Visibility: </Text>
                      {fcst.visibilityStatuteMi} SM
                    </Text>
                  )}
                  {fcst.skyConditions && fcst.skyConditions.length > 0 && (
                    <Box>
                      <Text size="sm" c="dimmed">Sky:</Text>
                      {fcst.skyConditions.map((sky, skyIdx) => (
                        <Text key={skyIdx} size="sm" pl="sm">
                          {sky.skyCover}
                          {sky.cloudBaseFtAgl && ` @ ${sky.cloudBaseFtAgl.toLocaleString()} ft`}
                        </Text>
                      ))}
                    </Box>
                  )}
                  {fcst.wxString && (
                    <Text size="sm">
                      <Text span c="dimmed">Weather: </Text>
                      {fcst.wxString}
                    </Text>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Issue Time */}
      {taf.issueTime && (
        <Text size="xs" c="dimmed" mt="sm">
          Issued: {new Date(taf.issueTime).toLocaleString()}
        </Text>
      )}
    </Paper>
  );
};

interface AirportWeatherProps {
  metar?: MetarDto;
  taf?: TafDto;
  isLoadingMetar: boolean;
  isLoadingTaf: boolean;
  metarError?: FetchBaseQueryError | SerializedError;
  tafError?: FetchBaseQueryError | SerializedError;
}

const AirportWeather: React.FC<AirportWeatherProps> = ({
  metar,
  taf,
  isLoadingMetar,
  isLoadingTaf,
  metarError,
  tafError,
}) => {
  return (
    <Stack gap="md">
      {/* METAR Section */}
      <Box>
        {isLoadingMetar && (
          <Group gap="sm">
            <Loader size="sm" />
            <Text size="sm">Loading METAR...</Text>
          </Group>
        )}
        {metarError && (
          <Alert
            icon={<FiAlertCircle size={16} />}
            title="METAR unavailable"
            color="red"
            variant="light"
          >
            {getWeatherErrorMessage(metarError)}
          </Alert>
        )}
        {metar && !metarError && <MetarSection metar={metar} />}
      </Box>

      {/* TAF Section */}
      <Box>
        {isLoadingTaf && (
          <Group gap="sm">
            <Loader size="sm" />
            <Text size="sm">Loading TAF...</Text>
          </Group>
        )}
        {tafError && (
          <Alert
            icon={<FiAlertCircle size={16} />}
            title="TAF unavailable"
            color="orange"
            variant="light"
          >
            {getWeatherErrorMessage(tafError)}
          </Alert>
        )}
        {taf && !tafError && <TafSection taf={taf} />}
      </Box>
    </Stack>
  );
};

export default AirportWeather;
