import { EditablePhoto, SpotPhotoEditor } from "@/components/SpotPhotoEditor";
import { SpotPhotoGallery } from "@/components/SpotPhotoGallery";
import { TagPicker } from "@/components/TagPicker";
import { ICON_LABELS, IconLabelKey } from "@/components/ui/IconLabel";
import { Input } from "@/components/ui/Input";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { Colors, Palette } from "@/constants/Colors";
import { Radius, Spacing } from "@/constants/Theme";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCreateTag } from "@/hooks/useCreateTag";
import { useSpot } from "@/hooks/useSpot";
import { spotSchema, SpotFormValues } from "@/lib/schemas/spot";
import {
  deletePhotosFromStorage,
  uploadPhotoFromUri,
} from "@/lib/services/photoUpload";
import { spotPhotosApi } from "@/lib/supabase/spot_photos";
import { spotsApi } from "@/lib/supabase/spots";
import { tagsSpotsApi } from "@/lib/supabase/tags_spots";
import { Tag } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Tag as TagIcon } from "lucide-react-native";
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
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SpotRouteParams = {
  cityid: string;
  spotid: string;
};

const getTagIcon = (label: string) => {
  const key = label.trim().toLowerCase();
  return key in ICON_LABELS ? ICON_LABELS[key as IconLabelKey].icon : TagIcon;
};

export default function SpotDetailScreen() {
  const { spotid, cityid } = useLocalSearchParams<SpotRouteParams>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const tabBarPadding = useBottomTabOverflow();
  const scrollContentStyle = [styles.content, { paddingBottom: 24 + tabBarPadding }];
  const editContentStyle = [
    styles.editContent,
    { paddingBottom: 24 + tabBarPadding },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const [tagLabels, setTagLabels] = useState<string[]>([]);
  const [editPhotos, setEditPhotos] = useState<EditablePhoto[]>([]);
  const [removedPhotos, setRemovedPhotos] = useState<
    { id: number; url: string }[]
  >([]);

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
    setEditPhotos(spotPhotos.map((p) => ({ id: p.id, uri: p.url })));
    setRemovedPhotos([]);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleRemovePhoto = (photo: EditablePhoto) => {
    setEditPhotos((prev) => prev.filter((p) => p.uri !== photo.uri));
    if (photo.id != null) {
      setRemovedPhotos((prev) => [...prev, { id: photo.id!, url: photo.uri }]);
    }
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access in Settings to add a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setEditPhotos((prev) => [...prev, { uri: result.assets[0].uri }]);
    }
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

      if (removedPhotos.length > 0) {
        await spotPhotosApi.deletePhotos(removedPhotos.map((p) => p.id));
        await deletePhotosFromStorage(removedPhotos.map((p) => p.url));
      }

      // editPhotos order is the source of truth (index 0 = cover): each photo's
      // index becomes its stored position. Existing photos are repositioned in
      // place; new photos are uploaded and inserted at their index.
      const positionUpdates: { id: number; position: number }[] = [];
      const newInserts: { spot_id: number; url: string; position: number }[] =
        [];

      for (let index = 0; index < editPhotos.length; index++) {
        const photo = editPhotos[index];
        if (photo.id != null) {
          positionUpdates.push({ id: photo.id, position: index });
        } else {
          try {
            const url = await uploadPhotoFromUri(
              parseInt(spotid),
              photo.uri,
              index
            );
            newInserts.push({ spot_id: parseInt(spotid), url, position: index });
          } catch {
            // skip photos that fail to upload
          }
        }
      }

      if (positionUpdates.length > 0) {
        await spotPhotosApi.updatePositions(positionUpdates);
      }
      if (newInserts.length > 0) {
        await spotPhotosApi.insertPhotos(newInserts);
      }

      await queryClient.invalidateQueries({ queryKey: ["spot", spotid] });
      await queryClient.invalidateQueries({ queryKey: ["spot_photos", spotid] });
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
            contentContainerStyle={editContentStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name — rendered as the screen title */}
            <View style={styles.field}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    variant="title"
                    placeholder="Name"
                    error={errors.name?.message}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                )}
              />
            </View>

            {/* Location */}
            <View style={styles.field}>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Location"
                    error={errors.address?.message}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            {/* Photos */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Photos
              </Text>
              <SpotPhotoEditor
                photos={editPhotos}
                onReorder={setEditPhotos}
                onRemove={handleRemovePhoto}
                onAdd={handleAddPhoto}
                theme={theme}
              />
            </View>

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
                  />
                )}
              />
            </View>

            {/* Tags */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Tags
              </Text>
              <TagPicker value={tagLabels} onChange={setTagLabels} theme={theme} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[Typography.title, styles.spotTitle, { color: theme.text }]}>
            {spot.name}
          </Text>

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

            {tags.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  Tags
                </Text>
                <View style={styles.tagsRow}>
                  {tags.map((tag) => {
                    const Icon = getTagIcon(tag.label);
                    return (
                      <View
                        key={tag.id}
                        style={[styles.tagPill, { backgroundColor: theme.accentSubtle }]}
                      >
                        <Icon size={14} color={theme.accent} strokeWidth={2} />
                        <Text style={[styles.tagPillText, { color: theme.accent }]}>
                          {tag.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActionText: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
  },
  spotTitle: {
    paddingHorizontal: 20,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space4,
  },
  content: {
    paddingBottom: 24,
    gap: 0,
  },
  editContent: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space6,
    paddingBottom: 24,
    gap: Spacing.space6,
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
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  tagPillText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
  },
  mapsButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  mapsButtonText: {
    color: Palette.paper100,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
  },
});
