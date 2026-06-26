import {
  ChevronLeft,
  Filter,
  LucideIcon,
  Map as MapIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Radius } from "@/constants/Theme";

/**
 * Typed registry of round-icon-button glyphs. Pass a key via the `icon` prop,
 * e.g. `<IconButton icon="delete" />`. Extend as new actions are added.
 */
export const ICON_BUTTON_ICONS = {
  map: MapIcon,
  filter: Filter,
  edit: Pencil,
  delete: Trash2,
  add: Plus,
  back: ChevronLeft,
  close: X,
} satisfies Record<string, LucideIcon>;

export type IconButtonIcon = keyof typeof ICON_BUTTON_ICONS;

type IconButtonProps = {
  /** A key from the `ICON_BUTTON_ICONS` registry. */
  icon: IconButtonIcon;
  onPress: () => void;
  accessibilityLabel: string;
  /** Icon stroke color. Defaults to the theme accent. */
  color?: string;
  /** Circle fill color. Defaults to the elevated surface. */
  background?: string;
  /** Diameter of the round button. */
  size?: number;
  /** Glyph size. */
  iconSize?: number;
  strokeWidth?: number;
  activeOpacity?: number;
  hitSlop?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const IconButton = (props: IconButtonProps) => {
  const {
    icon,
    onPress,
    accessibilityLabel,
    color,
    background,
    size = 40,
    iconSize = 18,
    strokeWidth = 2,
    activeOpacity = 0.7,
    hitSlop,
    disabled,
    style,
  } = props;

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const Icon = ICON_BUTTON_ICONS[icon];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor: background ?? theme.surfaceElevated,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon
        size={iconSize}
        color={color ?? theme.accent}
        strokeWidth={strokeWidth}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
