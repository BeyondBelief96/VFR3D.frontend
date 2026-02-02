import { useState } from 'react';
import { Box, Tabs, ScrollArea, Loader, Center, Stack } from '@mantine/core';
import AirportInfoHeader from './AirportInfoHeader';
import AirportInfo from './AirportInfo/AirportInfo';
import { RunwayInformation } from './AirportInfo/RunwayInformation';
import { FrequencyInformation } from './AirportInfo/FrequencyInformation';
import AirportWeather from './Weather/AirportWeather';
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
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import classes from './AirportInfoAsideContent.module.css';

interface AirportInfoAsideContentProps {
  selectedAirport: AirportDto;
  onClose: () => void;
}

const AirportInfoAsideContent: React.FC<AirportInfoAsideContentProps> = ({ selectedAirport, onClose }) => {
  const [activeTab, setActiveTab] = useState<string | null>('info');

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
          <Tabs.List>
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
        </Box>
      </ScrollArea>
    </Stack>
  );
};

export default AirportInfoAsideContent;
