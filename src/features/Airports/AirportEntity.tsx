import React, { memo } from 'react';
import { Cartesian2, NearFarScalar } from 'cesium';
import { PointEntity } from '@/components/Cesium';
import { mapAirportDataToCartesian3Flat } from '@/utility/cesiumUtils';
import { getAirportEntityIdFromAirport } from '@/utility/entityIdUtils';
import { useAppSelector } from '@/hooks/reduxHooks';
import { AirportDto, MetarDto } from '@/redux/api/vfr3d/dtos';
import { getColorForMetar, buildAirportLabel, getLabelTextColor, getLabelBackgroundColor } from '@/utility/weatherColors';

interface AirportEntityProps {
  airport: AirportDto;
  metar?: MetarDto;
}

const AirportEntity: React.FC<AirportEntityProps> = memo(({ airport, metar }) => {
  const showCloudBases = useAppSelector((state) => state.airport.showCloudBases);
  const position = mapAirportDataToCartesian3Flat(airport);

  if (!position) return null;

  // Point color (white when no METAR, otherwise flight category color)
  const pointColor = getColorForMetar(metar);
  // Label background (dark slate when no METAR, otherwise flight category color)
  const labelBgColor = getLabelBackgroundColor(metar);
  const textColor = getLabelTextColor();
  
  // Get the airport identifier (prefer ICAO, fall back to FAA ID)
  const airportIdent = airport.icaoId || airport.arptId || '';
  
  // Build combined label with name and optionally cloud base
  const labelText = buildAirportLabel(airportIdent, showCloudBases, metar);

  return (
    <PointEntity
      position={position}
      color={pointColor}
      id={getAirportEntityIdFromAirport(airport)}
      scaleByDistance={new NearFarScalar(1000000, 1.5, 5000000, 1)}
      labelText={labelText}
      labelColor={textColor}
      labelBackgroundColor={labelBgColor}
      labelPixelOffset={new Cartesian2(0, -20)}
      labelScaleByDistance={new NearFarScalar(100000, 0.5, 500000, 0.3)}
    />
  );
});

AirportEntity.displayName = 'AirportEntity';

export default AirportEntity;
