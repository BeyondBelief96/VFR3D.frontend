import { useMemo } from 'react';
import {
  useGetAirportsByIcaoCodesOrIdentsQuery,
  useGetAirportsByStatesQuery,
} from '@/redux/api/vfr3d/airports.api';
import { useGetMetarsByStatesQuery } from '@/redux/api/vfr3d/weather.api';
import { useSelector } from 'react-redux';
import AirportEntities from './AirportEntities';
import { useGetFlightQuery } from '@/redux/api/vfr3d/flights.api';
import { useAuth0 } from '@auth0/auth0-react';
import { FlightDisplayMode } from '@/utility/enums';
import { AirportDto, WaypointType } from '@/redux/api/vfr3d/dtos';
import type { RootState } from '@/redux/store';

const Airports: React.FC = () => {
  const { user } = useAuth0();
  const {
    showAirportsForSelectedState,
    showFlightPlanAirports,
    selectedStateToShowAirports,
    searchedAirportState,
  } = useSelector((state: RootState) => state.airport);

  const { displayMode, draftFlightPlan, editingFlightPlan, activeFlightId } = useSelector(
    (state: RootState) => state.flightPlanning
  );

  // Get active flight for viewing mode
  const { data: activeFlight } = useGetFlightQuery(
    { userId: user?.sub || '', flightId: activeFlightId || '' },
    {
      skip: !user?.sub || !activeFlightId || displayMode !== FlightDisplayMode.VIEWING,
    }
  );

  // Determine flight plan route based on display mode
  const flightPlanRoute = useMemo(() => {
    switch (displayMode) {
      case FlightDisplayMode.PLANNING:
        return draftFlightPlan?.waypoints || [];

      case FlightDisplayMode.EDITING:
        return editingFlightPlan?.waypoints || [];

      case FlightDisplayMode.VIEWING:
        return activeFlight?.waypoints || [];

      case FlightDisplayMode.PREVIEW:
        return draftFlightPlan?.waypoints || [];

      default:
        return [];
    }
  }, [displayMode, draftFlightPlan, editingFlightPlan, activeFlight]);

  const flightPlanWaypointNames = useMemo(() => {
    return flightPlanRoute
      .map((waypoint) => waypoint.name)
      .filter((name): name is string => name?.length === 3 || name?.length === 4);
  }, [flightPlanRoute]);

  const { data: routeAirports } = useGetAirportsByIcaoCodesOrIdentsQuery(flightPlanWaypointNames, {
    skip: flightPlanWaypointNames.length === 0,
  });

  const statesToQuery = useMemo(() => {
    const states = new Set<string>();

    if (showAirportsForSelectedState && selectedStateToShowAirports) {
      states.add(selectedStateToShowAirports);
    }

    if (searchedAirportState) {
      states.add(searchedAirportState);
    }

    // Add states from route airports
    if (routeAirports?.length) {
      routeAirports.forEach((airport) => {
        if (airport.stateCode) {
          states.add(airport.stateCode);
        }
      });
    }

    if (showFlightPlanAirports && activeFlight) {
      activeFlight?.stateCodesAlongRoute?.forEach((state) => states.add(state));
    }

    return Array.from(states);
  }, [
    activeFlight,
    searchedAirportState,
    selectedStateToShowAirports,
    showAirportsForSelectedState,
    showFlightPlanAirports,
    routeAirports,
  ]);

  const { data: allFetchedAirports = [] } = useGetAirportsByStatesQuery(statesToQuery, {
    skip: statesToQuery.length === 0,
  });

  const { data: metarData = [] } = useGetMetarsByStatesQuery(statesToQuery, {
    skip: statesToQuery.length === 0,
    pollingInterval: 300000,
  });

  const metarMap = new Map(
    metarData
      .filter((metar) => metar.stationId !== undefined)
      .map((metar) => [metar.stationId as string, metar])
  );

  // Get the set of airport identifiers from route waypoints (to exclude in PREVIEW/VIEWING mode)
  const routeAirportIdents = useMemo(() => {
    const isPreviewOrViewing =
      displayMode === FlightDisplayMode.PREVIEW || displayMode === FlightDisplayMode.VIEWING;
    
    if (!isPreviewOrViewing) return new Set<string>();
    
    // Get identifiers of airports that are waypoints on the route
    return new Set(
      flightPlanRoute
        .filter((wp) => wp.waypointType === WaypointType.Airport)
        .map((wp) => wp.name?.toUpperCase())
        .filter((name): name is string => !!name)
    );
  }, [flightPlanRoute, displayMode]);

  // Filter airports based on toggle states and requirements
  const visibleAirports = useMemo(() => {
    // Start with an empty array
    let airports: AirportDto[] = [];

    // Add searched airport state airports (always show these)
    if (searchedAirportState) {
      const searchedStateAirports = allFetchedAirports.filter(
        (airport) => airport.stateCode === searchedAirportState
      );
      airports = [...airports, ...searchedStateAirports];
    }

    // Add selected state airports if the toggle is on
    if (showAirportsForSelectedState && selectedStateToShowAirports) {
      const selectedStateAirports = allFetchedAirports.filter(
        (airport) => airport.stateCode === selectedStateToShowAirports
      );
      airports = [...airports, ...selectedStateAirports];
    }

    // Add route airports (these should always be visible)
    if (routeAirports?.length) {
      airports = [...airports, ...routeAirports];

      // Also add all airports from the route airports' states (for planning/editing mode)
      const routeStates = new Set(
        routeAirports.map((a) => a.stateCode).filter((s): s is string => !!s)
      );
      const routeStateAirports = allFetchedAirports.filter(
        (airport) => airport.stateCode && routeStates.has(airport.stateCode)
      );
      airports = [...airports, ...routeStateAirports];
    }

    // Add flight plan airports if toggled on (for viewing saved flights)
    if (showFlightPlanAirports && activeFlight?.stateCodesAlongRoute) {
      const flightPlanStateAirports = allFetchedAirports.filter(
        (airport) =>
          airport.stateCode && activeFlight.stateCodesAlongRoute?.includes(airport.stateCode)
      );
      airports = [...airports, ...flightPlanStateAirports];
    }

    // Remove duplicates based on airport ID
    let uniqueAirports = Array.from(
      new Map(airports.map((airport) => [airport.siteNo, airport])).values()
    );

    // In PREVIEW or VIEWING mode, filter out airports that are waypoints on the route
    // These will be rendered by AirportWaypointEntity instead to show altitude info
    if (routeAirportIdents.size > 0) {
      uniqueAirports = uniqueAirports.filter((airport) => {
        const icao = airport.icaoId?.toUpperCase();
        const faa = airport.arptId?.toUpperCase();
        // Keep airport if it's NOT in the route waypoints
        return !routeAirportIdents.has(icao || '') && !routeAirportIdents.has(faa || '');
      });
    }

    return uniqueAirports;
  }, [
    allFetchedAirports,
    searchedAirportState,
    showAirportsForSelectedState,
    selectedStateToShowAirports,
    routeAirports,
    showFlightPlanAirports,
    activeFlight,
    routeAirportIdents,
  ]);

  return <AirportEntities airports={visibleAirports} metarMap={metarMap} />;
};

export default Airports;
