import React, { memo } from 'react';
import { Cartesian2, Cartesian3, NearFarScalar } from 'cesium';
import { PointEntity } from '@/components/Cesium/PointEntity';
import { useGetMetarForAirportQuery } from '@/redux/api/vfr3d/weather.api';
import { useGetAirportByIcaoCodeOrIdentQuery } from '@/redux/api/vfr3d/airports.api';
import { getColorForMetar, buildAirportLabel, getLabelTextColor } from '@/utility/weatherColors';
import { setSelectedEntity } from '@/redux/slices/selectedEntitySlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { WaypointDto } from '@/redux/api/vfr3d/dtos';

interface AirportWaypointEntityProps {
  /** The waypoint data containing the airport identifier */
  waypoint: WaypointDto;
  /** The 3D position for rendering the entity */
  position: Cartesian3;
  /** Unique key for the entity */
  entityKey: string;
  /** Unique ID for the entity */
  pointId: string;
}

/**
 * Component for rendering airport waypoints on the route with weather-based coloring.
 * Fetches METAR data to determine the point color and airport data for the popup.
 * Shows combined label with waypoint name, altitude, and cloud base (when toggled on).
 */
const AirportWaypointEntity: React.FC<AirportWaypointEntityProps> = memo(({
  waypoint,
  position,
  entityKey,
  pointId,
}) => {
  const dispatch = useAppDispatch();
  const showCloudBases = useAppSelector((state) => state.airport.showCloudBases);
  const airportIdent = waypoint.name || '';

  // Fetch METAR data for the airport to get flight category for coloring and cloud base
  const { data: metar } = useGetMetarForAirportQuery(airportIdent, {
    skip: !airportIdent,
  });

  // Fetch full airport data for the popup
  const { data: airport } = useGetAirportByIcaoCodeOrIdentQuery(airportIdent, {
    skip: !airportIdent,
  });

  // Determine color based on flight category (weather)
  const pointColor = getColorForMetar(metar);
  const textColor = getLabelTextColor(pointColor);
  
  // Build combined label with name, altitude, and optionally cloud base
  const labelText = buildAirportLabel(
    airportIdent,
    showCloudBases,
    metar,
    waypoint.altitude
  );

  const handleClick = () => {
    if (airport) {
      // Use the full airport data from the lookup
      dispatch(setSelectedEntity({ entity: airport, type: 'Airport' }));
    } else {
      // Fallback: create a minimal AirportDto if lookup hasn't completed yet
      dispatch(setSelectedEntity({
        entity: {
          icaoId: airportIdent.toUpperCase(),
          arptId: airportIdent.toUpperCase(),
          arptName: waypoint.name,
          latDecimal: waypoint.latitude,
          longDecimal: waypoint.longitude,
        },
        type: 'Airport',
      }));
    }
  };

  return (
    <PointEntity
      key={entityKey}
      pixelSize={15}
      position={position}
      color={pointColor}
      id={pointId}
      onLeftClick={handleClick}
      draggable={false}
      labelText={labelText}
      labelColor={textColor}
      labelBackgroundColor={pointColor}
      labelScaleByDistance={new NearFarScalar(100000, 0.5, 500000, 0.3)}
      labelPixelOffset={new Cartesian2(0, -40)}
    />
  );
});

AirportWaypointEntity.displayName = 'AirportWaypointEntity';

export default AirportWaypointEntity;
