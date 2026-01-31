import { Color } from 'cesium';
import { MetarDto } from '@/redux/api/vfr3d/dtos';
import { WeatherFlightCategories } from '@/utility/enums';

// Default color for airports without weather data - a neutral dark slate
const NO_WEATHER_COLOR = Color.fromCssColorString('#4a5568');

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
      return NO_WEATHER_COLOR;
  }
}

/**
 * Get Cesium Color for a METAR based on its flight category
 * @param metar - The METAR data containing flight category
 * @returns Cesium Color for the METAR's flight category (dark slate if no METAR)
 */
export function getColorForMetar(metar?: MetarDto): Color {
  if (!metar) return NO_WEATHER_COLOR;
  return getColorForFlightCategory(metar.flightCategory);
}

/**
 * Get an appropriate label text color that contrasts with the given background color
 * @param backgroundColor - The background color of the label
 * @returns White text (works well on all our weather category colors including the dark default)
 */
export function getLabelTextColor(backgroundColor: Color): Color {
  // All our colors (VFR green, IFR red, MVFR blue, LIFR purple, and dark slate default)
  // work well with white text
  void backgroundColor; // Unused for now, but kept for potential future light color support
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
