/**
 * Standardized color constants for the VFR3D application.
 * These constants use Mantine theme color references for consistency.
 *
 * Color Reference (use with Mantine props like `c="vfrGreen.5"`):
 * - vfr3dBlue: Primary blue (#3b82f6 at shade 5)
 * - vfrGreen: VFR green (#22c55e at shade 5)
 * - ifrRed: IFR red (#ef4444 at shade 5)
 * - lifrPurple: LIFR purple (#a855f7 at shade 5)
 * - warningYellow: Warning amber (#fbbf24 at shade 5)
 * - vfr3dSurface: Slate surface colors
 */

// =============================================================================
// SEMANTIC COLORS - Use these for specific data types/concepts
// These return Mantine color names for use with Mantine props (c=, bg=, etc.)
// =============================================================================

/**
 * Colors for flight metrics and data types
 * Use with Mantine props: <Text c={METRIC_COLORS.DISTANCE}>
 */
export const METRIC_COLORS = {
  /** Distance, navigation, route-related metrics */
  DISTANCE: 'blue.4',
  /** Time, duration, ETA-related metrics */
  TIME: 'cyan.4',
  /** Fuel consumption, fuel levels */
  FUEL: 'teal.4',
  /** Wind speed, wind component */
  WIND: 'grape.4',
  /** Temperature */
  TEMPERATURE: 'orange.4',
  /** Altitude, elevation */
  ALTITUDE: 'indigo.4',
  /** Heading, course, bearing */
  HEADING: 'violet.4',
  /** Speed, velocity */
  SPEED: 'pink.4',
} as const;

/**
 * Colors for status indicators
 * Use with Mantine props: <Badge color={STATUS_COLORS.SUCCESS}>
 */
export const STATUS_COLORS = {
  /** Success, within limits, favorable conditions */
  SUCCESS: 'vfrGreen.5',
  /** Warning, caution, approaching limits */
  WARNING: 'warningYellow.5',
  /** Error, critical, outside limits */
  ERROR: 'ifrRed.5',
  /** Informational, neutral */
  INFO: 'vfr3dBlue.5',
} as const;

/**
 * Colors for flight phases/points
 */
export const FLIGHT_POINT_COLORS = {
  /** Departure airport/point */
  DEPARTURE: 'vfrGreen.4',
  /** Destination/arrival airport/point */
  DESTINATION: 'vfr3dBlue.4',
  /** Waypoint/intermediate point */
  WAYPOINT: 'cyan.4',
  /** Current position */
  CURRENT: 'warningYellow.4',
} as const;

/**
 * Colors for wind conditions (contextual - based on favorability)
 */
export const WIND_CONDITION_COLORS = {
  /** Favorable wind (headwind for landing, tailwind for cruise efficiency awareness) */
  FAVORABLE: 'vfrGreen.5',
  /** Unfavorable wind */
  UNFAVORABLE: 'ifrRed.5',
  /** Neutral/calm wind */
  NEUTRAL: 'grape.4',
} as const;

/**
 * Colors for crosswind severity
 * These are Mantine color names for use with color prop
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
  LOW: 'warningYellow.4',
  /** Critical fuel level */
  CRITICAL: 'ifrRed.4',
} as const;

/**
 * Colors for flight categories (VFR, MVFR, IFR, LIFR)
 * These use custom theme colors for proper Mantine integration
 */
export const FLIGHT_CATEGORY_COLORS = {
  VFR: 'vfrGreen',
  MVFR: 'blue',
  IFR: 'ifrRed',
  LIFR: 'lifrPurple',
} as const;

/**
 * Flight category colors with shade (for more specific usage)
 */
export const FLIGHT_CATEGORY_COLORS_SHADED = {
  VFR: 'vfrGreen.5',
  MVFR: 'blue.5',
  IFR: 'ifrRed.5',
  LIFR: 'lifrPurple.5',
} as const;

/**
 * Colors for Weight & Balance status
 */
