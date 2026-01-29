import { useMemo } from 'react';
import {
  FlightDto,
  AirportDto,
  MetarDto,
  TafDto,
  RunwayDto,
  CommunicationFrequencyDto,
  AirportCrosswindResponseDto,
  WeightBalanceCalculationDto,
  WaypointType,
} from '@/redux/api/vfr3d/dtos';
import { useGetAirportsByIcaoCodesOrIdentsQuery, useGetRunwaysByAirportCodeQuery } from '@/redux/api/vfr3d/airports.api';
import { useGetFrequenciesByServicedFacilityQuery } from '@/redux/api/vfr3d/frequency.api';
import { useGetMetarForAirportQuery, useGetTafForAirportQuery } from '@/redux/api/vfr3d/weather.api';
import { useGetCrosswindForAirportQuery } from '@/redux/api/vfr3d/performance.api';
import { useGetCalculationForFlightQuery } from '@/redux/api/vfr3d/weightBalance.api';

export interface FlightPdfData {
  flight: FlightDto;
  airports: AirportDto[];
  metars: { [key: string]: MetarDto };
  tafs: { [key: string]: TafDto };
  runways: { [key: string]: RunwayDto[] };
  frequencies: { [key: string]: CommunicationFrequencyDto[] };
  crosswindData: { [key: string]: AirportCrosswindResponseDto };
  weightBalance: WeightBalanceCalculationDto | null;
  isLoading: boolean;
}

/**
 * Hook to gather all data needed for the flight PDF
 * Fetches airports, weather, runways, frequencies, crosswind, and weight balance data
 */
