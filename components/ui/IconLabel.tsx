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
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
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

type IconLabelProps = {
  /** A key from the precreated `ICON_LABELS` registry. */
  preset?: IconLabelKey;
  /** A raw Lucide icon — used when no `preset` is given. */
  icon?: LucideIcon;
  /** Accessibility label; falls back to the preset's label. */
  label?: string;
  /** Diameter of the soft circle. */
  size?: number;
  /** Icon stroke color. Defaults to the ochre accent. */
  color?: string;
  /** Circle fill color. Defaults to the soft ochre surface. */
  background?: string;
  style?: StyleProp<ViewStyle>;
};

export const IconLabel = (props: IconLabelProps) => {
  const { preset, icon, label, size = 28, color, background, style } = props;

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const resolved = preset ? ICON_LABELS[preset] : undefined;
  const Icon = icon ?? resolved?.icon;
  const accessibilityLabel = label ?? resolved?.label;

  if (!Icon) {
    return null;
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          backgroundColor: background ?? theme.ochreSubtle,
        },
        style,
      ]}
    >
      <Icon
        size={Math.round(size * 0.55)}
        color={color ?? theme.ochre}
        strokeWidth={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