export const WEIGHT_BALANCE_COLORS = {
  /** Within CG envelope */
  WITHIN_ENVELOPE: 'vfrGreen.5',
  /** Outside CG envelope */
  OUTSIDE_ENVELOPE: 'ifrRed.5',
  /** Takeoff condition indicator */
  TAKEOFF: 'vfrGreen.5',
  /** Landing condition indicator */
  LANDING: 'vfr3dBlue.5',
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
 * Get a Mantine CSS variable for icon background with alpha
 * Use this for inline styles where CSS variables are needed
 */
export const getIconBgColor = (baseColor: string, opacity = ICON_BG_OPACITY): string => {
  // Map color names to Mantine CSS variable format
  // The alpha value is expressed as a percentage (0-100)
  const alphaPercent = Math.round(opacity * 100);

  // For custom theme colors, we need to reference them differently
  const customColors = ['vfr3dBlue', 'vfrGreen', 'ifrRed', 'lifrPurple', 'warningYellow', 'vfr3dSurface'];

  if (customColors.includes(baseColor)) {
    // Custom colors use var(--mantine-color-{colorName}-5)
    // For alpha, we use rgba with the color value
    return `color-mix(in srgb, var(--mantine-color-${baseColor}-5) ${alphaPercent}%, transparent)`;
  }

  // Standard Mantine colors
  return `color-mix(in srgb, var(--mantine-color-${baseColor}-5) ${alphaPercent}%, transparent)`;
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the appropriate Mantine color for a fuel status
 * Returns a Mantine color string for use with color props
 */
export const getFuelStatusColor = (remainingGallons: number, warningThreshold = 10): string => {
  if (remainingGallons < 0) return FUEL_STATUS_COLORS.CRITICAL;
  if (remainingGallons < warningThreshold) return FUEL_STATUS_COLORS.LOW;
  return FUEL_STATUS_COLORS.NORMAL;
};

/**
 * Get the appropriate Mantine color for wind component (headwind vs tailwind)
 * Headwind is generally unfavorable (slows you down), tailwind is favorable
 */
export const getWindComponentColor = (headwindComponent: number): string => {
  // Positive = headwind (unfavorable), Negative = tailwind (favorable)
  return headwindComponent >= 0
    ? WIND_CONDITION_COLORS.UNFAVORABLE
    : WIND_CONDITION_COLORS.FAVORABLE;
};

/**
 * Get the appropriate Mantine color for crosswind severity
 */
export const getCrosswindColor = (crosswindKnots: number): string => {
  if (crosswindKnots <= 10) return CROSSWIND_COLORS.SAFE;
  if (crosswindKnots <= 15) return CROSSWIND_COLORS.CAUTION;
  return CROSSWIND_COLORS.STRONG;
};

/**
 * Get flight category Mantine color
 */
export const getFlightCategoryColor = (category?: string): string => {
  switch (category) {
    case 'VFR':
      return FLIGHT_CATEGORY_COLORS.VFR;
    case 'MVFR':
      return FLIGHT_CATEGORY_COLORS.MVFR;
    case 'IFR':
      return FLIGHT_CATEGORY_COLORS.IFR;
    case 'LIFR':
      return FLIGHT_CATEGORY_COLORS.LIFR;
    default:
      return 'gray';
  }
};

/**
 * Get flight category color with shade for more specific usage
 */
export const getFlightCategoryColorShaded = (category?: string): string => {
  switch (category) {
    case 'VFR':
      return FLIGHT_CATEGORY_COLORS_SHADED.VFR;
    case 'MVFR':
      return FLIGHT_CATEGORY_COLORS_SHADED.MVFR;
    case 'IFR':
      return FLIGHT_CATEGORY_COLORS_SHADED.IFR;
    case 'LIFR':
      return FLIGHT_CATEGORY_COLORS_SHADED.LIFR;
    default:
      return 'gray.5';
  }
};
