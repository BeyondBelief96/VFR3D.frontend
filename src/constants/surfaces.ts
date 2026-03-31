/**
 * Surface and Background Color Constants — Defense / C2 Aesthetic
 *
 * Near-black backgrounds, thin 1px borders, no shadows, no gradients.
 * Flat and clinical. Every pixel earns its place.
 *
 * COLOR PALETTE:
 * - Backgrounds: #0A0C10, #0D1117
 * - Panels: #141922, #1B2130
 * - Borders: #1E2633
 * - Accent: #4A9EFF (electric blue)
 * - Text: #D1D5DB (primary), #8892A0 (secondary)
 */

// =============================================================================
// BASE COLOR VALUES (RGB only — use with opacity patterns below)
// =============================================================================

export const COLOR_RGB = {
  /** Deepest black — #0A0C10 */
  SLATE_900: '10, 12, 16',
  /** Main surface — #0D1117 */
  SLATE_800: '13, 17, 23',
  /** Elevated panel — #141922 */
  SLATE_700: '20, 25, 34',
  /** Muted text — #8892A0 */
  SLATE_400: '136, 146, 160',
  /** Electric blue accent — #4A9EFF */
  BLUE_500: '74, 158, 255',
  /** Critical red — #C94040 */
  RED_500: '201, 64, 64',
  /** Cyan accent — #06b6d4 */
  CYAN_500: '6, 182, 212',
  /** Warning amber — #D4A04A */
  AMBER_500: '212, 160, 74',
  /** Operational green — #2EA043 */
  GREEN_500: '46, 160, 67',
  /** Violet accent — #9066D6 */
  VIOLET_500: '144, 102, 214',
  /** Orange accent — #D4862E */
  ORANGE_500: '212, 134, 46',
  /** Pink accent — #C8508C */
  PINK_500: '200, 80, 140',
  /** Grape accent — #9066D6 */
  GRAPE_500: '144, 102, 214',
  /** Teal accent — #14b8a6 */
  TEAL_500: '20, 184, 166',
  /** Yellow/amber — #D4A04A */
  YELLOW_500: '212, 160, 74',
  /** White */
  WHITE: '255, 255, 255',
  /** Black */
  BLACK: '0, 0, 0',
} as const;

// =============================================================================
// SURFACE COLORS — Panel and Container Backgrounds
// =============================================================================

export const SURFACE = {
  /** Deepest background — page/app level */
  BASE: '#0A0C10',
  /** Primary panel background */
  CARD: `rgba(${COLOR_RGB.SLATE_800}, 0.95)`,
  /** Panel hover — barely perceptible shift */
  CARD_HOVER: `rgba(${COLOR_RGB.SLATE_700}, 0.8)`,
  /** Subtle panel */
  CARD_SUBTLE: `rgba(${COLOR_RGB.SLATE_800}, 0.5)`,
  /** Inset/nested content area */
  INSET: `rgba(${COLOR_RGB.SLATE_900}, 0.9)`,
  /** Input backgrounds — transparent for bottom-border style */
  INPUT: 'transparent',
  /** Dropdown/popover — near-opaque dark */
  POPOVER: `rgba(${COLOR_RGB.SLATE_900}, 0.98)`,
  /** Header/nav panel — solid dark */
  GLASS: '#0D1117',
} as const;

export const SURFACE_INNER = {
  /** Content area within panel */
  DEFAULT: `rgba(${COLOR_RGB.SLATE_900}, 0.6)`,
  /** Lighter inner surface */
  LIGHT: `rgba(${COLOR_RGB.SLATE_900}, 0.4)`,
  /** Section divider */
  SECTION: `rgba(${COLOR_RGB.SLATE_900}, 0.7)`,
  /** Darker inner surface */
  DARK: `rgba(${COLOR_RGB.SLATE_900}, 0.85)`,
} as const;

// =============================================================================
// BORDER COLORS — Thin 1px separators (#1E2633)
// =============================================================================

export const BORDER = {
  /** Standard border — #1E2633 */
  DEFAULT: '#1E2633',
  /** Subtle border */
  SUBTLE: `rgba(${COLOR_RGB.SLATE_400}, 0.08)`,
  /** Emphasized border */
  STRONG: `rgba(${COLOR_RGB.SLATE_400}, 0.2)`,
  /** Panel outline */
  CARD: '#1E2633',
  /** Input bottom-border */
  INPUT: '#1E2633',
  /** Focused input — electric blue accent */
  INPUT_FOCUS: '#4A9EFF',
  /** Light separator (very dark backgrounds) */
  LIGHT: `rgba(${COLOR_RGB.WHITE}, 0.06)`,
  /** Minimal separator */
  MINIMAL: `rgba(${COLOR_RGB.WHITE}, 0.03)`,
} as const;

