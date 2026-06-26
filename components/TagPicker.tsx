import { useRouter } from "expo-router";
import { LucideIcon, Plus } from "lucide-react-native";
import { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ICON_LABELS, IconLabel } from "@/components/ui/IconLabel";
import { Colors, Palette } from "@/constants/Colors";
import { getLabelIcon } from "@/constants/LabelIcons";
import { Radius, Spacing } from "@/constants/Theme";
import { FontFamily } from "@/constants/Typography";
import { useTags } from "@/hooks/useTags";
import { useLabelDraftStore } from "@/lib/store";

type PickerTag = {
  label: string;
  icon: LucideIcon;
};

type Props = {
  value: string[];
  onChange: (labels: string[]) => void;
  theme: typeof Colors.light;
};

const COLUMNS = 4;
const GAP = Spacing.space3;
const SCREEN_PADDING = Spacing.space4;
const ITEM_SIZE =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - GAP * (COLUMNS - 1)) /
  COLUMNS;
const CIRCLE_SIZE = 44;

// Only the categories that have a dedicated icon are offered as predefined picks.
const PREDEFINED_ICON_TAGS: PickerTag[] = (
  Object.keys(ICON_LABELS) as (keyof typeof ICON_LABELS)[]
).map((key) => ({
  label: ICON_LABELS[key].label,
  icon: ICON_LABELS[key].icon,
}));

export const TagPicker = (props: Props) => {
  const { value, onChange, theme } = props;
  const { tags } = useTags();
  const router = useRouter();
  const pendingLabel = useLabelDraftStore((s) => s.pendingLabel);
  const clearPendingLabel = useLabelDraftStore((s) => s.clearPendingLabel);

  // Auto-select a label just created via the "New Label" modal.
  useEffect(() => {
    if (!pendingLabel) return;
    if (!value.includes(pendingLabel)) onChange([...value, pendingLabel]);
    clearPendingLabel();
  }, [pendingLabel, value, onChange, clearPendingLabel]);

  const predefinedLabels = new Set(
    PREDEFINED_ICON_TAGS.map((t) => t.label.toLowerCase()),
  );

  // User-created tags render their chosen icon, falling back to a generic one.
  const customTags: PickerTag[] = (tags ?? [])
    .filter((t) => !predefinedLabels.has(t.label.toLowerCase()))
    .map((t) => ({
      label: t.label,
      icon: getLabelIcon(t.icon),
    }));

  const allTags = [...PREDEFINED_ICON_TAGS, ...customTags];

  const toggle = (label: string) => {
    if (value.includes(label)) {
      onChange(value.filter((l) => l !== label));
    } else {
      onChange([...value, label]);
    }
  };

  const handleAddLabel = () => {
    router.push("/cities/label");
  };

  return (
    <View style={styles.grid}>
      {allTags.map((tag) => {
        const isSelected = value.includes(tag.label);
        return (
          <TouchableOpacity
            key={tag.label}
            style={styles.item}
            onPress={() => toggle(tag.label)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <IconLabel
              icon={tag.icon}
              size={CIRCLE_SIZE}
              color={isSelected ? Palette.paper0 : theme.ochre}
              background={isSelected ? theme.ochre : theme.ochreSubtle}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? theme.text : theme.textSecondary,
                  fontFamily: isSelected
                    ? FontFamily.semiBold
                    : FontFamily.regular,
                },
              ]}
              numberOfLines={1}
            >
              {tag.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.item}
        onPress={handleAddLabel}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add a custom label"
      >
        <View
          style={[
            styles.addCircle,
            { borderColor: theme.ochre, backgroundColor: theme.ochreSubtle },
          ]}
        >
          <Plus size={Math.round(CIRCLE_SIZE * 0.4)} color={theme.ochre} />
        </View>
        <Text
          style={[styles.label, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          Add label
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  item: {
    width: ITEM_SIZE,
    alignItems: "center",
    gap: Spacing.space1,
  },
  addCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 12,
    textAlign: "center",
  },
});
