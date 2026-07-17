import {
  Coffee,
  Croissant,
  CupSoda,
  EggFried,
  Laptop,
  LaptopMinimalCheck,
  LucideIcon,
  Martini,
  UtensilsCrossed,
  Wine,
} from "lucide-react-native";
import {
  StyleProp,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { getLabelIcon, ResolvedLabelIcon } from "@/constants/LabelIcons";
import { Radius } from "@/constants/Theme";

export type IconLabelPreset = {
  icon: LucideIcon;
  label: string;
};

/**
 * Precreated category icon labels. Pass a key via the `preset` prop, e.g.
 * `<IconLabel preset="coffee" />`. Extend this registry as new categories are added.
 */
export const ICON_LABELS = {
  coffee: { icon: Coffee, label: "Coffee" },
  cocktails: { icon: Martini, label: "Cocktails" },
  food: { icon: UtensilsCrossed, label: "Food" },
  coworking: { icon: LaptopMinimalCheck, label: "Coworking" },
  workfriendly: { icon: Laptop, label: "Work-friendly" },
  wine: { icon: Wine, label: "Wine" },
  brunch: { icon: EggFried, label: "Brunch" },
  pastries: { icon: Croissant, label: "Pastries" },
  coffee2go: { icon: CupSoda, label: "Coffee to go" },
} satisfies Record<string, IconLabelPreset>;

export type IconLabelKey = keyof typeof ICON_LABELS;

/**
 * Resolves a tag's display icon: the user-chosen `icon` wins, then a predefined
 * preset matched by label, then the generic default. Use this everywhere a stored
 * tag is rendered so user-created labels show their chosen icon.
 */
export const resolveTagIcon = (tag: {
  label: string;
  icon?: string | null;
}): ResolvedLabelIcon => {
  if (tag.icon) return getLabelIcon(tag.icon);
  const key = tag.label.trim().toLowerCase();
  return key in ICON_LABELS
    ? { type: "icon", icon: ICON_LABELS[key as IconLabelKey].icon }
    : getLabelIcon(null);
};

type IconLabelProps = {
  /** A key from the precreated `ICON_LABELS` registry (always icon type). */
  preset?: IconLabelKey;
  /** Which shape to render. Defaults to "icon". */
  type?: "icon" | "emoji";
  /** A raw Lucide icon — used when `type` is "icon" and no `preset` is given. */
  icon?: LucideIcon;
  /** A raw emoji character — used when `type` is "emoji". */
  emoji?: string;
  /** Accessibility label; falls back to the preset's label. */
  label?: string;
  /** Diameter of the soft circle. */
  size?: number;
  /** Icon stroke color. Defaults to the ochre accent. Ignored for emoji, which render in their native color. */
  color?: string;
  /** Circle fill color. Defaults to the soft ochre surface. */
  background?: string;
  /** Icon stroke width. Defaults to 2. Ignored for emoji. */
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export const IconLabel = (props: IconLabelProps) => {
  const {
    preset,
    type = "icon",
    icon,
    emoji,
    label,
    size = 28,
    color,
    background,
    strokeWidth = 2,
    style,
  } = props;

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const resolved = preset ? ICON_LABELS[preset] : undefined;
  const accessibilityLabel = label ?? resolved?.label;

  const circleStyle = [
    styles.circle,
    {
      width: size,
      height: size,
      backgroundColor: background ?? theme.ochreSubtle,
    },
    style,
  ];

  if (type === "emoji") {
    if (!emoji) return null;
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={circleStyle}
      >
        <Text style={{ fontSize: Math.round(size * 0.55) }}>{emoji}</Text>
      </View>
    );
  }

  const Icon = icon ?? resolved?.icon;
  if (!Icon) {
    return null;
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={circleStyle}
    >
      <Icon
        size={Math.round(size * 0.55)}
        color={color ?? theme.ochre}
        strokeWidth={strokeWidth}
      />
    </View>
  );
};

type TagGlyphProps = {
  /** A `resolveTagIcon`/`getLabelIcon` result — icon or emoji. */
  resolved: ResolvedLabelIcon;
  size?: number;
  /** Icon stroke color. Ignored for emoji, which render in their native color. */
  color?: string;
  strokeWidth?: number;
};

/**
 * Bare icon/emoji glyph with no circle backdrop — for spots where a tag is
 * rendered inline (e.g. a pill chip) rather than inside `IconLabel`'s circle.
 */
export const TagGlyph = (props: TagGlyphProps) => {
  const { resolved, size = 14, color, strokeWidth = 2 } = props;

  if (resolved.type === "emoji") {
    return <Text style={{ fontSize: size }}>{resolved.emoji}</Text>;
  }

  const Icon = resolved.icon;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
};

const styles = StyleSheet.create({
  circle: {
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
