import { useState, useMemo } from 'react';
import {
  Paper,
  Group,
  Badge,
  ActionIcon,
  Collapse,
  Stack,
  Box,
  Text,
  Loader,
  SimpleGrid,
  Accordion,
  Tooltip,
  Overlay,
} from '@mantine/core';
import { FiChevronDown, FiChevronUp, FiWind, FiRefreshCw } from 'react-icons/fi';
import {
  useGetMetarForAirportQuery,
  useGetTafForAirportQuery,
} from '@/redux/api/vfr3d/weather.api';
import { getFlightCategoryColor } from '@/constants/colors';
import { SURFACE, SURFACE_INNER, BORDER, SHADOW } from '@/constants/surfaces';

interface WeatherCardProps {
  icaoId: string;
}

export function WeatherCard({ icaoId }: WeatherCardProps) {
  const [expanded, setExpanded] = useState(true);

  const {
    data: metar,
    isLoading: metarLoading,
    isFetching: metarFetching,
    refetch: refetchMetar,
  } = useGetMetarForAirportQuery(icaoId, {
    skip: !icaoId,
  });

  const {
    data: taf,
    isLoading: tafLoading,
    isFetching: tafFetching,
    refetch: refetchTaf,
  } = useGetTafForAirportQuery(icaoId, {
    skip: !icaoId,
  });

  const isVariableWind = metar?.windDirDegrees === 'VRB' || metar?.windDirDegrees === 'Variable';
  const isRefreshing = metarFetching || tafFetching;
  const isInitialLoading = metarLoading || tafLoading;

  const handleRefresh = () => {
    refetchMetar();
    refetchTaf();
  };

  // Format last observation time
  const lastUpdated = useMemo(() => {
    if (!metar?.observationTime) return null;
    const date = new Date(metar.observationTime);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [metar?.observationTime]);

  return (
    <Paper
      p="md"
      style={{
        backgroundColor: SURFACE.CARD,
        border: `1px solid ${BORDER.SUBTLE}`,
        position: 'relative',
      }}
    >
      {/* Refreshing overlay */}
      {isRefreshing && !isInitialLoading && (
        <Overlay
          color={SURFACE.GLASS}
          backgroundOpacity={0.7}
          blur={1}
          center
          zIndex={10}
        >
          <Stack align="center" gap="xs">
            <Loader size="sm" color="blue" />
            <Text size="xs" c="dimmed">Refreshing weather...</Text>
          </Stack>
        </Overlay>
      )}

      <Group justify="space-between" mb="sm">
        <Group gap="sm">
          <Badge variant="filled" color="blue" size="lg">
            {icaoId}
          </Badge>
          {metar?.flightCategory && (
            <Badge variant="filled" color={getFlightCategoryColor(metar.flightCategory)} size="lg">
              {metar.flightCategory}
            </Badge>
          )}
          {lastUpdated && (
            <Text size="xs" c="dimmed">
              Obs: {lastUpdated}
            </Text>
          )}
        </Group>
        <Group gap="xs">
          <Tooltip label="Refresh weather data">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <FiRefreshCw size={16} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon variant="subtle" onClick={() => setExpanded(!expanded)}>
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </ActionIcon>
        </Group>
      </Group>

      <Collapse in={expanded}>
        <Stack gap="md">
          {/* METAR Section */}
          <Box>
            <Text size="sm" c="dimmed" mb="xs" fw={500}>
              Current Conditions (METAR)
            </Text>
            {metarLoading ? (
              <Stack align="center" py="md">
                <Loader size="sm" />
                <Text size="xs" c="dimmed">Loading METAR...</Text>
              </Stack>
            ) : metar ? (
              <Stack gap="sm">
                {/* Raw METAR */}
                <Text
                  size="xs"
                  c="gray.4"
                  style={{
                    fontFamily: 'monospace',
                    backgroundColor: SHADOW.LIGHT,
                    padding: '8px',
                    borderRadius: '4px',
                    wordBreak: 'break-word',
                  }}
                >
                  {metar.rawText || 'No raw data'}
                </Text>

                {/* Decoded METAR Grid */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                  {/* Wind */}
                  {(metar.windDirDegrees || metar.windSpeedKt) && (
                    <Box>
                      <Group gap={4}>
                        <FiWind size={12} color="var(--mantine-color-gray-5)" />
                        <Text size="xs" c="dimmed">Wind</Text>
                      </Group>
                      <Text size="sm" c="white" fw={500}>
                        {isVariableWind ? 'Variable' : `${metar.windDirDegrees}°`} @ {metar.windSpeedKt || '--'}kt
                        {metar.windGustKt && (
                          <Text span c="yellow" fw={600}> G{metar.windGustKt}kt</Text>
                        )}
                      </Text>
                    </Box>
                  )}

                  {/* Visibility */}
                  {metar.visibilityStatuteMi && (
                    <Box>
                      <Text size="xs" c="dimmed">Visibility</Text>
                      <Text size="sm" c="white" fw={500}>
                        {metar.visibilityStatuteMi} SM
                      </Text>
                    </Box>
                  )}

                  {/* Temperature / Dewpoint */}
                  {(metar.tempC !== undefined || metar.dewpointC !== undefined) && (
                    <Box>
                      <Text size="xs" c="dimmed">Temp / Dewpoint</Text>
                      <Text size="sm" c="white" fw={500}>
                        {metar.tempC !== undefined ? `${metar.tempC}°C` : '--'} / {metar.dewpointC !== undefined ? `${metar.dewpointC}°C` : '--'}
                      </Text>
                    </Box>
                  )}

                  {/* Altimeter */}
                  {metar.altimInHg && (
                    <Box>
                      <Text size="xs" c="dimmed">Altimeter</Text>
                      <Text size="sm" c="white" fw={600}>
                        {metar.altimInHg.toFixed(2)}" Hg
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Sky Conditions */}
                {metar.skyCondition && metar.skyCondition.length > 0 && (
                  <Box>
                    <Group gap={4} mb={4}>
                      <Text size="xs" c="dimmed">Sky Conditions</Text>
                    </Group>
                    <Group gap="xs">
                      {metar.skyCondition.map((sky, idx) => (
                        <Badge key={idx} variant="light" color="blue" size="sm">
                          {sky.skyCover}
                          {sky.cloudBaseFtAgl && ` @ ${sky.cloudBaseFtAgl.toLocaleString()} ft`}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                {/* Weather Phenomena */}
                {metar.wxString && (
                  <Box>
                    <Text size="xs" c="dimmed">Weather</Text>
                    <Badge variant="light" color="orange" size="sm">
                      {metar.wxString}
                    </Badge>
                  </Box>
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No METAR available
              </Text>
            )}
          </Box>

          {/* TAF Section */}
          <Box>
            <Text size="sm" c="dimmed" mb="xs" fw={500}>
              Forecast (TAF)
            </Text>
            {tafLoading ? (
              <Stack align="center" py="md">
                <Loader size="sm" />
                <Text size="xs" c="dimmed">Loading TAF...</Text>
              </Stack>
            ) : taf ? (
              <Stack gap="sm">
                {/* Raw TAF */}
                <Text
                  size="xs"
                  c="gray.4"
                  style={{
                    fontFamily: 'monospace',
                    backgroundColor: SHADOW.LIGHT,
                    padding: '8px',
                    borderRadius: '4px',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {taf.rawText || 'No raw data'}
                </Text>

                {/* Validity Period */}
                {(taf.validTimeFrom || taf.validTimeTo) && (
                  <Text size="xs" c="dimmed">
                    Valid: {taf.validTimeFrom && new Date(taf.validTimeFrom).toLocaleString()} -{' '}
                    {taf.validTimeTo && new Date(taf.validTimeTo).toLocaleString()}
                  </Text>
                )}

                {/* Forecast Periods */}
                {taf.forecast && taf.forecast.length > 0 && (
                  <Accordion
                    variant="separated"
                    radius="md"
                    styles={{
                      item: {
                        backgroundColor: SURFACE_INNER.DEFAULT,
                        border: `1px solid ${BORDER.SUBTLE}`,
                      },
                      control: {
                        padding: '8px 12px',
                      },
                      panel: {
                        padding: '8px 12px',
                      },
                    }}
                  >
                    {taf.forecast.slice(0, 6).map((fcst, idx) => {
                      const changeLabel = fcst.changeIndicator === 'FM' ? 'From' :
                        fcst.changeIndicator === 'TEMPO' ? 'Temporary' :
                        fcst.changeIndicator === 'BECMG' ? 'Becoming' :
                        fcst.changeIndicator === 'PROB' ? 'Probability' :
                        fcst.changeIndicator || 'Initial';

                      return (
                        <Accordion.Item key={idx} value={`forecast-${idx}`}>
                          <Accordion.Control>
                            <Group gap="xs">
                              <Badge variant="light" color="cyan" size="sm">
                                {changeLabel}
                              </Badge>
                              {fcst.probability && (
                                <Badge variant="light" color="yellow" size="sm">
                                  {fcst.probability}%
                                </Badge>
                              )}
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
                            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                              {/* Wind */}
                              {(fcst.windDirDegrees || fcst.windSpeedKt) && (
                                <Box>
                                  <Text size="xs" c="dimmed">Wind</Text>
                                  <Text size="sm" c="white">
                                    {fcst.windDirDegrees}° @ {fcst.windSpeedKt}kt
                                    {fcst.windGustKt && (
                                      <Text span c="yellow"> G{fcst.windGustKt}</Text>
                                    )}
                                  </Text>
                                </Box>
                              )}
                              {/* Visibility */}
                              {fcst.visibilityStatuteMi && (
                                <Box>
                                  <Text size="xs" c="dimmed">Visibility</Text>
                                  <Text size="sm" c="white">{fcst.visibilityStatuteMi} SM</Text>
                                </Box>
                              )}
                              {/* Sky Conditions */}
                              {fcst.skyConditions && fcst.skyConditions.length > 0 && (
                                <Box>
                                  <Text size="xs" c="dimmed">Sky</Text>
                                  <Text size="sm" c="white">
                                    {fcst.skyConditions
                                      .map((s) => `${s.skyCover}${s.cloudBaseFtAgl ? ` @ ${s.cloudBaseFtAgl}ft` : ''}`)
                                      .join(', ')}
                                  </Text>
                                </Box>
                              )}
                              {/* Weather */}
                              {fcst.wxString && (
                                <Box>
                                  <Text size="xs" c="dimmed">Weather</Text>
                                  <Text size="sm" c="white">{fcst.wxString}</Text>
                                </Box>
                              )}
                            </SimpleGrid>
                          </Accordion.Panel>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                )}

                {taf.forecast && taf.forecast.length > 6 && (
                  <Text size="xs" c="dimmed">
                    + {taf.forecast.length - 6} more forecast periods
                  </Text>
                )}

                {/* Issue Time */}
                {taf.issueTime && (
                  <Text size="xs" c="dimmed">
                    Issued: {new Date(taf.issueTime).toLocaleString()}
                  </Text>
                )}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No TAF available
              </Text>
            )}
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
}
