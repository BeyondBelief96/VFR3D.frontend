import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useCesium } from 'resium';
import { Cartesian3 } from 'cesium';
import { flyToPoint, mapAirportDataToCartesian3Flat, mapWaypointToCartesian3 } from '@/utility/cesiumUtils';
import { AirportDto } from '@/redux/api/vfr3d/dtos';
import type { RootState } from '@/redux/store';

const FlyTo = () => {
  const { viewer } = useCesium();
  const selectedEntity = useSelector((state: RootState) => state.selectedEntity.entity);
  const selectedEntityType = useSelector((state: RootState) => state.selectedEntity.type);
  const flightPlanRoute = useSelector(
    (state: RootState) => state.flightPlanning.draftFlightPlan.waypoints
  );
  const airspaceAirports = useSelector((state: RootState) => state.airspaces.airspaceAirports);
  const obstacleAirports = useSelector((state: RootState) => state.obstacles.obstacleAirports);

  const [flyToInitialRoutePoint, setFlyToInitialRoutePoint] = useState(true);
  const prevAirspaceAirportsLengthRef = useRef(airspaceAirports.length);
  const prevObstacleAirportsLengthRef = useRef(obstacleAirports.length);

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

  // Fly to the currently selected airport when selection changes
  useEffect(() => {
    if (selectedEntityType === 'Airport' && selectedEntity) {
      const airport = selectedEntity as AirportDto;
      const position = mapAirportDataToCartesian3Flat(airport);
      if (position) flyToPoint(viewer, position);
    }
  }, [selectedEntityType, selectedEntity, viewer]);

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
