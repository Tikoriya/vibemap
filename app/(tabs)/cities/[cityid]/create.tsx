import { PlacesAutocompleteField } from "@/components/GoogleAutoComplete";
import { ImportedPhotos } from "@/components/ImportedPhotos";
import { ImportLinkField } from "@/components/ImportLinkField";
import { TagPicker } from "@/components/TagPicker";
import { Input } from "@/components/ui/Input";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { Colors, Palette } from "@/constants/Colors";
import { Radius, Spacing } from "@/constants/Theme";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCreateTag } from "@/hooks/useCreateTag";
import { useSpot } from "@/hooks/useSpot";
import { SpotFormValues, spotSchema } from "@/lib/schemas/spot";
import { useAuthStore } from "@/lib/store";
import { uploadPhotoFromUrl } from "@/lib/services/photoUpload";
import { spotPhotosApi } from "@/lib/supabase/spot_photos";
import { tagsSpotsApi } from "@/lib/supabase/tags_spots";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CreateSpotRouteParams = {
  cityid: string;
};

type SpotTab = "manual" | "import";

const SPOT_TABS: { key: SpotTab; label: string }[] = [
  { key: "manual", label: "Add Spot" },
  { key: "import", label: "Import from link" },
];

export default function CreateSpotScreen() {
  const router = useRouter();
  const { cityid } = useLocalSearchParams<CreateSpotRouteParams>();
  const { createSpot } = useSpot(cityid);
  const { user } = useAuthStore();
  const { mutateAsync: createTags } = useCreateTag();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SpotTab>("manual");
  const [tagLabels, setTagLabels] = useState<string[]>([]);
  const [importedName, setImportedName] = useState<string | undefined>(
    undefined,
  );
  const [importedAddress, setImportedAddress] = useState<string | undefined>(
    undefined,
  );
  const [importedPhotos, setImportedPhotos] = useState<string[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const tabBarPadding = useBottomTabOverflow();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: 0,
      longitude: 0,
      notes: "",
    },
  });

  const handleResetImport = () => {
    setImportedName(undefined);
    setImportedAddress(undefined);
    setImportedPhotos([]);
    setValue("name", "", { shouldValidate: false });
    setValue("address", "", { shouldValidate: false });
    setValue("latitude", 0);
    setValue("longitude", 0);
  };

  const onSubmit = async (values: SpotFormValues) => {
    try {
      const createdSpot = await createSpot({
        name: values.name,
        notes: values.notes ?? null,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        city_id: parseInt(cityid),
      });

      if (tagLabels.length > 0) {
        const createdTags = await createTags(
          tagLabels.map((label) => ({ label, user_id: user?.id })),
        );
        await tagsSpotsApi.createTagsSpots(
          createdTags.map((tag) => ({
            spot_id: createdSpot.id,
            tag_id: tag.id,
          })),
        );
      }

      if (importedPhotos.length > 0) {
        const results = await Promise.allSettled(
          importedPhotos.map((url, i) =>
            uploadPhotoFromUrl(createdSpot.id, url, i),
          ),
        );
        const stored = results
          .map((r, i) =>
            r.status === "fulfilled"
              ? { spot_id: createdSpot.id, url: r.value, position: i }
              : null,
          )
          .filter((r): r is NonNullable<typeof r> => r !== null);
        if (stored.length > 0) {
          await spotPhotosApi.insertPhotos(stored);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["spots", cityid] });
      router.back();
    } catch {
      Alert.alert("Error", "Could not save spot. Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add Spot
        </Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 24 + tabBarPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Tab switcher */}
          <SegmentedTabs
            tabs={SPOT_TABS}
            value={activeTab}
            onChange={setActiveTab}
          />

          {/* Manual entry */}
          {activeTab === "manual" ? (
            <>
              {/* Name */}
              <View style={styles.field}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Name"
                      error={errors.name?.message}
                      placeholder="e.g. Café Central, Neni am Naschmarkt"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  )}
                />
              </View>

              {/* Location — Google Places autocomplete */}
              <View style={styles.field}>
                <Controller
                  control={control}
                  name="address"
                  render={() => (
                    <PlacesAutocompleteField
                      error={errors.address?.message}
                      prefillValue={importedAddress}
                      onPlaceSelected={(place) => {
                        setValue("address", place.address, {
                          shouldValidate: true,
                        });
                        setValue("latitude", place.latitude);
                        setValue("longitude", place.longitude);
                        if (!control._formValues.name) {
                          setValue("name", place.name);
                        }
                      }}
                    />
                  )}
                />
              </View>
            </>
          ) : (
            /* Import from link */
            <View style={styles.field}>
              {importedName ? (
                <View
                  style={[
                    styles.importedCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.importedHeader}>
                    <Text
                      style={[styles.importedName, { color: theme.text }]}
                      numberOfLines={2}
                    >
                      {importedName}
                    </Text>
                    <TouchableOpacity
                      onPress={handleResetImport}
                      activeOpacity={0.7}
                      hitSlop={8}
                      style={styles.importedReset}
                    >
                      <RotateCcw size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {importedAddress ? (
                    <Text
                      style={[
                        styles.importedAddress,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {importedAddress}
                    </Text>
                  ) : null}
                  <ImportedPhotos
                    photos={importedPhotos}
                    onRemove={(url) =>
                      setImportedPhotos((prev) =>
                        prev.filter((p) => p !== url),
                      )
                    }
                  />
                </View>
              ) : (
                <ImportLinkField
                  onImported={(spot) => {
                    setValue("name", spot.name, { shouldValidate: true });
                    setValue("address", spot.address, { shouldValidate: true });
                    setValue("latitude", spot.latitude);
                    setValue("longitude", spot.longitude);
                    setImportedName(spot.name);
                    setImportedAddress(spot.address);
                    setImportedPhotos(spot.photos ?? []);
                  }}
                />
              )}
            </View>
          )}

          {/* Notes */}
          <View style={styles.field}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Notes"
                  placeholder="What made this place special?"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                />
              )}
            />
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <TagPicker
              value={tagLabels}
              onChange={setTagLabels}
              theme={theme}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: isSubmitting ? theme.border : theme.accent,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[Typography.button, styles.saveButtonText]}>
                Save spot
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    width: 64,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    textAlign: "center",
  },
  headerRight: {
    width: 64,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  importedCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.space4,
    gap: Spacing.space2,
  },
  importedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.space2,
  },
  importedName: {
    ...Typography.placeName,
    flex: 1,
  },
  importedReset: {
    marginTop: 2,
  },
  importedAddress: {
    ...Typography.secondary,
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: Palette.paper100,
  },
});
