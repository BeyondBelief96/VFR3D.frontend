/**
 * Surface and Background Color Constants for VFR3D
 *
 * This file centralizes all surface colors, backgrounds, borders, and overlays.
 * Use these constants instead of inline rgba() or CSS variable strings.
 *
 * COLOR PHILOSOPHY:
 * - Dark blue-slate theme (#0f172a base)
 * - Layered surfaces with increasing lightness for elevation
 * - Consistent opacity patterns for borders and overlays
 */

// =============================================================================
// BASE COLOR VALUES (RGB only - use with opacity patterns below)
// =============================================================================

/**
 * Core color RGB values - use these with OPACITY patterns
 * These are the raw RGB values that define our color palette
 */
export const COLOR_RGB = {
  /** Deepest dark blue - slate-900 (#0f172a) */
  SLATE_900: '15, 23, 42',
  /** Card/surface dark - slate-800 (#1e293b) */
  SLATE_800: '30, 41, 59',
  /** Elevated surface - slate-700 (#334155) */
  SLATE_700: '51, 65, 85',
  /** Border/muted - slate-400 (#94a3b8) */
  SLATE_400: '148, 163, 184',
  /** Primary blue (#3b82f6) */
  BLUE_500: '59, 130, 246',
  /** Error red (#ef4444) */
  RED_500: '239, 68, 68',
  /** Cyan accent (#06b6d4) */
  CYAN_500: '6, 182, 212',
  /** Warning amber (#fbbf24) */
  AMBER_500: '251, 191, 36',
  /** Success green (#22c55e) */
  GREEN_500: '34, 197, 94',
  /** White for light borders */
  WHITE: '255, 255, 255',
  /** Black for shadows */
  BLACK: '0, 0, 0',
} as const;

// =============================================================================
// SURFACE COLORS - Card and Panel Backgrounds
// =============================================================================

/**
 * Surface background colors for cards, panels, and containers
 * Use for: Card, Paper, Box backgrounds
 */
export const SURFACE = {
  /** Deepest background - page/app background (slate-900 @ 95%) */
  BASE: `rgba(${COLOR_RGB.SLATE_900}, 0.95)`,
  /** Primary card background (slate-800 @ 80%) */
  CARD: `rgba(${COLOR_RGB.SLATE_800}, 0.8)`,
  /** Elevated card/hover state (slate-800 @ 60%) */
  CARD_HOVER: `rgba(${COLOR_RGB.SLATE_800}, 0.6)`,
  /** Nested content areas (slate-900 @ 80%) */
  INSET: `rgba(${COLOR_RGB.SLATE_900}, 0.8)`,
  /** Input field backgrounds (slate-900 @ 80%) */
  INPUT: `rgba(${COLOR_RGB.SLATE_900}, 0.8)`,
  /** Dropdown/popover backgrounds (slate-900 @ 95%) */
  POPOVER: `rgba(${COLOR_RGB.SLATE_900}, 0.95)`,
  /** Glass/frosted panel effect (slate-900 @ 85%) */
  GLASS: `rgba(${COLOR_RGB.SLATE_900}, 0.85)`,
  /** Modal backdrop overlay */
  MODAL_BACKDROP: `rgba(${COLOR_RGB.BLACK}, 0.5)`,
} as const;

/**
 * Nested/inner surface colors - for content within cards
 */
export const SURFACE_INNER = {
  /** Content area within card (slate-900 @ 50%) */
  DEFAULT: `rgba(${COLOR_RGB.SLATE_900}, 0.5)`,
  /** Lighter inner surface (slate-900 @ 40%) */
  LIGHT: `rgba(${COLOR_RGB.SLATE_900}, 0.4)`,
  /** Section dividers within cards (slate-900 @ 60%) */
  SECTION: `rgba(${COLOR_RGB.SLATE_900}, 0.6)`,
} as const;

// =============================================================================
// BORDER COLORS - Dividers and Outlines
// =============================================================================

/**
 * Border colors for cards, inputs, and dividers
 * Slate-400 based with varying opacity
 */
export const BORDER = {
  /** Standard border (most common) */
  DEFAULT: `rgba(${COLOR_RGB.SLATE_400}, 0.2)`,
  /** Subtle/light border */
  SUBTLE: `rgba(${COLOR_RGB.SLATE_400}, 0.1)`,
  /** Strong/emphasized border */
  STRONG: `rgba(${COLOR_RGB.SLATE_400}, 0.3)`,
  /** Card outline */
  CARD: `rgba(${COLOR_RGB.SLATE_400}, 0.15)`,
  /** Input field border */
  INPUT: `rgba(${COLOR_RGB.SLATE_400}, 0.2)`,
  /** Focused input border - use theme color instead */
  INPUT_FOCUS: 'var(--mantine-color-vfr3dBlue-5)',
  /** White-based separator (for very dark backgrounds) */
  LIGHT: `rgba(${COLOR_RGB.WHITE}, 0.1)`,
  /** Minimal separator */
  MINIMAL: `rgba(${COLOR_RGB.WHITE}, 0.05)`,
} as const;