// =============================================================================
// HIGHLIGHT COLORS — Barely-perceptible selection states
// =============================================================================

export const HIGHLIGHT = {
  /** Strong selection */
  STRONG: `rgba(${COLOR_RGB.BLUE_500}, 0.15)`,
  /** Standard hover */
  DEFAULT: `rgba(${COLOR_RGB.BLUE_500}, 0.08)`,
  /** Subtle background */
  SUBTLE: `rgba(${COLOR_RGB.BLUE_500}, 0.05)`,
  /** Barely visible */
  LIGHT: `rgba(${COLOR_RGB.BLUE_500}, 0.03)`,
} as const;

// =============================================================================
// STATUS BACKGROUNDS — Restrained, functional
// =============================================================================

export const ERROR_BG = {
  STRONG: `rgba(${COLOR_RGB.RED_500}, 0.2)`,
  DEFAULT: `rgba(${COLOR_RGB.RED_500}, 0.12)`,
  SUBTLE: `rgba(${COLOR_RGB.RED_500}, 0.08)`,
  LIGHT: `rgba(${COLOR_RGB.RED_500}, 0.04)`,
} as const;

export const WARNING_BG = {
  DEFAULT: `rgba(${COLOR_RGB.AMBER_500}, 0.1)`,
} as const;

export const SUCCESS_BG = {
  DEFAULT: `rgba(${COLOR_RGB.GREEN_500}, 0.1)`,
} as const;

export const CYAN_BG = {
  STRONG: `rgba(${COLOR_RGB.CYAN_500}, 0.15)`,
  DEFAULT: `rgba(${COLOR_RGB.CYAN_500}, 0.1)`,
  SUBTLE: `rgba(${COLOR_RGB.CYAN_500}, 0.05)`,
} as const;

export const YELLOW_BG = {
  STRONG: `rgba(${COLOR_RGB.YELLOW_500}, 0.15)`,
} as const;

// =============================================================================
// SHADOW & OVERLAY — No decorative shadows. Flat and clinical.
// =============================================================================

export const SHADOW = {
  LIGHT: 'none',
  SUBTLE: 'none',
  BOX: 'none',
  BOX_HOVER: 'none',
} as const;

export const OVERLAY = {
  DEFAULT: `rgba(${COLOR_RGB.SLATE_900}, 0.8)`,
} as const;

export const WHITE_BG = {
  MINIMAL: `rgba(${COLOR_RGB.WHITE}, 0.02)`,
  FAINT: `rgba(${COLOR_RGB.WHITE}, 0.03)`,
  LIGHT: `rgba(${COLOR_RGB.WHITE}, 0.08)`,
} as const;

// =============================================================================
// ICON BACKGROUNDS — Restrained circular containers
// =============================================================================

export const ICON_BG = {
  BLUE: `rgba(${COLOR_RGB.BLUE_500}, 0.1)`,
  RED: `rgba(${COLOR_RGB.RED_500}, 0.1)`,
  GREEN: `rgba(${COLOR_RGB.GREEN_500}, 0.1)`,
  NEUTRAL: `rgba(${COLOR_RGB.SLATE_400}, 0.06)`,
  BLUE_LIGHT: `rgba(${COLOR_RGB.BLUE_500}, 0.06)`,
} as const;

// =============================================================================
// GLOW — Minimal accent glow for data visualization only
// =============================================================================

export const GLOW = {
  BLUE: `rgba(${COLOR_RGB.BLUE_500}, 0.25)`,
  VIOLET: `rgba(${COLOR_RGB.VIOLET_500}, 0.2)`,
  CYAN: `rgba(${COLOR_RGB.CYAN_500}, 0.2)`,
  ORANGE: `rgba(${COLOR_RGB.ORANGE_500}, 0.2)`,
  GREEN: `rgba(${COLOR_RGB.GREEN_500}, 0.2)`,
  PINK: `rgba(${COLOR_RGB.PINK_500}, 0.2)`,
  RED: `rgba(${COLOR_RGB.RED_500}, 0.25)`,
  GRAPE: `rgba(${COLOR_RGB.GRAPE_500}, 0.2)`,
  TEAL: `rgba(${COLOR_RGB.TEAL_500}, 0.2)`,
} as const;

