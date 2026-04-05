import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

export const Typography = {
  // City names displayed over full-bleed images
  display: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  // Screen-level headings
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  // Spot and city card names
  cardTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
  } satisfies TextStyle,

  // Body copy, notes
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  // Secondary labels — address, spot count, captions
  secondary: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,

  // Tag chips
  chip: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  } satisfies TextStyle,

  // Buttons and CTAs
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
  } satisfies TextStyle,
} as const;
