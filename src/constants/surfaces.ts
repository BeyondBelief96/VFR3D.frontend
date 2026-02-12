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
  /** Violet accent (#8b5cf6) */
  VIOLET_500: '139, 92, 246',
  /** Orange accent (#f97316) */
  ORANGE_500: '249, 115, 22',
  /** Pink accent (#ec4899) */
  PINK_500: '236, 72, 153',
  /** Grape accent (#be4bdb) */
  GRAPE_500: '190, 75, 219',
  /** Teal accent (#14b8a6) */
  TEAL_500: '20, 184, 166',
  /** Warning yellow (#eab308) */
  YELLOW_500: '234, 179, 8',
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
  /** Very subtle card background (slate-800 @ 30%) */
  CARD_SUBTLE: `rgba(${COLOR_RGB.SLATE_800}, 0.3)`,
  /** Nested content areas (slate-900 @ 80%) */
  INSET: `rgba(${COLOR_RGB.SLATE_900}, 0.8)`,
  /** Input field backgrounds (slate-900 @ 80%) */
  INPUT: `rgba(${COLOR_RGB.SLATE_900}, 0.8)`,
  /** Dropdown/popover backgrounds (slate-900 @ 95%) */
  POPOVER: `rgba(${COLOR_RGB.SLATE_900}, 0.95)`,
  /** Glass/frosted panel effect (slate-900 @ 85%) */
  GLASS: `rgba(${COLOR_RGB.SLATE_900}, 0.85)`,
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
  /** Darker inner surface for hover states (slate-900 @ 80%) */
  DARK: `rgba(${COLOR_RGB.SLATE_900}, 0.8)`,
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
} as const;

/**
 * Success/positive background colors
 */
export const SUCCESS_BG = {
  /** Standard success background */
  DEFAULT: `rgba(${COLOR_RGB.GREEN_500}, 0.15)`,
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

/**
 * Yellow accent backgrounds (for oil/warning accents)
 */
export const YELLOW_BG = {
  /** Strong yellow background */
  STRONG: `rgba(${COLOR_RGB.YELLOW_500}, 0.3)`,
} as const;

// =============================================================================
// SHADOW & OVERLAY COLORS
// =============================================================================

/**
 * Shadow and dark overlay colors
 */
export const SHADOW = {
  /** Light shadow */
  LIGHT: `rgba(${COLOR_RGB.BLACK}, 0.3)`,
  /** Subtle shadow */
  SUBTLE: `rgba(${COLOR_RGB.BLACK}, 0.2)`,
  /** Box shadow for elevated cards */
  BOX: `0 25px 50px -12px rgba(${COLOR_RGB.BLACK}, 0.5)`,
  /** Smaller box shadow for hover states */
  BOX_HOVER: `0 8px 25px rgba(${COLOR_RGB.BLACK}, 0.4)`,
} as const;

/**
 * Loading overlay backgrounds
 */
export const OVERLAY = {
  /** Standard loading overlay */
  DEFAULT: `rgba(${COLOR_RGB.SLATE_900}, 0.7)`,
} as const;

/**
 * White-based backgrounds (for dark theme contrasts)
 */
export const WHITE_BG = {
  /** Barely visible white overlay */
  MINIMAL: `rgba(${COLOR_RGB.WHITE}, 0.02)`,
  /** Very faint white overlay */
  FAINT: `rgba(${COLOR_RGB.WHITE}, 0.03)`,
  /** Light white overlay */
  LIGHT: `rgba(${COLOR_RGB.WHITE}, 0.2)`,
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
  VIOLET: `rgba(${COLOR_RGB.VIOLET_500}, 0.4)`,
  /** Cyan glow */
  CYAN: `rgba(${COLOR_RGB.CYAN_500}, 0.4)`,
  /** Orange glow */
  ORANGE: `rgba(${COLOR_RGB.ORANGE_500}, 0.4)`,
  /** Green glow */
  GREEN: `rgba(${COLOR_RGB.GREEN_500}, 0.4)`,
  /** Pink glow */
  PINK: `rgba(${COLOR_RGB.PINK_500}, 0.4)`,
  /** Red glow */
  RED: `rgba(${COLOR_RGB.RED_500}, 0.4)`,
  /** Grape glow */
  GRAPE: `rgba(${COLOR_RGB.GRAPE_500}, 0.4)`,
  /** Teal glow */
  TEAL: `rgba(${COLOR_RGB.TEAL_500}, 0.4)`,
} as const;

// =============================================================================
// CSS VARIABLE REFERENCES - For use in Mantine style props
// =============================================================================

/**
 * Theme color CSS variable references
 * Use these when you need a CSS variable string (not rgba)
 */
export const THEME_COLORS = {
  // --- Primary ---
  PRIMARY: 'var(--mantine-color-vfr3dBlue-5)',
  PRIMARY_DARK: 'var(--mantine-color-vfr3dBlue-6)',

  // --- Status ---
  SUCCESS: 'var(--mantine-color-vfrGreen-5)',
  ERROR: 'var(--mantine-color-ifrRed-5)',
  WARNING: 'var(--mantine-color-warningYellow-5)',
  LIFR_PURPLE: 'var(--mantine-color-lifrPurple-5)',

  // --- Surfaces ---
  SURFACE_3: 'var(--mantine-color-vfr3dSurface-3)',
  SURFACE_4: 'var(--mantine-color-vfr3dSurface-4)',
  SURFACE_7: 'var(--mantine-color-vfr3dSurface-7)',
  SURFACE_8: 'var(--mantine-color-vfr3dSurface-8)',
  SURFACE_9: 'var(--mantine-color-vfr3dSurface-9)',

  // --- Text ---
  TEXT: 'var(--mantine-color-gray-3)',
  TEXT_LIGHT: 'var(--mantine-color-gray-4)',
  TEXT_MUTED: 'var(--mantine-color-gray-5)',
  TEXT_DIMMED: 'var(--mantine-color-dimmed)',
  TEXT_ERROR: 'var(--mantine-color-red-5)',

  // --- Accent Shades ---
  BLUE_3: 'var(--mantine-color-blue-3)',
  BLUE_4: 'var(--mantine-color-blue-4)',
  BLUE_5: 'var(--mantine-color-blue-5)',
  BLUE_6: 'var(--mantine-color-blue-6)',
  CYAN_4: 'var(--mantine-color-cyan-4)',
  CYAN_5: 'var(--mantine-color-cyan-5)',
  CYAN_6: 'var(--mantine-color-cyan-6)',
  TEAL_4: 'var(--mantine-color-teal-4)',
  GRAPE_4: 'var(--mantine-color-grape-4)',
  ORANGE_4: 'var(--mantine-color-orange-4)',
  YELLOW_5: 'var(--mantine-color-yellow-5)',
  YELLOW_6: 'var(--mantine-color-yellow-6)',
  GREEN_6: 'var(--mantine-color-green-6)',
  RED_6: 'var(--mantine-color-red-6)',
  GRAY_6: 'var(--mantine-color-gray-6)',
  DARK_4: 'var(--mantine-color-dark-4)',
  DARK_5: 'var(--mantine-color-dark-5)',

  // --- Sidebar Icon Accents ---
  ICON_PINK: 'var(--mantine-color-pink-5)',
  ICON_ORANGE: 'var(--mantine-color-orange-5)',
  ICON_GRAPE: 'var(--mantine-color-grape-5)',
  ICON_BLUE: 'var(--mantine-color-blue-5)',

  /** @deprecated Use ERROR instead */
  IFR_RED: 'var(--mantine-color-ifrRed-5)',
} as const;

// =============================================================================
// COMPONENT-SPECIFIC STYLES - Common style patterns
// =============================================================================

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
    color: THEME_COLORS.TEXT_LIGHT,
  },
} as const;

