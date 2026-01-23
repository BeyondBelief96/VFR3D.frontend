import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCesium } from 'resium';
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

  const [flyToInitialRoutePoint, setFlyToInitialRoutePoint] = useState(true);

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

  return null;
};

export default FlyTo;