export function useFlightPdfData(
  flight: FlightDto | undefined,
  userId: string
): FlightPdfData {
  // Extract airport identifiers from waypoints
  const airportIdents = useMemo(() => {
    if (!flight?.waypoints) return [];
    return flight.waypoints
      .filter((wp) => wp.waypointType === WaypointType.Airport && wp.name)
      .map((wp) => wp.name!)
      .filter((name, index, self) => self.indexOf(name) === index);
  }, [flight?.waypoints]);

  // Fetch airports
  const { data: airports = [], isLoading: airportsLoading } = useGetAirportsByIcaoCodesOrIdentsQuery(
    airportIdents,
    { skip: airportIdents.length === 0 }
  );

  // Fetch weight balance calculation for this flight
  const { data: weightBalance, isLoading: wbLoading } = useGetCalculationForFlightQuery(
    { userId, flightId: flight?.id || '' },
    { skip: !userId || !flight?.id }
  );

  // For each airport, we need to fetch weather, runways, frequencies, and crosswind
  // Using individual queries for each airport (up to 4 airports typically)
  const ident0 = airportIdents[0] || '';
  const ident1 = airportIdents[1] || '';
  const ident2 = airportIdents[2] || '';
  const ident3 = airportIdents[3] || '';

  // METARs
  const { data: metar0, isLoading: metar0Loading } = useGetMetarForAirportQuery(ident0, { skip: !ident0 });
  const { data: metar1, isLoading: metar1Loading } = useGetMetarForAirportQuery(ident1, { skip: !ident1 });
  const { data: metar2, isLoading: metar2Loading } = useGetMetarForAirportQuery(ident2, { skip: !ident2 });
  const { data: metar3, isLoading: metar3Loading } = useGetMetarForAirportQuery(ident3, { skip: !ident3 });

  // TAFs
  const { data: taf0, isLoading: taf0Loading } = useGetTafForAirportQuery(ident0, { skip: !ident0 });
  const { data: taf1, isLoading: taf1Loading } = useGetTafForAirportQuery(ident1, { skip: !ident1 });
  const { data: taf2, isLoading: taf2Loading } = useGetTafForAirportQuery(ident2, { skip: !ident2 });
  const { data: taf3, isLoading: taf3Loading } = useGetTafForAirportQuery(ident3, { skip: !ident3 });

  // Runways
  const { data: runways0, isLoading: runways0Loading } = useGetRunwaysByAirportCodeQuery(ident0, { skip: !ident0 });
  const { data: runways1, isLoading: runways1Loading } = useGetRunwaysByAirportCodeQuery(ident1, { skip: !ident1 });
  const { data: runways2, isLoading: runways2Loading } = useGetRunwaysByAirportCodeQuery(ident2, { skip: !ident2 });
  const { data: runways3, isLoading: runways3Loading } = useGetRunwaysByAirportCodeQuery(ident3, { skip: !ident3 });

  // Frequencies
  const { data: freq0, isLoading: freq0Loading } = useGetFrequenciesByServicedFacilityQuery(ident0, { skip: !ident0 });
  const { data: freq1, isLoading: freq1Loading } = useGetFrequenciesByServicedFacilityQuery(ident1, { skip: !ident1 });
  const { data: freq2, isLoading: freq2Loading } = useGetFrequenciesByServicedFacilityQuery(ident2, { skip: !ident2 });
  const { data: freq3, isLoading: freq3Loading } = useGetFrequenciesByServicedFacilityQuery(ident3, { skip: !ident3 });

  // Crosswind data
  const { data: crosswind0, isLoading: crosswind0Loading } = useGetCrosswindForAirportQuery(ident0, { skip: !ident0 });
  const { data: crosswind1, isLoading: crosswind1Loading } = useGetCrosswindForAirportQuery(ident1, { skip: !ident1 });
  const { data: crosswind2, isLoading: crosswind2Loading } = useGetCrosswindForAirportQuery(ident2, { skip: !ident2 });
  const { data: crosswind3, isLoading: crosswind3Loading } = useGetCrosswindForAirportQuery(ident3, { skip: !ident3 });

  // Combine all loading states
  const isLoading =
    airportsLoading ||
    wbLoading ||
    metar0Loading || metar1Loading || metar2Loading || metar3Loading ||
    taf0Loading || taf1Loading || taf2Loading || taf3Loading ||
    runways0Loading || runways1Loading || runways2Loading || runways3Loading ||
    freq0Loading || freq1Loading || freq2Loading || freq3Loading ||
    crosswind0Loading || crosswind1Loading || crosswind2Loading || crosswind3Loading;

  // Build the data maps
  const metars = useMemo(() => {
    const map: { [key: string]: MetarDto } = {};
    if (ident0 && metar0) map[ident0] = metar0;
    if (ident1 && metar1) map[ident1] = metar1;
    if (ident2 && metar2) map[ident2] = metar2;
    if (ident3 && metar3) map[ident3] = metar3;
    return map;
  }, [ident0, ident1, ident2, ident3, metar0, metar1, metar2, metar3]);

  const tafs = useMemo(() => {
    const map: { [key: string]: TafDto } = {};
    if (ident0 && taf0) map[ident0] = taf0;
    if (ident1 && taf1) map[ident1] = taf1;
    if (ident2 && taf2) map[ident2] = taf2;
    if (ident3 && taf3) map[ident3] = taf3;
    return map;
  }, [ident0, ident1, ident2, ident3, taf0, taf1, taf2, taf3]);

  const runwaysMap = useMemo(() => {
    const map: { [key: string]: RunwayDto[] } = {};
    if (ident0 && runways0) map[ident0] = runways0;
    if (ident1 && runways1) map[ident1] = runways1;
    if (ident2 && runways2) map[ident2] = runways2;
    if (ident3 && runways3) map[ident3] = runways3;
    return map;
  }, [ident0, ident1, ident2, ident3, runways0, runways1, runways2, runways3]);

  const frequenciesMap = useMemo(() => {
    const map: { [key: string]: CommunicationFrequencyDto[] } = {};
    if (ident0 && freq0) map[ident0] = freq0;
    if (ident1 && freq1) map[ident1] = freq1;
    if (ident2 && freq2) map[ident2] = freq2;
    if (ident3 && freq3) map[ident3] = freq3;
    return map;
  }, [ident0, ident1, ident2, ident3, freq0, freq1, freq2, freq3]);

  const crosswindDataMap = useMemo(() => {
    const map: { [key: string]: AirportCrosswindResponseDto } = {};
    if (ident0 && crosswind0) map[ident0] = crosswind0;
    if (ident1 && crosswind1) map[ident1] = crosswind1;
    if (ident2 && crosswind2) map[ident2] = crosswind2;
    if (ident3 && crosswind3) map[ident3] = crosswind3;
    return map;
  }, [ident0, ident1, ident2, ident3, crosswind0, crosswind1, crosswind2, crosswind3]);

  return {
    flight: flight || ({} as FlightDto),
    airports,
    metars,
    tafs,
    runways: runwaysMap,
    frequencies: frequenciesMap,
    crosswindData: crosswindDataMap,
    weightBalance: weightBalance || null,
    isLoading,
  };
}

export default useFlightPdfData;
