/**
 * Tukka / VibeMap design system — color tokens.
 *
 * A grounded forest base over warm paper neutrals, with an ochre accent for
 * highlights and a plum accent reserved for map pins and live selection.
 *
 * The design handoff only specifies a light theme; the dark palette below is
 * derived from the same forest tokens so the existing dark-mode support keeps
 * working.
 */

// ── Raw palette ──────────────────────────────────────────────────────────────

export const Palette = {
  // Forest · structure & text
  ink900: '#14201A',
  forest800: '#1C2A23',
  forest700: '#2B3D34',
  forest600: '#3A4F44',
  sage400: '#6F8378',

  // Paper · surfaces
  paper0: '#FBFAF5',
  paper100: '#F4F1E8',
  paper200: '#EAE5D8',
  paper300: '#DED7C6',
  paper400: '#C9C2AE',

  // Neutral hairline / muted ink used across the design
  cardBorder: '#E4DECF',
  muted: '#9AA096',
  subtleText: '#6F7D74',

  // Accent · ochre
  ochre500: '#C9912F',
  ochre50: '#F7ECD6',

  // Plum · map pins & live selection
  plum: '#6C3FD4',

  // Semantic
  open: '#3F8A5F',
  caution: '#D9772E',
  closed: '#C0492F',
  info: '#3A6FB0',
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSubtle: string;
  ochre: string;
  ochreSubtle: string;
  plum: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  onAccent: string;
  success: string;
  warning: string;
  error: string;
  infoColor: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: Palette.paper100,
    surface: Palette.paper0,
    surfaceElevated: Palette.paper200,
    border: Palette.cardBorder,
    text: Palette.forest800,
    textSecondary: Palette.subtleText,
    textMuted: Palette.muted,
    accent: Palette.forest800,
    accentSubtle: Palette.paper200,
    ochre: Palette.ochre500,
    ochreSubtle: Palette.ochre50,
    plum: Palette.plum,
    tint: Palette.forest800,
    icon: Palette.subtleText,
    tabIconDefault: Palette.muted,
    tabIconSelected: Palette.forest800,
    onAccent: Palette.paper100,
    success: Palette.open,
    warning: Palette.caution,
    error: Palette.closed,
    infoColor: Palette.info,
  },
  dark: {
    background: Palette.ink900,
    surface: Palette.forest800,
    surfaceElevated: Palette.forest700,
    border: Palette.forest700,
    text: Palette.paper100,
    textSecondary: Palette.muted,
    textMuted: Palette.sage400,
    accent: Palette.forest600,
    accentSubtle: Palette.forest700,
    ochre: Palette.ochre500,
    ochreSubtle: '#3A2E14',
    plum: '#9B79E6',
    tint: Palette.ochre500,
    icon: Palette.muted,
    tabIconDefault: Palette.sage400,
    tabIconSelected: Palette.paper100,
    onAccent: Palette.paper100,
    success: Palette.open,
    warning: Palette.caution,
    error: Palette.closed,
    infoColor: Palette.info,
  },
};
