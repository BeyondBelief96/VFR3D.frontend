/**
 * Standardized color constants for the VFR3D application.
 * Use these constants to ensure consistent coloring across all components.
 */

// =============================================================================
// SEMANTIC COLORS - Use these for specific data types/concepts
// =============================================================================

/**
 * Colors for flight metrics and data types
 */
export const METRIC_COLORS = {
  /** Distance, navigation, route-related metrics */
  DISTANCE: 'var(--mantine-color-blue-4)',
  /** Time, duration, ETA-related metrics */
  TIME: 'var(--mantine-color-cyan-4)',
  /** Fuel consumption, fuel levels */
  FUEL: 'var(--mantine-color-teal-4)',
  /** Wind speed, wind component */
  WIND: 'var(--mantine-color-grape-4)',
  /** Temperature */
  TEMPERATURE: 'var(--mantine-color-orange-4)',
  /** Altitude, elevation */
  ALTITUDE: 'var(--mantine-color-indigo-4)',
  /** Heading, course, bearing */
  HEADING: 'var(--mantine-color-violet-4)',
  /** Speed, velocity */
  SPEED: 'var(--mantine-color-pink-4)',
} as const;

/**
 * Colors for status indicators
 */
export const STATUS_COLORS = {
  /** Success, within limits, favorable conditions */
  SUCCESS: 'var(--mantine-color-green-5)',
  SUCCESS_HEX: '#22c55e',
  /** Warning, caution, approaching limits */
  WARNING: 'var(--mantine-color-yellow-5)',
  WARNING_HEX: '#fbbf24',
  /** Error, critical, outside limits */
  ERROR: 'var(--mantine-color-red-5)',
  ERROR_HEX: '#ef4444',
  /** Informational, neutral */
  INFO: 'var(--mantine-color-blue-5)',
  INFO_HEX: '#3b82f6',
} as const;

/**
 * Colors for flight phases/points
 */
export const FLIGHT_POINT_COLORS = {
  /** Departure airport/point */
  DEPARTURE: 'var(--mantine-color-green-4)',
  /** Destination/arrival airport/point */
  DESTINATION: 'var(--mantine-color-blue-4)',
  /** Waypoint/intermediate point */
  WAYPOINT: 'var(--mantine-color-cyan-4)',
  /** Current position */
  CURRENT: 'var(--mantine-color-yellow-4)',
} as const;

/**
 * Colors for wind conditions (contextual - based on favorability)
 */
export const WIND_CONDITION_COLORS = {
  /** Favorable wind (headwind for landing, tailwind for cruise efficiency awareness) */
  FAVORABLE: 'var(--mantine-color-green-5)',
  FAVORABLE_HEX: '#22c55e',
  /** Unfavorable wind */
  UNFAVORABLE: 'var(--mantine-color-red-5)',
  UNFAVORABLE_HEX: '#ef4444',
  /** Neutral/calm wind */
  NEUTRAL: 'var(--mantine-color-grape-4)',
} as const;

/**
 * Colors for crosswind severity
 */
export const CROSSWIND_COLORS = {
  /** Safe crosswind (≤10 knots) */
  SAFE: 'green',
  /** Caution crosswind (10-15 knots) */
  CAUTION: 'yellow',
  /** Strong crosswind (>15 knots) */
  STRONG: 'red',
} as const;

/**
 * Colors for fuel status
 */
export const FUEL_STATUS_COLORS = {
  /** Normal fuel levels */
  NORMAL: 'white',
  /** Low fuel warning */
  LOW: 'var(--mantine-color-yellow-4)',
  LOW_HEX: '#fbbf24',
  /** Critical fuel level */
  CRITICAL: 'var(--mantine-color-red-4)',
  CRITICAL_HEX: '#ef4444',
} as const;

/**
 * Colors for flight categories (VFR, MVFR, IFR, LIFR)
 */
export const FLIGHT_CATEGORY_COLORS = {
  VFR: 'green',
  MVFR: 'blue',
  IFR: 'red',
  LIFR: 'grape',
} as const;