/**
 * Common modal styles
 */
export const MODAL_STYLES = {
  header: {
    backgroundColor: THEME_COLORS.SURFACE_8,
    borderBottom: `1px solid ${BORDER.SUBTLE}`,
  },
  body: {
    backgroundColor: THEME_COLORS.SURFACE_8,
  },
  content: {
    backgroundColor: THEME_COLORS.SURFACE_8,
  },
  close: {
    color: THEME_COLORS.TEXT_LIGHT,
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
    backgroundColor: THEME_COLORS.SURFACE_8,
    borderColor: BORDER.DEFAULT,
  },
  option: {
    color: 'white',
    '&[data-selected]': {
      backgroundColor: THEME_COLORS.PRIMARY,
    },
    '&[data-hovered]': {
      backgroundColor: HIGHLIGHT.DEFAULT,
    },
  },
} as const;

/**
 * Common tab component styles
 */
export const TAB_STYLES = {
  list: {
    borderBottomColor: BORDER.DEFAULT,
  },
  tab: {
    color: THEME_COLORS.SURFACE_4,
    fontWeight: 500,
    '&:hover': {
      backgroundColor: HIGHLIGHT.LIGHT,
      color: THEME_COLORS.SURFACE_3,
    },
    '&[data-active]': {
      color: 'white',
    },
  },
} as const;

/**
 * Extended input styles with description and error states
 * For wizard forms and complex input components
 */
export const WIZARD_INPUT_STYLES = {
  input: {
    backgroundColor: SURFACE.INPUT,
    borderColor: BORDER.DEFAULT,
    color: 'white',
    '&:focus': {
      borderColor: BORDER.INPUT_FOCUS,
    },
  },
  label: {
    color: THEME_COLORS.TEXT,
    marginBottom: 4,
  },
  description: {
    color: THEME_COLORS.TEXT_MUTED,
    fontSize: '11px',
  },
  error: {
    color: THEME_COLORS.TEXT_ERROR,
  },
} as const;

/**
 * SegmentedControl component styles
 */
export const SEGMENTED_CONTROL_STYLES = {
  root: {
    backgroundColor: SURFACE.INPUT,
    border: `1px solid ${BORDER.DEFAULT}`,
  },
  label: {
    color: THEME_COLORS.TEXT_LIGHT,
    '&[data-active]': {
      color: 'white',
    },
  },
} as const;

/**
 * Gradient backgrounds
 */
export const GRADIENT = {
  /** Blue to cyan tip/info gradient */
  TIP: `linear-gradient(135deg, ${HIGHLIGHT.LIGHT}, ${CYAN_BG.SUBTLE})`,
  /** Blue to cyan icon background gradient */
  ICON: `linear-gradient(135deg, ${HIGHLIGHT.DEFAULT} 0%, ${CYAN_BG.DEFAULT} 100%)`,
} as const;

/**
 * Compact input styles for loading station inputs
 */
export const STATION_INPUT_STYLES = {
  input: {
    backgroundColor: SURFACE.INPUT,
    borderColor: BORDER.DEFAULT,
    color: 'white',
    '&:focus': {
      borderColor: BORDER.INPUT_FOCUS,
    },
  },
  label: {
    color: THEME_COLORS.TEXT_LIGHT,
    marginBottom: 4,
    fontSize: '12px',
  },
} as const;
