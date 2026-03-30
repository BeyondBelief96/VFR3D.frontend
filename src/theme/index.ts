import { createTheme, MantineColorsTuple, CSSVariablesResolver } from '@mantine/core';

// =============================================================================
// CUSTOM COLOR PALETTES
// Each palette has 10 shades (0=lightest, 9=darkest), shade 5 is the base
// =============================================================================

/**
 * VFR3D Primary Sky Blue - #37A4DC at shade 5
 * Brand accent color from PreFlight API
 */
const vfr3dBlue: MantineColorsTuple = [
  '#e6f3fb', // 0 - lightest
  '#c2e2f5', // 1
  '#9bcfed', // 2
  '#73bce5', // 3
  '#4faade', // 4
  '#37A4DC', // 5 - base (--vfr3d-primary)
  '#2c8bc5', // 6 (--vfr3d-primary-dark)
  '#2374a8', // 7
  '#1b5d8b', // 8
  '#14466e', // 9 - darkest
];

/**
 * VFR Green - #22c55e at shade 5 (VFR flight category)
 */
const vfrGreen: MantineColorsTuple = [
  '#e8faf0', // 0
  '#c6f2d8', // 1
  '#9fe9be', // 2
  '#73dea1', // 3
  '#4ad283', // 4
  '#22c55e', // 5 - base (--vfr-color)
  '#16a34a', // 6
  '#15803d', // 7
  '#166534', // 8
  '#14532d', // 9
];

/**
 * IFR Red - #ef4444 at shade 5 (IFR flight category)
 */
const ifrRed: MantineColorsTuple = [
  '#fef2f2', // 0
  '#fee2e2', // 1
  '#fecaca', // 2
  '#fca5a5', // 3
  '#f87171', // 4
  '#ef4444', // 5 - base (--ifr-color)
  '#dc2626', // 6
  '#b91c1c', // 7
  '#991b1b', // 8
  '#7f1d1d', // 9
];

/**
 * LIFR Purple/Grape - #a855f7 at shade 5 (LIFR flight category)
 */
const lifrPurple: MantineColorsTuple = [
  '#faf5ff', // 0
  '#f3e8ff', // 1
  '#e9d5ff', // 2
  '#d8b4fe', // 3
  '#c084fc', // 4
  '#a855f7', // 5 - base (--lifr-color)
  '#9333ea', // 6
  '#7e22ce', // 7
  '#6b21a8', // 8
  '#581c87', // 9
];

/**
 * Warning Yellow/Amber - #fbbf24 at shade 5
 */
const warningYellow: MantineColorsTuple = [
  '#fefce8', // 0
  '#fef9c3', // 1
  '#fef08a', // 2
  '#fde047', // 3
  '#facc15', // 4
  '#fbbf24', // 5 - base
  '#eab308', // 6
  '#ca8a04', // 7
  '#a16207', // 8
  '#854d0e', // 9
];

/**
 * VFR3D Surface colors - dark navy theme
 * Based on brand navy #141844, used for backgrounds and surfaces in dark mode
 */
const vfr3dSurface: MantineColorsTuple = [
  '#eeeef5', // 0 - lightest (text on dark backgrounds)
  '#d4d5e3', // 1 - light text
  '#b4b6cc', // 2 - secondary text
  '#9295b4', // 3 - muted text
  '#6e7199', // 4 - dimmed text / muted foreground
  '#4d5180', // 5 - mid navy
  '#353968', // 6 - dark navy
  '#252A58', // 7 - elevated surface
  '#141844', // 8 - brand navy (--vfr3d-surface)
  '#0C0E2A', // 9 - deepest background (--vfr3d-background)
];

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

export const theme = createTheme({
  // Primary color - use VFR3D blue
  primaryColor: 'vfr3dBlue',

  // Font family - Plus Jakarta Sans (matching PreFlight API brand)
  fontFamily:
    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',

  // Custom color palettes
  colors: {
    vfr3dBlue,
    vfrGreen,
    ifrRed,
    lifrPurple,
    warningYellow,
    vfr3dSurface,
  },

  // Component default props
  components: {
    // Buttons
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Cards
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },

    // Modals
    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
      },
    },

    // Paper
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Text - default color for dark theme
    Text: {
      defaultProps: {
        c: 'gray.3',
      },
    },

    // Title - white by default for dark theme
    Title: {
      defaultProps: {
        c: 'white',
      },
    },

    // ActionIcon
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Badge
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },

    // Input components
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    Select: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Tooltip
    Tooltip: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
});

// CSS Variables Resolver for custom overrides
// This ensures dimmed text has better contrast against dark backgrounds
export const cssVariablesResolver: CSSVariablesResolver = (_theme) => ({
  variables: {},
  light: {},
  dark: {
    // Override dimmed color for better readability (slate-400)
    '--mantine-color-dimmed': '#ADADAD',
  },
});

// Export type for theme colors
export type VFR3DColors = keyof typeof theme.colors;
