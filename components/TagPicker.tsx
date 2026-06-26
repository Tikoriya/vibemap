import { useRouter } from "expo-router";
import { Check, LucideIcon, Pencil, Plus, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
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
import { useDeleteTag } from "@/hooks/useDeleteTag";
import { useTags } from "@/hooks/useTags";
import { useLabelDraftStore } from "@/lib/store";

type PickerTag = {
  id?: number;
  label: string;
  icon: LucideIcon;
  iconName?: string | null;
};

type Props = {
  value: string[];
  onChange: (labels: string[]) => void;
  theme: typeof Colors.light;
  title?: string;
};

const COLUMNS = 4;
const GAP = Spacing.space3;
const SCREEN_PADDING = Spacing.space4;
// Width available to the picker once the surrounding screen padding is removed.
// Each swipe page fills exactly this width so paging snaps cleanly.
const PAGE_WIDTH = Dimensions.get("window").width - SCREEN_PADDING * 2;
const ITEM_SIZE = (PAGE_WIDTH - GAP * (COLUMNS - 1)) / COLUMNS;
const CIRCLE_SIZE = 44;
// Total items per page, counting the leading "Add label" button. A multiple of
// COLUMNS so each page fills complete rows.
const PAGE_SIZE = COLUMNS * 4;
const TAGS_PER_PAGE = PAGE_SIZE - 1;

// Only the categories that have a dedicated icon are offered as predefined picks.
const PREDEFINED_ICON_TAGS: PickerTag[] = (
  Object.keys(ICON_LABELS) as (keyof typeof ICON_LABELS)[]
).map((key) => ({
  label: ICON_LABELS[key].label,
  icon: ICON_LABELS[key].icon,
}));

export const TagPicker = (props: Props) => {
  const { value, onChange, theme, title = "Tags" } = props;
  const { tags } = useTags();
  const router = useRouter();
  const { mutateAsync: deleteTag } = useDeleteTag();

  const pendingLabel = useLabelDraftStore((s) => s.pendingLabel);
  const clearPendingLabel = useLabelDraftStore((s) => s.clearPendingLabel);
  const renamedLabel = useLabelDraftStore((s) => s.renamedLabel);
  const clearRenamedLabel = useLabelDraftStore((s) => s.clearRenamedLabel);

  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-select a label just created via the "New Label" modal.
  useEffect(() => {
    if (!pendingLabel) return;
    if (!value.includes(pendingLabel)) onChange([...value, pendingLabel]);
    clearPendingLabel();
  }, [pendingLabel, value, onChange, clearPendingLabel]);

  // Keep a selected tag selected after it was renamed in the edit modal.
  useEffect(() => {
    if (!renamedLabel) return;
    if (value.includes(renamedLabel.from)) {
      onChange(
        value.map((l) => (l === renamedLabel.from ? renamedLabel.to : l)),
      );
    }
    clearRenamedLabel();
  }, [renamedLabel, value, onChange, clearRenamedLabel]);

  const dbByLabel = new Map(
    (tags ?? []).map((t) => [t.label.toLowerCase(), t]),
  );
  const predefinedLabels = new Set(
    PREDEFINED_ICON_TAGS.map((t) => t.label.toLowerCase()),
  );

  // Predefined picks resolve to their DB row (for id + chosen icon) when present.
  const predefinedTags: PickerTag[] = PREDEFINED_ICON_TAGS.map((t) => {
    const db = dbByLabel.get(t.label.toLowerCase());
    return {
      id: db?.id,
      label: t.label,
      icon: db?.icon ? getLabelIcon(db.icon) : t.icon,
      iconName: db?.icon ?? null,
    };
  });

  // User-created tags render their chosen icon, falling back to a generic one.
  const customTags: PickerTag[] = (tags ?? [])
    .filter((t) => !predefinedLabels.has(t.label.toLowerCase()))
    .map((t) => ({
      id: t.id,
      label: t.label,
      icon: getLabelIcon(t.icon),
      iconName: t.icon,
    }));

  const allTags = [...predefinedTags, ...customTags];

  const pageCount = Math.max(1, Math.ceil(allTags.length / TAGS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pages = Array.from({ length: pageCount }, (_, i) =>
    allTags.slice(i * TAGS_PER_PAGE, i * TAGS_PER_PAGE + TAGS_PER_PAGE),
  );

  // Keep the page in range when tags are added or deleted.
  useEffect(() => {
    if (page > pageCount - 1) {
      const last = pageCount - 1;
      setPage(last);
      scrollRef.current?.scrollTo({ x: last * PAGE_WIDTH, animated: false });
    }
  }, [page, pageCount]);

  const goToPage = (i: number) => {
    setPage(i);
    scrollRef.current?.scrollTo({ x: i * PAGE_WIDTH, animated: true });
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    if (i !== safePage) setPage(i);
  };

  // Selection matches by normalized label so a predefined pick ("Coffee")
  // highlights even when the spot stored it differently cased ("coffee").
  const norm = (label: string) => label.trim().toLowerCase();
  const isLabelSelected = (label: string) =>
    value.some((l) => norm(l) === norm(label));

  const toggle = (label: string) => {
    if (isLabelSelected(label)) {
      onChange(value.filter((l) => norm(l) !== norm(label)));
    } else {
      onChange([...value, label]);
    }
  };

  const handleTagPress = (tag: PickerTag) => {
    if (isEditing) {
      if (tag.id == null) return;
      router.push({
        pathname: "/cities/label",
        params: {
          id: String(tag.id),
          name: tag.label,
          icon: tag.iconName ?? "",
        },
      });
      return;
    }
    toggle(tag.label);
  };

  const handleDelete = (tag: PickerTag) => {
    if (tag.id == null) return;
    Alert.alert(
      "Delete label",
      `Delete "${tag.label}"? It will be removed from all spots.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (isLabelSelected(tag.label)) {
              onChange(value.filter((l) => norm(l) !== norm(tag.label)));
            }
            try {
              await deleteTag(tag.id!);
            } catch {
              Alert.alert("Error", "Could not delete label. Please try again.");
            }
          },
        },
      ],
    );
  };

  const handleAddLabel = () => {
    router.push("/cities/label");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>
          {title}
        </Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.accentSubtle }]}
          onPress={() => setIsEditing((v) => !v)}
          activeOpacity={0.7}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? "Done editing labels" : "Edit labels"}
        >
          {isEditing ? (
            <Check size={15} color={theme.accent} strokeWidth={2.4} />
          ) : (
            <Pencil size={14} color={theme.accent} strokeWidth={2.4} />
          )}
          <Text style={[styles.editButtonText, { color: theme.accent }]}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEnabled={pageCount > 1}
        decelerationRate="fast"
      >
        {pages.map((pageTags, pageIndex) => (
          <View key={pageIndex} style={styles.page}>
            {pageTags.map((tag) => {
              const isSelected = isLabelSelected(tag.label);
              const canModify = isEditing && tag.id != null;
              return (
                <TouchableOpacity
                  key={tag.label}
                  style={styles.item}
                  onPress={() => handleTagPress(tag)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.iconWrap}>
                    <IconLabel
                      icon={tag.icon}
                      size={CIRCLE_SIZE}
                      color={isSelected ? Palette.paper0 : theme.ochre}
                      background={isSelected ? theme.ochre : theme.ochreSubtle}
                    />
                    {canModify ? (
                      <TouchableOpacity
                        style={[
                          styles.deleteBadge,
                          {
                            backgroundColor: theme.surfaceElevated,
                            borderColor: theme.border,
                          },
                        ]}
                        onPress={() => handleDelete(tag)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${tag.label}`}
                      >
                        <X size={12} color={theme.text} strokeWidth={3} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
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
                  {
                    borderColor: theme.ochre,
                    backgroundColor: theme.ochreSubtle,
                  },
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
        ))}
      </ScrollView>

      {pageCount > 1 ? (
        <View style={styles.dots}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToPage(i)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Go to page ${i + 1} of ${pageCount}`}
              accessibilityState={{ selected: i === safePage }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === safePage ? theme.text : theme.border,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.space4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space1,
    paddingHorizontal: Spacing.space3,
    paddingVertical: Spacing.space1,
    borderRadius: Radius.full,
  },
  editButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
  },
  page: {
    width: PAGE_WIDTH,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  item: {
    width: ITEM_SIZE,
    alignItems: "center",
    gap: Spacing.space1,
  },
  iconWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  deleteBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.space2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
  },
});
