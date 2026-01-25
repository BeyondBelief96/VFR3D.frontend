import React, { memo } from 'react';
import { Cartesian2, Color, NearFarScalar } from 'cesium';
import { WeatherFlightCategories } from '@/utility/enums';
import { PointEntity } from '@/components/Cesium';
import { mapAirportDataToCartesian3Flat } from '@/utility/cesiumUtils';
import { getAirportEntityIdFromAirport } from '@/utility/entityIdUtils';
import { useAppSelector } from '@/hooks/reduxHooks';
import { AirportDto, MetarDto } from '@/redux/api/vfr3d/dtos';

interface AirportEntityProps {
  airport: AirportDto;
  metar?: MetarDto;
}

const AirportEntity: React.FC<AirportEntityProps> = memo(({ airport, metar }) => {
  const showCloudBases = useAppSelector((state) => state.airport.showCloudBases);
  const position = mapAirportDataToCartesian3Flat(airport);

  if (!position) return null;

  function getColorForMetar(metar?: MetarDto): Color {
    if (!metar) return Color.WHITE;

    switch (metar.flightCategory) {
      case WeatherFlightCategories.VFR:
        return Color.GREEN;
      case WeatherFlightCategories.MVFR:
        return Color.BLUE;
      case WeatherFlightCategories.IFR:
        return Color.RED;
      case WeatherFlightCategories.LIFR:
        return Color.PURPLE;
      default:
        return Color.WHITE;
    }
  }

  function getCloudBaseLabel(showCloudBases: boolean, metar?: MetarDto, color?: Color) {
    if (!showCloudBases || !metar?.skyCondition?.[0].cloudBaseFtAgl) return {};

    return {
      labelText: `Cloud Base: ${metar.skyCondition[0].cloudBaseFtAgl.toLocaleString()} ft AGL`,
      labelBackgroundColor: color,
      labelPixelOffset: new Cartesian2(0, -20),
      labelScaleByDistance: new NearFarScalar(100000, 0.5, 500000, 0.3),
    };
  }

  const color = getColorForMetar(metar);
  const cloudBaseLabel = getCloudBaseLabel(showCloudBases, metar, color);

  return (
    <PointEntity
      position={position}
      color={color}
      id={getAirportEntityIdFromAirport(airport)}
      scaleByDistance={new NearFarScalar(1000000, 1.5, 5000000, 1)}
      {...cloudBaseLabel}
    />
  );
});

AirportEntity.displayName = 'AirportEntity';

export default AirportEntity;
