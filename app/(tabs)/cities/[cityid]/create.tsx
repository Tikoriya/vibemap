import { PlacesAutocompleteField } from "@/components/GoogleAutoComplete";
import { ImportedPhotos } from "@/components/ImportedPhotos";
import { ImportLinkField } from "@/components/ImportLinkField";
import { TagInput } from "@/components/TagInput";
import { Colors } from "@/constants/Colors";
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
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CreateSpotRouteParams = {
  cityid: string;
};

export default function CreateSpotScreen() {
  const router = useRouter();
  const { cityid } = useLocalSearchParams<CreateSpotRouteParams>();
  const { createSpot } = useSpot(cityid);
  const { user } = useAuthStore();
  const { mutateAsync: createTags } = useCreateTag();
  const queryClient = useQueryClient();

  const [tagLabels, setTagLabels] = useState<string[]>([]);
  const [importedAddress, setImportedAddress] = useState<string | undefined>(
    undefined,
  );
  const [importedPhotos, setImportedPhotos] = useState<string[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {/* Import from link */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Import from link
            </Text>
            <ImportLinkField
              onImported={(spot) => {
                setValue("name", spot.name, { shouldValidate: true });
                setValue("address", spot.address, { shouldValidate: true });
                setValue("latitude", spot.latitude);
                setValue("longitude", spot.longitude);
                setImportedAddress(spot.address);
                setImportedPhotos(spot.photos ?? []);
              }}
            />
            <ImportedPhotos
              photos={importedPhotos}
              onRemove={(url) =>
                setImportedPhotos((prev) => prev.filter((p) => p !== url))
              }
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              OR
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
          </View>

          {/* Address — Google Places autocomplete */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Location
            </Text>
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

          {/* Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
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
                  placeholder="e.g. Café Central, Neni am Naschmarkt"
                  placeholderTextColor={theme.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
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
                  placeholder="What made this place special?"
                  placeholderTextColor={theme.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Tags
            </Text>
            <TagInput value={tagLabels} onChange={setTagLabels} theme={theme} />
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
  label: {
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
  },
  errorText: {
    ...Typography.secondary,
    color: "#D94F3D",
    marginLeft: 4,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
});
