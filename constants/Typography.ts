import { TextStyle } from 'react-native';

/**
 * Tukka / VibeMap design system — type families.
 *
 * Playfair Display carries headlines and place names; DM Sans handles UI and
 * body; DM Mono labels metadata.
 */
export const FontFamily = {
  // DM Sans · UI & body
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',

  // Playfair Display · headlines & place names
  serifMedium: 'PlayfairDisplay_500Medium',
  serifMediumItalic: 'PlayfairDisplay_500Medium_Italic',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',

  // DM Mono · metadata labels
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

export const Typography = {
  // Display — Playfair, used over full-bleed imagery and hero headlines
  display: {
    fontFamily: FontFamily.serifBold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  // Heading 1 — large Playfair screen heading
  heading1: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  // Heading 2 — Playfair section / greeting heading
  heading2: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  // Screen-level headings
  title: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  // Spot and city card names — DM Sans
  cardTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
  } satisfies TextStyle,

  // Place / card name — Playfair variant for featured cards
  placeName: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 20,
    lineHeight: 24,
  } satisfies TextStyle,

  // Body copy, notes
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  // Form / UI label — DM Sans 14 / 600
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  } satisfies TextStyle,

  // Secondary labels — address, spot count, captions
  secondary: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,

  // Meta — DM Mono uppercase metadata (category · distance)
  meta: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  // Tag chips
  chip: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 16,
  } satisfies TextStyle,

  // Buttons and CTAs
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
  } satisfies TextStyle,
} as const;