// =============================================================================
// HIGHLIGHT COLORS - Interactive & Selection States
// =============================================================================

/**
 * Blue highlight colors for selected/active states
 */
export const HIGHLIGHT = {
  /** Strong selection highlight */
  STRONG: `rgba(${COLOR_RGB.BLUE_500}, 0.3)`,
  /** Standard selection (hover states) */
  DEFAULT: `rgba(${COLOR_RGB.BLUE_500}, 0.2)`,
  /** Subtle selection (backgrounds) */
  SUBTLE: `rgba(${COLOR_RGB.BLUE_500}, 0.15)`,
  /** Very light highlight */
  LIGHT: `rgba(${COLOR_RGB.BLUE_500}, 0.1)`,
  /** Icon background circle */
  ICON_BG: `rgba(${COLOR_RGB.BLUE_500}, 0.15)`,
} as const;

// =============================================================================
// STATUS BACKGROUND COLORS - Error, Warning, Success States
// =============================================================================

/**
 * Error/danger background colors
 */
export const ERROR_BG = {
  /** Strong error background */
  STRONG: `rgba(${COLOR_RGB.RED_500}, 0.3)`,
  /** Standard error row/highlight */
  DEFAULT: `rgba(${COLOR_RGB.RED_500}, 0.25)`,
  /** Subtle error background */
  SUBTLE: `rgba(${COLOR_RGB.RED_500}, 0.2)`,
  /** Very light error tint */
  LIGHT: `rgba(${COLOR_RGB.RED_500}, 0.1)`,
} as const;

/**
 * Warning/caution background colors
 */
export const WARNING_BG = {
  /** Standard warning highlight */
  DEFAULT: `rgba(${COLOR_RGB.AMBER_500}, 0.15)`,
  /** Subtle warning tint */
  SUBTLE: `rgba(${COLOR_RGB.AMBER_500}, 0.1)`,
} as const;

/**
 * Success/positive background colors
 */
export const SUCCESS_BG = {
  /** Standard success background */
  DEFAULT: `rgba(${COLOR_RGB.GREEN_500}, 0.15)`,
  /** Subtle success tint */
  SUBTLE: `rgba(${COLOR_RGB.GREEN_500}, 0.1)`,
} as const;

/**
 * Cyan/info accent backgrounds
 */
export const CYAN_BG = {
  /** Strong cyan background */
  STRONG: `rgba(${COLOR_RGB.CYAN_500}, 0.3)`,
  /** Standard cyan background */
  DEFAULT: `rgba(${COLOR_RGB.CYAN_500}, 0.2)`,
  /** Subtle cyan tint */
  SUBTLE: `rgba(${COLOR_RGB.CYAN_500}, 0.1)`,
} as const;

// =============================================================================
// SHADOW & OVERLAY COLORS
// =============================================================================

/**
 * Shadow and dark overlay colors
 */
export const SHADOW = {
  /** Heavy shadow/overlay */
  HEAVY: `rgba(${COLOR_RGB.BLACK}, 0.5)`,
  /** Medium shadow */
  MEDIUM: `rgba(${COLOR_RGB.BLACK}, 0.4)`,
  /** Light shadow */
  LIGHT: `rgba(${COLOR_RGB.BLACK}, 0.3)`,
  /** Subtle shadow */
  SUBTLE: `rgba(${COLOR_RGB.BLACK}, 0.2)`,
} as const;

// =============================================================================
// ICON BACKGROUNDS - Circular icon containers
// =============================================================================

/**
 * Icon background colors for circular icon containers
 * Use for ThemeIcon-like circular backgrounds
 */
export const ICON_BG = {
  /** Blue icon background */
  BLUE: `rgba(${COLOR_RGB.BLUE_500}, 0.15)`,
  /** Red icon background */
  RED: `rgba(${COLOR_RGB.RED_500}, 0.15)`,
  /** Green icon background */
  GREEN: `rgba(${COLOR_RGB.GREEN_500}, 0.15)`,
  /** Cyan icon background */
  CYAN: `rgba(${COLOR_RGB.CYAN_500}, 0.15)`,
  /** Amber icon background */
  AMBER: `rgba(${COLOR_RGB.AMBER_500}, 0.15)`,
  /** Neutral/gray icon background */
  NEUTRAL: `rgba(${COLOR_RGB.SLATE_400}, 0.1)`,
  /** Icon background at 10% opacity (for larger containers) */
  BLUE_LIGHT: `rgba(${COLOR_RGB.BLUE_500}, 0.1)`,
} as const;

