import { AlertCircle } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Colors, Palette } from "@/constants/Colors";
import { Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { useCities } from "@/hooks/useCities";
import googleApi from "@/lib/services/google";
import { unsplashService } from "@/lib/services/unsplash";
import { useAuthStore } from "@/lib/store";

const CITY_GRADIENTS: [string, string][] = [
  ["#2B3D34", "#3C4F44"],
  ["#3A4F44", "#6F8378"],
  ["#1C2A23", "#3A4F44"],
  ["#33453B", "#3C4F44"],
  ["#2B3D34", "#6F8378"],
  ["#14201A", "#2B3D34"],
];

// Dark forest scrim layered over the photo so the form stays legible.
const SCRIM_COLORS = [
  "rgba(20,32,26,0.1)",
  "rgba(20,32,26,0.55)",
  "rgba(20,32,26,0.94)",
] as const;

function gradientForName(name: string): [string, string] {
  if (!name) return CITY_GRADIENTS[0];
  return CITY_GRADIENTS[name.charCodeAt(0) % CITY_GRADIENTS.length];
}

export default function CreateCityScreen() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [countryEdited, setCountryEdited] = useState(false);
  const [suggestedPhotoUrl, setSuggestedPhotoUrl] = useState<string | null>(
    null,
  );
  const [photoPage, setPhotoPage] = useState(1);
  const [userPhotoUri, setUserPhotoUri] = useState<string | null>(null);
  const [isFetchingPhoto, setIsFetchingPhoto] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const { createCity } = useCities();
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const activePhotoUrl = userPhotoUri ?? suggestedPhotoUrl;
  const gradient = gradientForName(name);
  const showSpinner = isFetchingPhoto || isImageLoading;

  const fetchPhoto = useCallback(async (query: string, page: number) => {
    setIsFetchingPhoto(true);
    setPhotoError(null);
    try {
      const photo = await unsplashService.searchCityPhoto(query, page);
      if (photo?.urls.regular) {
        setSuggestedPhotoUrl(photo.urls.regular);
      } else {
        setSuggestedPhotoUrl(null);
        setPhotoError("No photo found — a color will be used instead.");
      }
    } catch (error) {
      setSuggestedPhotoUrl(null);
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Could not load a photo. Please try again.",
      );
    } finally {
      setIsFetchingPhoto(false);
    }
  }, []);

  // Only auto-fills country while the user hasn't typed their own value.
  const suggestCountry = useCallback(
    async (query: string) => {
      if (countryEdited) return;
      const resolved = await googleApi.getCountryForCity(query);
      if (resolved && !countryEdited) setCountry(resolved);
    },
    [countryEdited],
  );

  const handleNameChange = useCallback(
    (text: string) => {
      setName(text);
      setUserPhotoUri(null);
      setSuggestedPhotoUrl(null);
      setPhotoError(null);
      setPhotoPage(1);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.trim().length < 2) return;

      debounceRef.current = setTimeout(() => {
        fetchPhoto(text.trim(), 1);
        suggestCountry(text.trim());
      }, 600);
    },
    [fetchPhoto, suggestCountry],
  );

  const handleCountryChange = useCallback((text: string) => {
    setCountry(text);
    setCountryEdited(true);
  }, []);

  const handleTryAnother = () => {
    if (!name.trim() || isFetchingPhoto) return;
    const nextPage = photoPage + 1;
    setPhotoPage(nextPage);
    setUserPhotoUri(null);
    fetchPhoto(name.trim(), nextPage);
  };

  const handlePickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access in Settings to choose a cover photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled) {
      setPhotoError(null);
      setUserPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await createCity({
        name: name.trim(),
        country: country.trim() || null,
        imageUrl: activePhotoUrl ?? null,
        user_id: user?.id,
      });
      router.back();
    } catch {
      Alert.alert("Error", "Could not save city. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = name.trim().length > 0 && !isSaving;
  const introCopy = userPhotoUri
    ? "You're using a photo from your library."
    : "Start typing a city and we'll find a fitting photo automatically.";

  return (
    <View style={styles.root}>
      {activePhotoUrl ? (
        <Image
          source={{ uri: activePhotoUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          onLoadStart={() => setIsImageLoading(true)}
          onLoad={() => setIsImageLoading(false)}
          onError={() => {
            setIsImageLoading(false);
            setPhotoError("Could not load the photo. Please try again.");
          }}
        />
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={SCRIM_COLORS}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {showSpinner ? (
        <View style={styles.loaderOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Palette.paper0} />
        </View>
      ) : null}

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <IconButton
            icon="close"
            onPress={() => router.back()}
            accessibilityLabel="Close"
            style={styles.closeButton}
            color={Palette.paper0}
            size={36}
            iconSize={22}
            activeOpacity={0.8}
            hitSlop={8}
          />
        </View>

        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.body}>
            <View style={styles.topSpacer} />

            <View style={styles.intro}>
              <Text style={styles.introText}>{introCopy}</Text>

              {photoError ? (
                <View style={styles.noticeRow}>
                  <AlertCircle size={14} color={Palette.paper0} />
                  <Text style={styles.noticeText}>{photoError}</Text>
                </View>
              ) : null}

              <View style={styles.tertiaryRow}>
                {suggestedPhotoUrl && !userPhotoUri ? (
                  <TouchableOpacity
                    onPress={handleTryAnother}
                    disabled={isFetchingPhoto}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tertiaryMuted}>Try another</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={handlePickFromLibrary}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tertiary}>
                    {userPhotoUri ? "Change photo" : "Choose from library"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bottomSpacer} />

            <View style={styles.form}>
              <Input
                tone="onImage"
                label="City name"
                placeholder="e.g. Tokyo, Paris, New York"
                value={name}
                onChangeText={handleNameChange}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Input
                tone="onImage"
                label="Country"
                containerStyle={styles.countryField}
                placeholder="e.g. Japan, France, USA"
                value={country}
                onChangeText={handleCountryChange}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !canSave && styles.createButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!canSave}
                activeOpacity={0.9}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.accent} />
                ) : (
                  <Text style={[Typography.button, styles.createButtonText]}>
                    Create city
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.ink900,
  },
  fill: {
    flex: 1,
  },
  topSpacer: {
    flex: 0.1,
  },
  bottomSpacer: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
  },
  closeButton: {
    backgroundColor: "rgba(20,32,26,0.4)",
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.space4,
  },
  intro: {
    gap: Spacing.space3,
  },
  introText: {
    ...Typography.body,
    color: Palette.paper0,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space2,
  },
  noticeText: {
    ...Typography.secondary,
    color: Palette.paper0,
    flexShrink: 1,
  },
  tertiaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space6,
  },
  tertiary: {
    ...Typography.label,
    color: Palette.paper0,
  },
  tertiaryMuted: {
    ...Typography.label,
    color: Palette.paper300,
  },
  form: {
    paddingBottom: Spacing.space2,
  },
  countryField: {
    marginTop: Spacing.space4,
  },
  createButton: {
    marginTop: Spacing.space6,
    borderRadius: 14,
    paddingVertical: Spacing.space4,
    alignItems: "center",
    backgroundColor: Palette.paper0,
  },
  createButtonDisabled: {
    backgroundColor: "rgba(251,250,245,0.4)",
  },
  createButtonText: {
    color: Palette.forest800,
  },
});