/**
 * Colors for Weight & Balance status
 */
export const WEIGHT_BALANCE_COLORS = {
  /** Within CG envelope */
  WITHIN_ENVELOPE: 'var(--mantine-color-green-5)',
  WITHIN_ENVELOPE_HEX: '#22c55e',
  /** Outside CG envelope */
  OUTSIDE_ENVELOPE: 'var(--mantine-color-red-5)',
  OUTSIDE_ENVELOPE_HEX: '#ef4444',
  /** Takeoff condition indicator */
  TAKEOFF: 'var(--mantine-color-green-5)',
  /** Landing condition indicator */
  LANDING: 'var(--mantine-color-blue-5)',
} as const;

// =============================================================================
// CATEGORY COLORS - Use for categorizing/grouping items
// =============================================================================

export const CATEGORY_COLORS = {
  /** Aircraft-related items */
  AIRCRAFT: 'blue',
  /** Performance-related items */
  PERFORMANCE: 'teal',
  /** Appearance/visual items */
  APPEARANCE: 'grape',
  /** Settings/configuration items */
  SETTINGS: 'gray',
  /** Weather-related items */
  WEATHER: 'cyan',
} as const;

// =============================================================================
// ICON BACKGROUND COLORS - For circular icon containers
// =============================================================================

/**
 * Standard opacity for icon backgrounds
 */
export const ICON_BG_OPACITY = 0.15;

/**
 * Get an rgba background color for an icon container
 */
export const getIconBgColor = (baseColor: string, opacity = ICON_BG_OPACITY): string => {
  // Common color mappings to RGB values
  const colorMap: Record<string, string> = {
    blue: '59, 130, 246',
    cyan: '6, 182, 212',
    teal: '20, 184, 166',
    grape: '168, 85, 247',
    green: '34, 197, 94',
    red: '239, 68, 68',
    yellow: '251, 191, 36',
    orange: '251, 146, 60',
    indigo: '99, 102, 241',
    violet: '139, 92, 246',
    pink: '236, 72, 153',
  };

  const rgb = colorMap[baseColor] || '59, 130, 246'; // Default to blue
  return `rgba(${rgb}, ${opacity})`;
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the appropriate color for a fuel status
 */
export const getFuelStatusColor = (remainingGallons: number, warningThreshold = 10): string => {
  if (remainingGallons < 0) return FUEL_STATUS_COLORS.CRITICAL_HEX;
  if (remainingGallons < warningThreshold) return FUEL_STATUS_COLORS.LOW_HEX;
  return FUEL_STATUS_COLORS.NORMAL;
};

/**
 * Get the appropriate color for wind component (headwind vs tailwind)
 * Headwind is generally unfavorable (slows you down), tailwind is favorable
 */
export const getWindComponentColor = (headwindComponent: number): string => {
  // Positive = headwind (unfavorable), Negative = tailwind (favorable)
  return headwindComponent >= 0
    ? WIND_CONDITION_COLORS.UNFAVORABLE_HEX
    : WIND_CONDITION_COLORS.FAVORABLE_HEX;
};

/**
 * Get the appropriate color for crosswind severity
 */
export const getCrosswindColor = (crosswindKnots: number): string => {
  if (crosswindKnots <= 10) return CROSSWIND_COLORS.SAFE;
  if (crosswindKnots <= 15) return CROSSWIND_COLORS.CAUTION;
  return CROSSWIND_COLORS.STRONG;
};

/**
 * Get flight category color
 */
export const getFlightCategoryColor = (category?: string): string => {
  switch (category) {
    case 'VFR': return FLIGHT_CATEGORY_COLORS.VFR;
    case 'MVFR': return FLIGHT_CATEGORY_COLORS.MVFR;
    case 'IFR': return FLIGHT_CATEGORY_COLORS.IFR;
    case 'LIFR': return FLIGHT_CATEGORY_COLORS.LIFR;
    default: return 'gray';
  }
};
