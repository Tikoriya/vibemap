import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Shapes, X } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconLabel } from "@/components/ui/IconLabel";
import { Colors, Palette } from "@/constants/Colors";
import { EMOJI_NAMES } from "@/constants/LabelEmojis";
import {
  DEFAULT_LABEL_ICON,
  getLabelIcon,
  LABEL_ICON_NAMES,
} from "@/constants/LabelIcons";
import { Radius, Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { useCreateTag } from "@/hooks/useCreateTag";
import { useUpdateTag } from "@/hooks/useUpdateTag";
import { LabelFormValues, labelSchema } from "@/lib/schemas/label";
import { useAuthStore, useLabelDraftStore } from "@/lib/store";

const COLUMNS = 6;
const GAP = Spacing.space3;
const SCREEN_PADDING = Spacing.space4;
const CIRCLE_SIZE =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - GAP * (COLUMNS - 1)) /
  COLUMNS;

export default function CreateLabelScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutateAsync: createTags, isPending: isCreating } = useCreateTag();
  const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag();
  const setPendingLabel = useLabelDraftStore((s) => s.setPendingLabel);
  const setRenamedLabel = useLabelDraftStore((s) => s.setRenamedLabel);

  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    icon?: string;
  }>();
  const editingId = params.id ? parseInt(params.id, 10) : undefined;
  const isEditMode = editingId != null && !Number.isNaN(editingId);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const isPending = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LabelFormValues>({
    resolver: zodResolver(labelSchema),
    defaultValues: {
      name: params.name ?? "",
      icon: params.icon || DEFAULT_LABEL_ICON,
    },
  });

  const selectedIcon = watch("icon");
  const name = watch("name");
  const canSave = name.trim().length > 0 && !isPending;

  // Which grid is showing — independent of the selected icon/emoji, so
  // browsing the other tab never clears what's already picked.
  const [activeTab, setActiveTab] = useState<"icon" | "emoji">(
    () => getLabelIcon(params.icon).type,
  );
  const gridNames = activeTab === "icon" ? LABEL_ICON_NAMES : EMOJI_NAMES;

  const onSubmit = async (values: LabelFormValues) => {
    const label = values.name.trim();
    try {
      if (isEditMode) {
        await updateTag({
          tagId: editingId,
          updates: { label, icon: values.icon },
        });
        if (params.name && params.name !== label) {
          setRenamedLabel({ from: params.name, to: label });
        }
      } else {
        await createTags([{ label, icon: values.icon, user_id: user?.id }]);
        setPendingLabel(label);
      }
      router.back();
    } catch {
      Alert.alert(
        "Error",
        isEditMode
          ? "Could not update label. Please try again."
          : "Could not create label. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: theme.surfaceElevated },
          ]}
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <X size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isEditMode ? "Edit Label" : "New Label"}
        </Text>

        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: canSave ? theme.accent : theme.surfaceElevated },
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!canSave}
          activeOpacity={0.8}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Save label"
        >
          {isPending ? (
            <ActivityIndicator size="small" color={theme.onAccent} />
          ) : (
            <Check
              size={20}
              color={canSave ? theme.onAccent : theme.textMuted}
            />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identity card — preview circle + name */}
          <View
            style={[styles.identityCard, { backgroundColor: theme.surface }]}
          >
            <IconLabel
              {...getLabelIcon(selectedIcon)}
              size={66}
              strokeWidth={1.6}
              color={Palette.paper0}
              background={theme.ochre}
            />

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.nameInput, { color: theme.text }]}
                  placeholder="Label Name"
                  placeholderTextColor={theme.textMuted}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoFocus
                  returnKeyType="done"
                  maxLength={40}
                />
              )}
            />
          </View>

          {errors.name ? (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errors.name.message}
            </Text>
          ) : null}

          {/* Tab switcher — icons vs emoji */}
          <View style={[styles.tabRow, styles.gridSpacing]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                {
                  backgroundColor:
                    activeTab === "icon" ? theme.ochre : theme.surfaceElevated,
                },
              ]}
              onPress={() => setActiveTab("icon")}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === "icon" }}
              accessibilityLabel="Icons"
            >
              <Shapes
                size={18}
                color={activeTab === "icon" ? theme.ochreSubtle : theme.text}
                strokeWidth={1.8}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                {
                  backgroundColor:
                    activeTab === "emoji" ? theme.ochre : theme.surfaceElevated,
                },
              ]}
              onPress={() => setActiveTab("emoji")}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: activeTab === "emoji" }}
              accessibilityLabel="Emoji"
            >
              <Text style={styles.tabEmoji}>😀</Text>
            </TouchableOpacity>
          </View>

          {/* Icon/emoji picker — one flat grid per tab */}
          <View style={styles.grid}>
            {gridNames.map((itemName) => {
              const isSelected = itemName === selectedIcon;
              return (
                <TouchableOpacity
                  key={itemName}
                  onPress={() =>
                    setValue("icon", itemName, { shouldValidate: true })
                  }
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={itemName}
                >
                  <IconLabel
                    {...getLabelIcon(itemName)}
                    size={CIRCLE_SIZE}
                    strokeWidth={1.6}
                    color={isSelected ? theme.ochreSubtle : theme.text}
                    background={
                      isSelected ? theme.ochre : theme.surfaceElevated
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.cardTitle,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.space12,
  },
  identityCard: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.space6,
    paddingHorizontal: Spacing.space4,
    alignItems: "center",
    gap: Spacing.space4,
  },
  nameInput: {
    ...Typography.title,
    textAlign: "center",
    alignSelf: "stretch",
    padding: 0,
  },
  errorText: {
    ...Typography.secondary,
    marginTop: Spacing.space2,
    marginLeft: Spacing.space1,
  },
  tabRow: {
    flexDirection: "row",
    gap: Spacing.space2,
    justifyContent: "flex-end",
  },
  tabButton: {
    width: 44,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tabEmoji: {
    fontSize: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    marginTop: Spacing.space4,
  },
  gridSpacing: {
    marginTop: Spacing.space6,
  },
});
