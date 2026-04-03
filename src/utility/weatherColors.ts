import { Color } from 'cesium';
import { MetarDto } from '@/redux/api/vfr3d/dtos';
import { WeatherFlightCategories } from '@/utility/enums';

// C2-style dark label background — matches SURFACE.BASE with alpha
export const MAP_LABEL_BG = Color.fromCssColorString('rgba(10, 12, 16, 0.85)');

/**
 * Get Cesium Color for a flight category string (for point rendering)
 * @param flightCategory - The flight category (VFR, MVFR, IFR, LIFR)
 * @returns Cesium Color for the flight category (white if unknown)
 */
export function getColorForFlightCategory(flightCategory?: string): Color {
  switch (flightCategory) {
    case WeatherFlightCategories.VFR:
      return Color.fromCssColorString('#2EA043');
    case WeatherFlightCategories.MVFR:
      return Color.fromCssColorString('#4A9EFF');
    case WeatherFlightCategories.IFR:
      return Color.fromCssColorString('#C94040');
    case WeatherFlightCategories.LIFR:
      return Color.fromCssColorString('#9066D6');
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
  return getColorForFlightCategory(metar.flightCategory ?? undefined);
}

/**
 * Get label background color — C2-style dark translucent background for all labels
 * @returns Dark C2 surface color
 */
export function getLabelBackgroundColor(): Color {
  return MAP_LABEL_BG;
}

/**
 * Get label text color based on flight category
 * Returns flight-category color on dark background (C2 pattern: colored text on dark surface)
 * @param metar - Optional METAR data for flight category coloring
 * @returns Cesium Color — category color if available, muted gray otherwise
 */
export function getLabelTextColor(metar?: MetarDto): Color {
  if (!metar || !metar.flightCategory) return Color.fromCssColorString('#8892A0');
  return getColorForFlightCategory(metar.flightCategory ?? undefined);
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
