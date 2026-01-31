import { Color } from 'cesium';
import { MetarDto } from '@/redux/api/vfr3d/dtos';
import { WeatherFlightCategories } from '@/utility/enums';

// Default label background color for airports without weather data - a neutral dark slate
const NO_WEATHER_LABEL_COLOR = Color.fromCssColorString('#4a5568');

/**
 * Get Cesium Color for a flight category string (for point rendering)
 * @param flightCategory - The flight category (VFR, MVFR, IFR, LIFR)
 * @returns Cesium Color for the flight category (white if unknown)
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
 * Get Cesium Color for a METAR based on its flight category (for point rendering)
 * @param metar - The METAR data containing flight category
 * @returns Cesium Color for the METAR's flight category (white if no METAR)
 */
export function getColorForMetar(metar?: MetarDto): Color {
  if (!metar) return Color.WHITE;
  return getColorForFlightCategory(metar.flightCategory);
}

/**
 * Get label background color for a METAR
 * Uses dark slate for no weather data (readable on any map), otherwise matches point color
 * @param metar - The METAR data containing flight category
 * @returns Cesium Color for the label background
 */
export function getLabelBackgroundColor(metar?: MetarDto): Color {
  if (!metar || !metar.flightCategory) return NO_WEATHER_LABEL_COLOR;
  return getColorForFlightCategory(metar.flightCategory);
}

/**
 * Get an appropriate label text color (always white - works well on all our background colors)
 * @returns White text color
 */
export function getLabelTextColor(): Color {
  return Color.WHITE;
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