// =============================================================================
// GLOW COLORS - Card hover/accent glow effects
// =============================================================================

/**
 * Glow effect colors for card hover states and accent highlights
 * Used with CSS custom properties: style={{ '--card-glow-color': GLOW.BLUE }}
 */
export const GLOW = {
  /** Blue glow */
  BLUE: `rgba(${COLOR_RGB.BLUE_500}, 0.4)`,
  /** Violet glow */
  VIOLET: 'rgba(139, 92, 246, 0.4)',
  /** Cyan glow */
  CYAN: `rgba(${COLOR_RGB.CYAN_500}, 0.4)`,
  /** Orange glow */
  ORANGE: 'rgba(249, 115, 22, 0.4)',
  /** Green glow */
  GREEN: `rgba(${COLOR_RGB.GREEN_500}, 0.4)`,
  /** Pink glow */
  PINK: 'rgba(236, 72, 153, 0.4)',
  /** Red glow */
  RED: `rgba(${COLOR_RGB.RED_500}, 0.4)`,
  /** Grape glow */
  GRAPE: 'rgba(190, 75, 219, 0.4)',
  /** Teal glow */
  TEAL: 'rgba(20, 184, 166, 0.4)',
} as const;

// =============================================================================
// COMPONENT-SPECIFIC STYLES - Common style patterns
// =============================================================================

/**
 * Common card styles - use spread operator: { ...CARD_STYLES.DEFAULT }
 */
export const CARD_STYLES = {
  /** Standard card with background and border */
  DEFAULT: {
    backgroundColor: SURFACE.CARD,
    border: `1px solid ${BORDER.CARD}`,
  },
  /** Card with hover interaction */
  INTERACTIVE: {
    backgroundColor: SURFACE.CARD,
    border: `1px solid ${BORDER.CARD}`,
    transition: 'all 0.2s ease',
  },
  /** Inset/nested card */
  INSET: {
    backgroundColor: SURFACE_INNER.DEFAULT,
    borderRadius: 'var(--mantine-radius-md)',
  },
  /** Selected/highlighted card */
  SELECTED: {
    backgroundColor: HIGHLIGHT.SUBTLE,
    border: `2px solid var(--mantine-color-vfr3dBlue-5)`,
  },
} as const;

/**
 * Common input field styles
 */
export const INPUT_STYLES = {
  input: {
    backgroundColor: SURFACE.INPUT,
    borderColor: BORDER.INPUT,
    color: 'white',
    '&:focus': {
      borderColor: BORDER.INPUT_FOCUS,
    },
  },
  label: {
    color: 'var(--mantine-color-gray-4)',
  },
} as const;

/**
 * Common modal styles
 */
export const MODAL_STYLES = {
  header: {
    backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
    borderBottom: `1px solid ${BORDER.SUBTLE}`,
  },
  body: {
    backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
  },
  content: {
    backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
  },
  close: {
    color: 'var(--mantine-color-gray-4)',
    '&:hover': {
      backgroundColor: HIGHLIGHT.LIGHT,
    },
  },
} as const;

/**
 * Common select/dropdown styles
 */
export const SELECT_STYLES = {
  ...INPUT_STYLES,
  dropdown: {
    backgroundColor: 'var(--mantine-color-vfr3dSurface-8)',
    borderColor: BORDER.DEFAULT,
  },
  option: {
    color: 'white',
    '&[data-selected]': {
      backgroundColor: 'var(--mantine-color-vfr3dBlue-5)',
    },
    '&[data-hovered]': {
      backgroundColor: HIGHLIGHT.DEFAULT,
    },
  },
} as const;

// =============================================================================
// CSS VARIABLE REFERENCES - For use in Mantine style props
// =============================================================================

/**
 * Theme color CSS variable references
 * Use these when you need a CSS variable string (not rgba)
 */
export const THEME_COLORS = {
  /** Primary blue */
  PRIMARY: 'var(--mantine-color-vfr3dBlue-5)',
  PRIMARY_DARK: 'var(--mantine-color-vfr3dBlue-6)',
  /** Surface colors from theme */
  SURFACE_7: 'var(--mantine-color-vfr3dSurface-7)',
  SURFACE_8: 'var(--mantine-color-vfr3dSurface-8)',
  SURFACE_9: 'var(--mantine-color-vfr3dSurface-9)',
  /** Status colors */
  SUCCESS: 'var(--mantine-color-vfrGreen-5)',
  ERROR: 'var(--mantine-color-ifrRed-5)',
  WARNING: 'var(--mantine-color-warningYellow-5)',
  /** Text colors */
  TEXT: 'var(--mantine-color-gray-3)',
  TEXT_MUTED: 'var(--mantine-color-gray-5)',
  TEXT_DIMMED: 'var(--mantine-color-dimmed)',
} as const;
