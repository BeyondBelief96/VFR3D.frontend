import { Cartesian3, Cartographic, Math as CesiumMath, Viewer } from 'cesium';
import simplify from 'simplify-js';
import {
  AirportDto,
  AirspaceDto,
  ObstacleDto,
  PirepDto,
  SpecialUseAirspaceDto,
  WaypointDto,
} from '@/redux/api/vfr3d/dtos';

export const FEET_TO_METERS = 0.3048;
const FLIGHT_LEVEL_TO_METERS = 30.48; // 1 flight level = 100 feet

/**
 * Flys the camera for the given cesium viewer to the given point.
 * @param viewer The cesium viewer.
 * @param point Point to fly to.
 */
export const flyToPoint = (viewer: Viewer | undefined, point: Cartesian3) => {
  if (point && viewer) {
    viewer.camera.setView({
      destination: point,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
    });
    viewer.camera.moveBackward(100000);
  }
};

/**
 * Maps an airportDTO to a Cartesian3 to be plotted in cesium.
 * @param airport Airport to map.
 * @returns Cartesian3 or null.
 */
export const mapAirportDataToCartesian3Flat = (airport: AirportDto): Cartesian3 | null => {
  const longitude = airport.longDecimal;
  const latitude = airport.latDecimal;

  if (latitude && longitude) {
    return Cartesian3.fromDegrees(longitude, latitude);
  }

  return null;
};

/**
 * Maps a pirep to a cartesian3 to be plotted in cesium.
 * @param pirep Pirep to map
 * @returns Cartesian3 or null
 */
export const mapPirepToCartesian3 = (pirep: PirepDto): Cartesian3 | null => {
  if (!pirep.latitude || !pirep.longitude || !pirep.altitudeFtMsl) return null;
  return Cartesian3.fromDegrees(
    pirep.longitude,
    pirep.latitude,
    pirep.altitudeFtMsl * FEET_TO_METERS
  );
};

/**
 * Maps a waypoint with height to a cartesian3 to be plotted in cesium.
 * @param waypoint Waypoint to map.
 * @returns Cartesian3 or null
 */
export const mapWaypointToCartesian3 = (waypoint: WaypointDto): Cartesian3 | null => {
  return Cartesian3.fromDegrees(
    waypoint.longitude ?? 0,
    waypoint.latitude ?? 0,
    waypoint.altitude ? waypoint.altitude * FEET_TO_METERS : 0 //Cesium uses meters, but waypoint's store altitude in feet.
  );
};

/**
 *Maps a waypoint with zero height assumed to a cartesian3 to be plotted in cesium.
 * @param waypoint Waypoint to map.
 * @returns Cartesian3 or null
 */
export const mapWaypointToCartesian3Flat = (waypoint: WaypointDto): Cartesian3 | null => {
  return Cartesian3.fromDegrees(waypoint.longitude ?? 0, waypoint.latitude ?? 0);
};

export const isSameLocationWaypointCartesian = (
  cartesian: Cartesian3,
  waypoint: WaypointDto
): boolean => {
  if (!cartesian || !waypoint) {
    return false;
  }

  const cartographic = Cartographic.fromCartesian(cartesian);

  const cartesianLatitude = CesiumMath.toDegrees(cartographic.latitude);
  const cartesianLongitude = CesiumMath.toDegrees(cartographic.longitude);

  const epsilon = 0.0000001; // Adjust the tolerance as needed

  const latitudeDifference = Math.abs(cartesianLatitude - (waypoint.latitude ?? 0));
  const longitudeDifference = Math.abs(cartesianLongitude - (waypoint.longitude ?? 0));

  return latitudeDifference < epsilon && longitudeDifference < epsilon;
};

export function calculateMenuPosition(
  x: number,
  y: number,
  menuWidth: number,
  menuHeight: number,
  offsetX: number = 0,
  offsetY: number = 0
): { left: number; top: number } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Apply offsets
  let left = x + offsetX;
  let top = y + offsetY;

  // Adjust horizontal position if menu goes off the right edge
  if (left + menuWidth > viewportWidth) {
    left = Math.max(0, viewportWidth - menuWidth);
  }

  // Adjust horizontal position if menu goes off the left edge
  if (left < 0) {
    left = 0;
  }

  // Adjust vertical position if menu goes off the bottom edge
  if (top + menuHeight > viewportHeight) {
    top = Math.max(0, viewportHeight - menuHeight);
  }

  // Adjust vertical position if menu goes off the top edge
  if (top < 0) {
    top = 0;
  }

  return { left, top };
}

export function getAirspaceHeight(
  value: string | number | undefined,
  code: string | undefined,
  uom: string | undefined
): number {
  if (!value && code !== 'UNLTD') {
    console.warn('Missing value for airspace height');
    return 0;
  }

  let height: number;

  switch (code) {
    case 'SFC':
      return (height = Number(value) * FEET_TO_METERS);
    case 'UNLTD':
      return 100000; // An arbitrarily high altitude in meters
    case 'FL':
      height = Number(value) * FLIGHT_LEVEL_TO_METERS;
      break;
    case 'STD':
      height = Number(value) * FLIGHT_LEVEL_TO_METERS;
      break;
    default:
      if (uom === 'FT') {
        height = Number(value) * FEET_TO_METERS;
      } else {
        height = Number(value);
      }
  }

  return height < 0 ? 0 : height;
}

export function getAirspacePolygonHeights(airspace: AirspaceDto | SpecialUseAirspaceDto): {
  minHeight: number;
  maxHeight: number;
} {
  const lowerHeight = getAirspaceHeight(airspace.lowerVal, airspace.lowerCode, airspace.lowerUom);
  const upperHeight = getAirspaceHeight(airspace.upperVal, airspace.upperCode, airspace.upperUom);

  // If lower height is greater than upper height, swap them
  if (lowerHeight > upperHeight) {
    return { minHeight: upperHeight, maxHeight: lowerHeight };
  } else {
    return { minHeight: lowerHeight, maxHeight: upperHeight };
  }
}

export const simplifyPolygon = (coordinates: number[][], tolerance: number): number[][] => {
  const points = coordinates.map(([x, y]) => ({ x, y }));
  const simplified = simplify(points, tolerance, false);
  return simplified.map(({ x, y }) => [x, y]);
};

/**
 * Maps an obstacle to a Cartesian3 positioned at ground level.
 * The cylinder will extend upward from this position.
 * @param obstacle Obstacle to map.
 * @returns Cartesian3 or null.
 */
export const mapObstacleToCartesian3 = (obstacle: ObstacleDto): Cartesian3 | null => {
  if (!obstacle.latitude || !obstacle.longitude) return null;
  // Position at ground level - the cylinder extends upward from here
  return Cartesian3.fromDegrees(obstacle.longitude, obstacle.latitude);
};

/**
 * Gets the height of an obstacle in meters.
 * @param obstacle The obstacle DTO.
 * @param useAgl Whether to use AGL (true) or MSL (false) height.
 * @returns Height in meters.
 */
export const getObstacleHeightMeters = (obstacle: ObstacleDto, useAgl: boolean = true): number => {
  const heightFeet = useAgl ? (obstacle.heightAgl ?? 0) : (obstacle.heightAmsl ?? 0);
  return heightFeet * FEET_TO_METERS;
};
