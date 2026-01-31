import { Color } from 'cesium';
import { MetarDto } from '@/redux/api/vfr3d/dtos';
import { WeatherFlightCategories } from '@/utility/enums';

/**
 * Get Cesium Color for a flight category string
 * @param flightCategory - The flight category (VFR, MVFR, IFR, LIFR)
 * @returns Cesium Color for the flight category
 */
export function getColorForFlightCategory(flightCategory?: string): Color {
  switch (flightCategory) {
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

/**
 * Get Cesium Color for a METAR based on its flight category
 * @param metar - The METAR data containing flight category
 * @returns Cesium Color for the METAR's flight category
 */
export function getColorForMetar(metar?: MetarDto): Color {
  if (!metar) return Color.WHITE;
  return getColorForFlightCategory(metar.flightCategory);
}

/**
 * Get cloud base string from METAR if available
 * @param metar - The METAR data
 * @returns Formatted cloud base string or undefined if not available
 */
export function getCloudBaseText(metar?: MetarDto): string | undefined {
  const cloudBase = metar?.skyCondition?.[0]?.cloudBaseFtAgl;
  if (!cloudBase) return undefined;
  return `${cloudBase.toLocaleString()} ft AGL`;
}

/**
 * Build a combined label for an airport point entity
 * @param name - The airport name/identifier
 * @param showCloudBases - Whether to include cloud base info
 * @param metar - Optional METAR data for cloud base
 * @param altitude - Optional altitude to display (for waypoints)
 * @returns Combined label text with name and optionally cloud base
 */
export function buildAirportLabel(
  name: string,
  showCloudBases: boolean,
  metar?: MetarDto,
  altitude?: number
): string {
  const lines: string[] = [name];
  
  // Add altitude if provided (for waypoints in preview/viewing mode)
  if (altitude) {
    lines.push(`${Math.round(altitude).toLocaleString()} ft`);
  }
  
  // Add cloud base if toggle is on and data is available
  if (showCloudBases) {
    const cloudBaseText = getCloudBaseText(metar);
    if (cloudBaseText) {
      lines.push(`Clouds: ${cloudBaseText}`);
    }
  }
  
  return lines.join('\n');
}
