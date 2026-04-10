import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useCesium } from 'resium';
import { Cartesian3 } from 'cesium';
import { flyToPoint, mapWaypointToCartesian3 } from '@/utility/cesiumUtils';
import type { RootState } from '@/redux/store';
import { AirportDto } from '@/redux/api/vfr3d/dtos';

const FlyTo = () => {
  const { viewer } = useCesium();
  const flightPlanRoute = useSelector(
    (state: RootState) => state.flightPlanning.draftFlightPlan.waypoints
  );
  const airspaceAirports = useSelector((state: RootState) => state.airspaces.airspaceAirports);
  const obstacleAirports = useSelector((state: RootState) => state.obstacles.obstacleAirports);

  const selectedEntity = useSelector((state: RootState) => state.selectedEntity.entity);
  const selectedEntityType = useSelector((state: RootState) => state.selectedEntity.type);
  const triggerSearchCount = useSelector((state: RootState) => state.search.triggerSearchCount);

  const [flyToInitialRoutePoint, setFlyToInitialRoutePoint] = useState(true);
  const prevAirspaceAirportsLengthRef = useRef(airspaceAirports.length);
  const prevObstacleAirportsLengthRef = useRef(obstacleAirports.length);
  const prevTriggerSearchCountRef = useRef(triggerSearchCount);

  // useEffect that handles setting camera position to initial point of route.
  useEffect(() => {
    if (!flightPlanRoute) return;
    if (flightPlanRoute.length === 0) {
      setFlyToInitialRoutePoint(true);
      return;
    }

    if (flyToInitialRoutePoint) {
      const position = mapWaypointToCartesian3(flightPlanRoute[0]);
      if (position) {
        flyToPoint(viewer, position);

        if (flightPlanRoute.length > 1) setFlyToInitialRoutePoint(false);
      }
    }
  }, [flightPlanRoute, flyToInitialRoutePoint, viewer]);

  // Fly to airport selected from search bar
  useEffect(() => {
    if (triggerSearchCount > prevTriggerSearchCountRef.current) {
      if (selectedEntityType === 'Airport' && selectedEntity) {
        const airport = selectedEntity as AirportDto;
        if (airport.latDecimal && airport.longDecimal) {
          const position = Cartesian3.fromDegrees(airport.longDecimal, airport.latDecimal);
          flyToPoint(viewer, position);
        }
      }
    }
    prevTriggerSearchCountRef.current = triggerSearchCount;
  }, [triggerSearchCount, selectedEntity, selectedEntityType, viewer]);

  // Fly to newly added airspace airports
  useEffect(() => {
    if (airspaceAirports.length > prevAirspaceAirportsLengthRef.current) {
      // An airport was added - fly to the most recently added one (last in array)
      const newAirport = airspaceAirports[airspaceAirports.length - 1];
      if (newAirport) {
        const position = Cartesian3.fromDegrees(newAirport.lon, newAirport.lat);
        flyToPoint(viewer, position);
      }
    }
    prevAirspaceAirportsLengthRef.current = airspaceAirports.length;
  }, [airspaceAirports, viewer]);

  // Fly to newly added obstacle airports
  useEffect(() => {
    if (obstacleAirports.length > prevObstacleAirportsLengthRef.current) {
      // An airport was added - fly to the most recently added one (last in array)
      const newAirport = obstacleAirports[obstacleAirports.length - 1];
      if (newAirport) {
        const position = Cartesian3.fromDegrees(newAirport.lon, newAirport.lat);
        flyToPoint(viewer, position);
      }
    }
    prevObstacleAirportsLengthRef.current = obstacleAirports.length;
  }, [obstacleAirports, viewer]);

  return null;
};

export default FlyTo;
