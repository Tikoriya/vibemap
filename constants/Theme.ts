/**
 * Tukka / VibeMap design system — spacing, radius and elevation tokens.
 */
import { Platform, ViewStyle } from 'react-native';

export const Spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space6: 24,
  space8: 32,
  space12: 48,
  space16: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

const shadow = (
  height: number,
  radius: number,
  opacity: number,
  elevation: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#14201A',
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;

/**
 * Elevation tokens mirror the design's box-shadow scale (rgba(20,32,26, …)).
 */
export const Elevation = {
  flat: shadow(1, 2, 0.08, 1),
  card: shadow(4, 16, 0.1, 3),
  float: shadow(12, 32, 0.14, 8),
  sheet: shadow(-10, 40, 0.16, 12),
} as const;
