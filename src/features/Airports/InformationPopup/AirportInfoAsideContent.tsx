import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Box, Tabs, ScrollArea, Loader, Center, Stack, Badge, Button, Text, Alert, SegmentedControl, Group } from '@mantine/core';
import { FiExternalLink, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import AirportInfoHeader from './AirportInfoHeader';
import AirportInfo from './AirportInfo/AirportInfo';
import { RunwayInformation } from './AirportInfo/RunwayInformation';
import { FrequencyInformation } from './AirportInfo/FrequencyInformation';
import AirportWeather from './Weather/AirportWeather';
import { NotamsList } from '@/features/FlightDetails/components/NotamsCard';
import {
  useGetMetarForAirportQuery,
  useGetTafForAirportQuery,
} from '@/redux/api/vfr3d/weather.api';
import { useGetRunwaysByAirportCodeQuery } from '@/redux/api/vfr3d/airports.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetAirportDiagramUrlByAirportCodeQuery } from '@/redux/api/vfr3d/airportDiagram.api';
import { useGetChartSupplementUrlByAirportCodeQuery } from '@/redux/api/vfr3d/chartSupplements.api';
import {
  useGetCrosswindForAirportQuery,
  useGetDensityAltitudeForAirportQuery,
} from '@/redux/api/vfr3d/performance.api';
import { useGetNotamsForAirportQuery } from '@/redux/api/vfr3d/notams.api';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import classes from './AirportInfoAsideContent.module.css';

interface AirportInfoAsideContentProps {
  selectedAirport: AirportDto;
  onClose: () => void;
}

const AirportInfoAsideContent: React.FC<AirportInfoAsideContentProps> = ({ selectedAirport, onClose }) => {
  const [activeTab, setActiveTab] = useState<string | null>('info');
  const [notamViewMode, setNotamViewMode] = useState<'raw' | 'readable'>('raw');

  const icaoCodeOrIdent = selectedAirport?.icaoId || selectedAirport?.arptId || '';

  const {
    data: metar,
    isLoading: isLoadingMetar,
    error: metarError,
  } = useGetMetarForAirportQuery(icaoCodeOrIdent || '', {
    skip: !icaoCodeOrIdent,
    refetchOnMountOrArgChange: true,
    pollingInterval: 600000,
  });

  const {
    data: taf,
    isLoading: isLoadingTaf,
    error: tafError,
  } = useGetTafForAirportQuery(icaoCodeOrIdent || '', {
    skip: !icaoCodeOrIdent,
    refetchOnMountOrArgChange: true,
    pollingInterval: 600000,
  });

  const { data: runwayInformation, isLoading: isRunwayInfoLoading } =
    useGetRunwaysByAirportCodeQuery(icaoCodeOrIdent, { skip: !icaoCodeOrIdent });

  const { data: frequencies, isLoading: isFrequenciesLoading } =
    useGetFrequenciesByServicedFacilityQuery(selectedAirport.arptId ?? '', {
      skip: !selectedAirport.arptId,
    });

  const { data: chartSupplementUrl, error: chartSupplementError } =
    useGetChartSupplementUrlByAirportCodeQuery(icaoCodeOrIdent);

  const { data: airportDiagramUrl, error: airportDiagramError } =
    useGetAirportDiagramUrlByAirportCodeQuery(icaoCodeOrIdent);

  const { data: densityAltitude, isLoading: isDensityAltitudeLoading } =
    useGetDensityAltitudeForAirportQuery({ icaoCodeOrIdent }, { skip: !icaoCodeOrIdent });

  const { data: crosswindData, isLoading: isCrosswindLoading } = useGetCrosswindForAirportQuery(
    icaoCodeOrIdent,
    { skip: !icaoCodeOrIdent }
  );

  const {
    data: notamsData,
    isLoading: isNotamsLoading,
    error: notamsError,
  } = useGetNotamsForAirportQuery(icaoCodeOrIdent, { skip: !icaoCodeOrIdent });

  // Count critical NOTAMs
  const criticalNotamCount = useMemo(() => {
    if (!notamsData?.notams) return 0;
    return notamsData.notams.filter((n) => {
      const text = n.properties?.coreNOTAMData?.notam?.text?.toUpperCase() || '';
      return text.includes('CLSD') || text.includes('CLOSED') || text.includes('INOP') || text.includes('U/S');
    }).length;
  }, [notamsData]);

  if (!selectedAirport) return null;

  return (
    <Stack gap={0} h="100%">
      <AirportInfoHeader
        airport={selectedAirport}
        metar={metar}
        metarError={metarError}
        handleClose={onClose}
        chartSupplementUrl={chartSupplementUrl}
        chartSupplementError={chartSupplementError}
        airportDiagramUrl={airportDiagramUrl}
        airportDiagramError={airportDiagramError}
        densityAltitude={densityAltitude}
        isDensityAltitudeLoading={isDensityAltitudeLoading}
      />

      <Box className={classes.tabsList}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
        >
          <Tabs.List grow>
            <Tabs.Tab value="info" size="xs">
              Info
            </Tabs.Tab>
            <Tabs.Tab value="runways" size="xs">
              Runways
            </Tabs.Tab>
            <Tabs.Tab value="frequencies" size="xs">
              Freqs
            </Tabs.Tab>
            <Tabs.Tab value="weather" size="xs">
              Weather
            </Tabs.Tab>
            <Tabs.Tab
              value="notams"
              size="xs"
              rightSection={
                criticalNotamCount > 0 ? (
                  <Badge size="xs" color="red" variant="filled" p={4}>
                    {criticalNotamCount}
                  </Badge>
                ) : notamsData?.totalCount ? (
                  <Badge size="xs" color="gray" variant="light" p={4}>
                    {notamsData.totalCount}
                  </Badge>
                ) : null
              }
            >
              NOTAMs
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>

      <ScrollArea flex={1} scrollbarSize={6}>
        <Box p="sm">
          {activeTab === 'info' && <AirportInfo airport={selectedAirport} />}

          {activeTab === 'runways' && (
            isRunwayInfoLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <RunwayInformation
                runwayInformation={runwayInformation}
                crosswindData={crosswindData}
                isCrosswindLoading={isCrosswindLoading}
              />
            )
          )}

          {activeTab === 'frequencies' && (
            isFrequenciesLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <FrequencyInformation frequencies={frequencies} />
            )
          )}

          {activeTab === 'weather' && (
            <AirportWeather
              metar={metar}
              taf={taf}
              isLoadingMetar={isLoadingMetar}
              isLoadingTaf={isLoadingTaf}
              metarError={metarError}
              tafError={tafError}
            />
          )}

          {activeTab === 'notams' && (
            <Stack gap="sm">
              <Group justify="space-between" wrap="wrap">
                <Group gap="xs">
                  {notamsData?.totalCount !== undefined && (
                    <Badge variant="light" color="gray" size="sm">
                      {notamsData.totalCount} total
                    </Badge>
                  )}
                  {criticalNotamCount > 0 && (
                    <Badge variant="filled" color="red" size="sm">
                      {criticalNotamCount} critical
                    </Badge>
                  )}
                </Group>
                <SegmentedControl
                  size="xs"
                  value={notamViewMode}
                  onChange={(v) => setNotamViewMode(v as 'raw' | 'readable')}
                  data={[
                    { label: 'Raw', value: 'raw' },
                    { label: 'Translated', value: 'readable' },
                  ]}
                />
              </Group>

              {notamViewMode === 'readable' && (
                <Alert
                  icon={<FiAlertTriangle size={14} />}
                  color="yellow"
                  variant="light"
                  py="xs"
                  styles={{ message: { fontSize: '12px' } }}
                >
                  Translated text may contain errors. Always verify with raw NOTAM text.
                </Alert>
              )}

              {isNotamsLoading ? (
                <Center py="xl">
                  <Stack align="center" gap="sm">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">
                      Fetching NOTAMs...
                    </Text>
                  </Stack>
                </Center>
              ) : notamsError ? (
                <Alert icon={<FiAlertCircle size={16} />} title="Failed to load NOTAMs" color="red" variant="light">
                  <Text size="sm">We couldn't retrieve NOTAMs for this airport.</Text>
                </Alert>
              ) : (
                <NotamsList notamsData={notamsData} viewMode={notamViewMode} />
              )}
            </Stack>
          )}
        </Box>
      </ScrollArea>

      {/* View Full Details Button */}
      <Box
        p="sm"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(26, 27, 30, 0.6)',
        }}
      >
        <Button
          component={Link}
          to={`/airports/${icaoCodeOrIdent}`}
          variant="light"
          color="blue"
          fullWidth
          leftSection={<FiExternalLink size={14} />}
        >
          View Full Details
        </Button>
      </Box>
    </Stack>
  );
};

export default AirportInfoAsideContent;
