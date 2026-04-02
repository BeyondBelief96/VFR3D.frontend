import { createTheme, MantineColorsTuple, CSSVariablesResolver } from '@mantine/core';

// =============================================================================
// DEFENSE / C2 COLOR PALETTES
// Near-black backgrounds, electric blue accent, muted functional colors
// =============================================================================

/**
 * Electric Blue accent — #4A9EFF at shade 5
 * Single primary accent for active/selected/interactive states
 */
const vfr3dBlue: MantineColorsTuple = [
  '#E8F2FF', // 0
  '#C4DEFF', // 1
  '#9CC8FF', // 2
  '#74B2FF', // 3
  '#5CA8FF', // 4
  '#4A9EFF', // 5 - electric blue accent
  '#3B87E0', // 6
  '#2D6FC0', // 7
  '#1F57A0', // 8
  '#134080', // 9
];

/**
 * Operational Green — #2EA043 at shade 5
 * VFR flight category / success / confirmation
 */
const vfrGreen: MantineColorsTuple = [
  '#E6F9ED', // 0
  '#C1F0D2', // 1
  '#96E5B3', // 2
  '#6BD993', // 3
  '#45CF77', // 4
  '#2EA043', // 5 - operational green
  '#268E3A', // 6
  '#1E7A31', // 7
  '#176628', // 8
  '#11521F', // 9
];

/**
 * Critical Red — #C94040 at shade 5
 * IFR flight category / error / destructive actions
 */
const ifrRed: MantineColorsTuple = [
  '#FCEAEA', // 0
  '#F5C9C9', // 1
  '#EDA3A3', // 2
  '#E47C7C', // 3
  '#D95A5A', // 4
  '#C94040', // 5 - muted critical red
  '#AB3333', // 6
  '#8D2828', // 7
  '#701E1E', // 8
  '#541616', // 9
];

/**
 * LIFR Purple — #9066D6 at shade 5
 * LIFR flight category
 */
const lifrPurple: MantineColorsTuple = [
  '#F5F0FF', // 0
  '#E8DAFF', // 1
  '#D4BFFF', // 2
  '#BEA1F7', // 3
  '#A882ED', // 4
  '#9066D6', // 5 - muted purple
  '#7A51BF', // 6
  '#6540A3', // 7
  '#513288', // 8
  '#3E256E', // 9
];

/**
 * Warning Amber — #D4A04A at shade 5
 * Warnings, caution states
 */
const warningYellow: MantineColorsTuple = [
  '#FBF3E4', // 0
  '#F5E2BD', // 1
  '#EECE91', // 2
  '#E5B96A', // 3
  '#DCA954', // 4
  '#D4A04A', // 5 - amber warning
  '#B8873A', // 6
  '#9A6F2D', // 7
  '#7C5821', // 8
  '#5E4218', // 9
];

/**
 * Command Surface — near-black defense palette
 * 0-2: text colors (light on dark), 3-4: muted/dimmed,
 * 5-6: mid panels, 7-9: backgrounds (darkest)
 */
const vfr3dSurface: MantineColorsTuple = [
  '#D1D5DB', // 0 - primary text (off-white)
  '#B0B8C4', // 1 - light text
  '#8892A0', // 2 - secondary text (cool gray)
  '#636E7E', // 3 - muted text
  '#3D4758', // 4 - dimmed
  '#2A3140', // 5 - mid panel
  '#1B2130', // 6 - muted blue-gray panel
  '#141922', // 7 - elevated surface
  '#0D1117', // 8 - main surface
  '#0A0C10', // 9 - deepest black
];

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

export const theme = createTheme({
  primaryColor: 'vfr3dBlue',

  // Monospace-first typography — SCIF terminal aesthetic
  fontFamily:
    '"JetBrains Mono", "IBM Plex Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace',
  fontFamilyMonospace:
    '"JetBrains Mono", "IBM Plex Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace',

  headings: {
    fontFamily:
      '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
    fontWeight: '600',
  },

  // Custom color palettes
  colors: {
    vfr3dBlue,
    vfrGreen,
    ifrRed,
    lifrPurple,
    warningYellow,
    vfr3dSurface,
  },

  // No rounded corners — flat and clinical
  defaultRadius: 0,

  // Component defaults — defense minimal
  components: {
    Button: {
      defaultProps: {
        radius: 0,
      },
    },

    Card: {
      defaultProps: {
        radius: 0,
        shadow: 'none',
      },
    },

    Modal: {
      defaultProps: {
        radius: 0,
        centered: true,
      },
    },

    Paper: {
      defaultProps: {
        radius: 0,
        shadow: 'none',
      },
    },

    Text: {
      defaultProps: {
        c: '#D1D5DB',
      },
    },

    Title: {
      defaultProps: {
        c: '#D1D5DB',
      },
      styles: {
        root: {
          letterSpacing: '0.06em',
        },
      },
    },

    ActionIcon: {
      defaultProps: {
        radius: 0,
        variant: 'subtle',
      },
    },

    Badge: {
      defaultProps: {
        radius: 0,
      },
    },

    TextInput: {
      defaultProps: {
        radius: 0,
      },
    },

    NumberInput: {
      defaultProps: {
        radius: 0,
      },
    },

    Select: {
      defaultProps: {
        radius: 0,
      },
    },

    MultiSelect: {
      defaultProps: {
        radius: 0,
      },
    },

    Tooltip: {
      defaultProps: {
        radius: 0,
      },
    },

    Popover: {
      defaultProps: {
        radius: 0,
        shadow: 'none',
      },
    },

    Menu: {
      defaultProps: {
        radius: 0,
        shadow: 'none',
      },
    },

    Notification: {
      defaultProps: {
        radius: 0,
      },
    },

    Accordion: {
      defaultProps: {
        radius: 0,
      },
    },

    Tabs: {
      defaultProps: {
        radius: 0,
      },
    },

    SegmentedControl: {
      defaultProps: {
        radius: 0,
      },
    },

    Switch: {
      defaultProps: {
        radius: 0,
      },
      styles: {
        track: {
          cursor: 'pointer',
        },
      },
    },

    Checkbox: {
      defaultProps: {
        radius: 0,
      },
    },

    Drawer: {
      defaultProps: {
        radius: 0,
      },
    },
  },
});

// CSS Variables Resolver — defense dark overrides
export const cssVariablesResolver: CSSVariablesResolver = (_theme) => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-dimmed': '#8892A0',
    '--mantine-color-body': '#0A0C10',
  },
});

// Export type for theme colors
export type VFR3DColors = keyof typeof theme.colors;
