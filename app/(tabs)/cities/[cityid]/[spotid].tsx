import { PlacesAutocompleteField } from "@/components/GoogleAutoComplete";
import { SpotPhotoGallery } from "@/components/SpotPhotoGallery";
import { TagInput } from "@/components/TagInput";
import { Colors } from "@/constants/Colors";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCreateTag } from "@/hooks/useCreateTag";
import { useSpot } from "@/hooks/useSpot";
import { spotSchema, SpotFormValues } from "@/lib/schemas/spot";
import { spotPhotosApi } from "@/lib/supabase/spot_photos";
import { spotsApi } from "@/lib/supabase/spots";
import { tagsSpotsApi } from "@/lib/supabase/tags_spots";
import { Tag } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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

type SpotRouteParams = {
  cityid: string;
  spotid: string;
};

export default function SpotDetailScreen() {
  const { spotid, cityid } = useLocalSearchParams<SpotRouteParams>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const [isEditing, setIsEditing] = useState(false);
  const [tagLabels, setTagLabels] = useState<string[]>([]);

  const { updateSpot } = useSpot(cityid);
  const { mutateAsync: createTags } = useCreateTag();

  const { data: spot, isLoading } = useQuery({
    queryKey: ["spot", spotid],
    queryFn: () => spotsApi.getSpot(parseInt(spotid)),
    enabled: !!spotid,
  });

  const { data: spotPhotos = [] } = useQuery({
    queryKey: ["spot_photos", spotid],
    queryFn: () => spotPhotosApi.fetchForSpot(parseInt(spotid)),
    enabled: !!spotid,
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
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

  const enterEditMode = () => {
    if (!spot) return;
    reset({
      name: spot.name,
      address: spot.address ?? "",
      latitude: spot.latitude ?? 0,
      longitude: spot.longitude ?? 0,
      notes: spot.notes ?? "",
    });
    const existingTags = ((spot as any).tags as Tag[] | undefined) ?? [];
    setTagLabels(existingTags.map((t) => t.label));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const onSave = async (values: SpotFormValues) => {
    try {
      await updateSpot({
        spotId: parseInt(spotid),
        updates: {
          name: values.name,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          notes: values.notes ?? null,
        },
      });

      await tagsSpotsApi.deleteSpotTags(parseInt(spotid));
      if (tagLabels.length > 0) {
        const createdTags = await createTags(
          tagLabels.map((label) => ({ label }))
        );
        await tagsSpotsApi.createTagsSpots(
          createdTags.map((tag) => ({
            spot_id: parseInt(spotid),
            tag_id: tag.id,
          }))
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["spot", spotid] });
      await queryClient.invalidateQueries({ queryKey: ["spots", cityid] });
      setIsEditing(false);
    } catch {
      Alert.alert("Error", "Could not save changes. Please try again.");
    }
  };

  const handleOpenInMaps = () => {
    if (!spot?.latitude || !spot?.longitude) return;
    const { latitude, longitude, name } = spot;
    const label = encodeURIComponent(name);
    const url =
      Platform.OS === "ios"
        ? `maps://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;

    Linking.canOpenURL(url).then((supported) => {
      Linking.openURL(
        supported ? url : `https://maps.google.com/?q=${latitude},${longitude}`
      );
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[Typography.body, { color: theme.textSecondary }]}>
          Spot not found.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={[Typography.secondary, { color: theme.accent }]}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tags = ((spot as any).tags as Tag[] | undefined) ?? [];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        {isEditing ? (
          <TouchableOpacity onPress={cancelEdit} activeOpacity={0.7}>
            <Text style={[styles.headerActionText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={[styles.headerActionText, { color: theme.accent }]}>
              ‹ Back
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {isEditing ? "Edit Spot" : spot.name}
        </Text>

        {isEditing ? (
          <TouchableOpacity
            onPress={handleSubmit(onSave)}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <Text style={[styles.headerActionText, { color: theme.accent, textAlign: "right" }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={enterEditMode} activeOpacity={0.7}>
            <Text style={[styles.headerActionText, { color: theme.accent, textAlign: "right" }]}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Location */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Location
              </Text>
              <Controller
                control={control}
                name="address"
                render={() => (
                  <PlacesAutocompleteField
                    error={errors.address?.message}
                    onPlaceSelected={(place) => {
                      setValue("address", place.address, { shouldValidate: true });
                      setValue("latitude", place.latitude);
                      setValue("longitude", place.longitude);
                    }}
                  />
                )}
              />
              {spot.address ? (
                <Text style={[Typography.secondary, { color: theme.textSecondary }]}>
                  Current: {spot.address}
                </Text>
              ) : null}
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Name
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        borderColor: errors.name ? "#D94F3D" : theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    returnKeyType="next"
                    placeholderTextColor={theme.textSecondary}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Notes
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.notesInput,
                      {
                        color: theme.text,
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                      },
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor={theme.textSecondary}
                    placeholder="What made this place special?"
                  />
                )}
              />
            </View>

            {/* Tags */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Tags
              </Text>
              <TagInput value={tagLabels} onChange={setTagLabels} theme={theme} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {spotPhotos.length > 0 ? (
            <SpotPhotoGallery photos={spotPhotos.map((p) => p.url)} />
          ) : null}

          <View style={styles.textContent}>
            {spot.address ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Address
                </Text>
                <Text style={[Typography.body, { color: theme.text }]}>
                  {spot.address}
                </Text>
              </View>
            ) : null}

            {spot.notes ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Notes
                </Text>
                <Text style={[Typography.body, { color: theme.text }]}>
                  {spot.notes}
                </Text>
              </View>
            ) : null}

            {tags.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Tags
                </Text>
                <View style={styles.tagsRow}>
                  {tags.map((tag) => (
                    <View
                      key={tag.id}
                      style={[styles.tagPill, { backgroundColor: theme.accentSubtle }]}
                    >
                      <Text style={[styles.tagPillText, { color: theme.accent }]}>
                        {tag.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {spot.latitude && spot.longitude ? (
              <TouchableOpacity
                style={[styles.mapsButton, { backgroundColor: theme.accent }]}
                onPress={handleOpenInMaps}
                activeOpacity={0.85}
              >
                <Text style={[Typography.button, styles.mapsButtonText]}>
                  Open in Maps
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  backLink: {
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActionText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    width: 64,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    textAlign: "center",
  },
  content: {
    paddingBottom: 24,
    gap: 0,
  },
  textContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagPillText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
  },
  mapsButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  mapsButtonText: {
    color: "#FFFFFF",
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  notesInput: {
    height: 96,
    paddingTop: 14,
  },
  errorText: {
    ...Typography.secondary,
    color: "#D94F3D",
    marginLeft: 4,
  },
});
