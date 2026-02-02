import { AirspeedUnits, LengthUnits } from '@/redux/api/vfr3d/dtos';

/**
 * Unit Conversion Utilities
 *
 * NOTE: Performance profile data is stored in the user's preferred units on the backend.
 * The backend handles conversion to standard units (knots) internally for navlog calculations.
 *
 * These conversion functions are primarily useful for:
 * - Navlog display: Backend returns calculated values in standard units (knots, feet, nm)
 *   which may need conversion to user's preferred units for display
 * - Any other places where we receive data in standard units but need to display
 *   in user's preferred units
 */

/**
 * Conversion factors for airspeed units (all relative to knots as the standard)
 */
const AIRSPEED_TO_KNOTS: Record<AirspeedUnits, number> = {
  [AirspeedUnits.Knots]: 1,
  [AirspeedUnits.MPH]: 1 / 1.15078,
  [AirspeedUnits.KPH]: 1 / 1.852,
};

const KNOTS_TO_AIRSPEED: Record<AirspeedUnits, number> = {
  [AirspeedUnits.Knots]: 1,
  [AirspeedUnits.MPH]: 1.15078,
  [AirspeedUnits.KPH]: 1.852,
};

/**
 * Conversion factors for length/altitude units (all relative to feet as the standard)
 */
const LENGTH_TO_FEET: Record<LengthUnits, number> = {
  [LengthUnits.Feet]: 1,
  [LengthUnits.Meters]: 3.28084,
};

const FEET_TO_LENGTH: Record<LengthUnits, number> = {
  [LengthUnits.Feet]: 1,
  [LengthUnits.Meters]: 1 / 3.28084,
};

/**
 * Unit abbreviations for display
 */
export const AIRSPEED_UNIT_LABELS: Record<AirspeedUnits, string> = {
  [AirspeedUnits.Knots]: 'kts',
  [AirspeedUnits.MPH]: 'mph',
  [AirspeedUnits.KPH]: 'kph',
};

export const LENGTH_UNIT_LABELS: Record<LengthUnits, string> = {
  [LengthUnits.Feet]: 'ft',
  [LengthUnits.Meters]: 'm',
};

/**
 * Convert airspeed from user's units to standard (knots)
 * Used when saving profile data to the backend
 * @param value - The airspeed value in user's units
 * @param fromUnits - The user's preferred airspeed units
 * @returns The airspeed in knots
 */
export const airspeedToKnots = (
  value: number | undefined | null,
  fromUnits: AirspeedUnits | undefined
): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const units = fromUnits || AirspeedUnits.Knots;
  return Math.round(value * AIRSPEED_TO_KNOTS[units] * 10) / 10;
};

/**
 * Convert airspeed from standard (knots) to user's units
 * Used when displaying profile data in the UI
 * @param value - The airspeed value in knots
 * @param toUnits - The user's preferred airspeed units
 * @returns The airspeed in user's preferred units
 */
export const knotsToAirspeed = (
  value: number | undefined | null,
  toUnits: AirspeedUnits | undefined
): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const units = toUnits || AirspeedUnits.Knots;
  return Math.round(value * KNOTS_TO_AIRSPEED[units] * 10) / 10;
};

/**
 * Convert length/altitude from user's units to standard (feet)
 * @param value - The length value in user's units
 * @param fromUnits - The user's preferred length units
 * @returns The length in feet
 */
export const lengthToFeet = (
  value: number | undefined | null,
  fromUnits: LengthUnits | undefined
): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const units = fromUnits || LengthUnits.Feet;
  return Math.round(value * LENGTH_TO_FEET[units]);
};

/**
 * Convert length/altitude from standard (feet) to user's units
 * @param value - The length value in feet
 * @param toUnits - The user's preferred length units
 * @returns The length in user's preferred units
 */
export const feetToLength = (
  value: number | undefined | null,
  toUnits: LengthUnits | undefined
): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const units = toUnits || LengthUnits.Feet;
  return Math.round(value * FEET_TO_LENGTH[units]);
};

/**
 * Get the abbreviation for an airspeed unit
 * @param units - The airspeed unit enum value
 * @returns The abbreviation (e.g., 'kts', 'mph', 'kph')
 */
export const getAirspeedUnitLabel = (units: AirspeedUnits | undefined): string => {
  return AIRSPEED_UNIT_LABELS[units || AirspeedUnits.Knots];
};

/**
 * Get the abbreviation for a length unit
 * @param units - The length unit enum value
 * @returns The abbreviation (e.g., 'ft', 'm')
 */
export const getLengthUnitLabel = (units: LengthUnits | undefined): string => {
  return LENGTH_UNIT_LABELS[units || LengthUnits.Feet];
};

/**
 * Format a value with its unit suffix for display
 * @param value - The numeric value
 * @param units - The airspeed units
 * @returns Formatted string like "120 kts" or undefined if no value
 */
export const formatAirspeed = (
  value: number | undefined | null,
  units: AirspeedUnits | undefined
): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return `${value} ${getAirspeedUnitLabel(units)}`;
};

/**
 * Format a value with its unit suffix for display
 * @param value - The numeric value
 * @param units - The length units
 * @returns Formatted string like "5500 ft" or undefined if no value
 */
export const formatLength = (
  value: number | undefined | null,
  units: LengthUnits | undefined
): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return `${value} ${getLengthUnitLabel(units)}`;
};

/**
 * Get the vertical rate unit label (fpm is standard, doesn't change with preferences)
 * We keep fpm as-is since it's aviation standard and users expect it
 */
export const getVerticalRateLabel = (): string => 'fpm';

/**
 * Get the fuel flow unit label (gph is standard for US aviation)
 * Fuel units don't change with airspeed/length preferences
 */
export const getFuelFlowLabel = (): string => 'gph';

/**
 * Get the fuel volume unit label
 */
export const getFuelVolumeLabel = (): string => 'gal';
