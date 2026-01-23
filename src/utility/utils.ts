import {
  AirportDto,
  FlightDto,
  WaypointDto,
  WaypointType,
  NavlogResponseDto,
} from '@/redux/api/vfr3d/dtos';
import { Color } from 'cesium';

export function mapWaypointsFlat(waypoint: WaypointDto) {
  const flatPoint: WaypointDto = {
    ...waypoint,
    altitude: 0,
  };

  return flatPoint;
}

export const mapAirportDTOToWaypoint = (airport: AirportDto): WaypointDto => {
  const routePoint: WaypointDto = {
    id: airport.siteNo,
    name: airport.icaoId || airport.arptId || '',
    latitude: airport.latDecimal ?? 0,
    longitude: airport.longDecimal ?? 0,
    altitude: airport.elev ?? 0,
    waypointType: WaypointType.Airport,
  };

  return routePoint;
};

export const mapFlightToNavlogData = (flight: FlightDto): NavlogResponseDto => {
  const navlogResponse: NavlogResponseDto = {
    totalRouteDistance: flight.totalRouteDistance ?? 0,
    totalRouteTimeHours: flight.totalRouteTimeHours ?? 0,
    totalFuelUsed: flight.totalFuelUsed ?? 0,
    averageWindComponent: flight.averageWindComponent ?? 0,
    legs: flight.legs ?? [],
  };

  return navlogResponse;
};

// Extract hex color from rgba string (approximate)
export const rgbaToHex = (rgba: string): string => {
  // Default to a reasonable color if parsing fails
  let hex = '#00fff9';

  try {
    // Extract RGB values from the rgba string if possible
    const rgbaMatch = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);

      hex =
        '#' +
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
    } else {
      // Try to use Cesium's color parser as fallback
      const cesiumColor = Color.fromCssColorString(rgba);
      if (cesiumColor) {
        const r = Math.round(cesiumColor.red * 255);
        const g = Math.round(cesiumColor.green * 255);
        const b = Math.round(cesiumColor.blue * 255);

        hex =
          '#' +
          r.toString(16).padStart(2, '0') +
          g.toString(16).padStart(2, '0') +
          b.toString(16).padStart(2, '0');
      }
    }
  } catch (e) {
    console.error('Error parsing color:', e);
  }

  return hex;
};