// =============================================================================
// CSS VARIABLE REFERENCES
// =============================================================================

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
  TEXT: '#D1D5DB',
  TEXT_LIGHT: '#B0B8C4',
  TEXT_MUTED: '#8892A0',
  TEXT_DIMMED: '#636E7E',
  TEXT_ERROR: 'var(--mantine-color-ifrRed-5)',

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

  // --- Sidebar Icon Accents (monochromatic — single accent blue) ---
  ICON_PINK: 'var(--mantine-color-vfr3dBlue-5)',
  ICON_ORANGE: 'var(--mantine-color-vfr3dBlue-5)',
  ICON_GRAPE: 'var(--mantine-color-vfr3dBlue-5)',
  ICON_BLUE: 'var(--mantine-color-vfr3dBlue-5)',

  /** @deprecated Use ERROR instead */
  IFR_RED: 'var(--mantine-color-ifrRed-5)',
} as const;

// =============================================================================
// COMPONENT STYLES — Bottom-border inputs, frameless modals, flat panels
// =============================================================================

/**
 * Input styles — bottom-border-only, transparent background
 * All-caps micro labels at 11px
 */
export const INPUT_STYLES = {
  input: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${BORDER.INPUT}`,
    borderRadius: 0,
    color: '#D1D5DB',
    '&:focus': {
      borderBottom: `1px solid ${BORDER.INPUT_FOCUS}`,
    },
  },
  label: {
    color: '#8892A0',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
} as const;

/**
 * Modal styles — frameless floating panel with faint border
 */
export const MODAL_STYLES = {
  header: {
    backgroundColor: '#0D1117',
    borderBottom: `1px solid ${BORDER.DEFAULT}`,
  },
  body: {
    backgroundColor: '#0D1117',
  },
  content: {
    backgroundColor: '#0D1117',
    border: `1px solid ${BORDER.DEFAULT}`,
  },
  close: {
    color: '#8892A0',
    '&:hover': {
      backgroundColor: HIGHLIGHT.DEFAULT,
    },
  },
} as const;

/**
 * Select/dropdown styles — frameless dark panel
 */
export const SELECT_STYLES = {
  ...INPUT_STYLES,
  dropdown: {
    backgroundColor: '#0A0C10',
    border: `1px solid ${BORDER.DEFAULT}`,
  },
  option: {
    color: '#D1D5DB',
    '&[data-selected]': {
      backgroundColor: HIGHLIGHT.STRONG,
      color: '#4A9EFF',
    },
    '&[data-hovered]': {
      backgroundColor: HIGHLIGHT.DEFAULT,
    },
  },
} as const;

/**
 * Tab styles — minimal underline indicator
 */
export const TAB_STYLES = {
  list: {
    borderBottomColor: BORDER.DEFAULT,
  },
  tab: {
    color: '#636E7E',
    fontWeight: 500,
    fontSize: '12px',
    letterSpacing: '0.03em',
    '&:hover': {
      backgroundColor: HIGHLIGHT.LIGHT,
      color: '#B0B8C4',
    },
    '&[data-active]': {
      color: '#4A9EFF',
    },
  },
} as const;

/**
 * Wizard/form input styles — extended with description and error
 */
export const WIZARD_INPUT_STYLES = {
  input: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${BORDER.DEFAULT}`,
    borderRadius: 0,
    color: '#D1D5DB',
    '&:focus': {
      borderBottom: `1px solid ${BORDER.INPUT_FOCUS}`,
    },
  },
  label: {
    color: '#8892A0',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 4,
  },
  description: {
    color: '#636E7E',
    fontSize: '11px',
  },
  error: {
    color: THEME_COLORS.TEXT_ERROR,
  },
} as const;

/**
 * SegmentedControl — flat, bordered
 */
export const SEGMENTED_CONTROL_STYLES = {
  root: {
    backgroundColor: 'transparent',
    border: `1px solid ${BORDER.DEFAULT}`,
  },
  label: {
    color: '#636E7E',
    '&[data-active]': {
      color: '#D1D5DB',
    },
  },
} as const;

/**
 * No decorative gradients — flat backgrounds only
 */
export const GRADIENT = {
  TIP: `linear-gradient(135deg, ${HIGHLIGHT.LIGHT}, ${HIGHLIGHT.SUBTLE})`,
  ICON: `linear-gradient(135deg, ${HIGHLIGHT.DEFAULT} 0%, ${HIGHLIGHT.STRONG} 100%)`,
} as const;

/**
 * Station input styles — compact, bottom-border
 */
export const STATION_INPUT_STYLES = {
  input: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${BORDER.DEFAULT}`,
    borderRadius: 0,
    color: '#D1D5DB',
    '&:focus': {
      borderBottom: `1px solid ${BORDER.INPUT_FOCUS}`,
    },
  },
  label: {
    color: '#8892A0',
    marginBottom: 4,
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
} as const;

/**
 * Card styles — flat panel with thin border, no shadow
 */
export const CARD_STYLES = {
  root: {
    backgroundColor: SURFACE.CARD,
    border: `1px solid ${BORDER.DEFAULT}`,
    borderRadius: 0,
  },
} as const;
