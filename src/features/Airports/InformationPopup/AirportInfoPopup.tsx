import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Paper, Tabs, ScrollArea } from '@mantine/core';
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
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import { Loader, Center } from '@mantine/core';

interface AirportInfoPopupProps {
  selectedAirport: AirportDto;
}

const AirportInfoPopup: React.FC<AirportInfoPopupProps> = ({ selectedAirport }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<string | null>('info');

  const icaoCodeOrIdent = selectedAirport?.icaoId || selectedAirport?.arptId || '';

  const {
    data: metar,
    isLoading: isLoadingMetar,
    error: metarError,
  } = useGetMetarForAirportQuery(icaoCodeOrIdent || '', {
    skip: !icaoCodeOrIdent,
    refetchOnMountOrArgChange: true,
    pollingInterval: 600000, // 10 minutes
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

  const handleClose = () => {
    dispatch(setSelectedEntity({ entity: null, type: null }));
  };

  if (!selectedAirport) return null;

  return (
    <Paper
      shadow="xl"
      radius="md"
      style={{
        position: 'fixed',
        top: 70,
        right: 16,
        bottom: 16,
        width: 400,
        maxWidth: 'calc(100vw - 32px)',
        backgroundColor: 'rgba(37, 38, 43, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AirportInfoHeader
        airport={selectedAirport}
        metar={metar}
        metarError={metarError}
        handleClose={handleClose}
        chartSupplementUrl={chartSupplementUrl}
        chartSupplementError={chartSupplementError}
        airportDiagramUrl={airportDiagramUrl}
        airportDiagramError={airportDiagramError}
        densityAltitude={densityAltitude}
        isDensityAltitudeLoading={isDensityAltitudeLoading}
      />

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="pills"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Box
          px="sm"
          py="xs"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(26, 27, 30, 0.6)',
          }}
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
        </Box>

        <ScrollArea style={{ flex: 1 }} p="sm">
          <Tabs.Panel value="info">
            <AirportInfo airport={selectedAirport} />
          </Tabs.Panel>

          <Tabs.Panel value="runways">
            {isRunwayInfoLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <RunwayInformation
                runwayInformation={runwayInformation}
                crosswindData={crosswindData}
                isCrosswindLoading={isCrosswindLoading}
              />
            )}
          </Tabs.Panel>

          <Tabs.Panel value="frequencies">
            {isFrequenciesLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <FrequencyInformation frequencies={frequencies} />
            )}
          </Tabs.Panel>

          <Tabs.Panel value="weather">
            <AirportWeather
              metar={metar}
              taf={taf}
              isLoadingMetar={isLoadingMetar}
              isLoadingTaf={isLoadingTaf}
              metarError={metarError}
              tafError={tafError}
            />
          </Tabs.Panel>
        </ScrollArea>
      </Tabs>
    </Paper>
  );
};

export default AirportInfoPopup;
