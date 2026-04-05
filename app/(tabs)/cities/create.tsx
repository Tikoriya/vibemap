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
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { FontFamily, Typography } from "@/constants/Typography";
import { useCities } from "@/hooks/useCities";
import { unsplashService } from "@/lib/services/unsplash";
import { useAuthStore } from "@/lib/store";

const CITY_GRADIENTS: [string, string][] = [
  ["#C4572A", "#E8965A"],
  ["#5B7FA8", "#A8C5D8"],
  ["#4A7C59", "#85B89A"],
  ["#8B6FAD", "#C4A8E0"],
  ["#8B5E3C", "#C49060"],
  ["#2D3A5E", "#5B7FA8"],
];

function gradientForName(name: string): [string, string] {
  if (!name) return CITY_GRADIENTS[0];
  return CITY_GRADIENTS[name.charCodeAt(0) % CITY_GRADIENTS.length];
}

export default function CreateCityScreen() {
  const [name, setName] = useState("");
  const [suggestedPhotoUrl, setSuggestedPhotoUrl] = useState<string | null>(null);
  const [photoPage, setPhotoPage] = useState(1);
  const [userPhotoUri, setUserPhotoUri] = useState<string | null>(null);
  const [isFetchingPhoto, setIsFetchingPhoto] = useState(false);
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

  const fetchPhoto = useCallback(async (query: string, page: number) => {
    setIsFetchingPhoto(true);
    try {
      const photo = await unsplashService.searchCityPhoto(query, page);
      setSuggestedPhotoUrl(photo?.urls.regular ?? null);
    } finally {
      setIsFetchingPhoto(false);
    }
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    setUserPhotoUri(null);
    setSuggestedPhotoUrl(null);
    setPhotoPage(1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) return;

    debounceRef.current = setTimeout(() => fetchPhoto(text.trim(), 1), 600);
  }, [fetchPhoto]);

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
      setUserPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await createCity({
        name: name.trim(),
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

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Photo preview */}
        <View style={styles.photoContainer}>
          {activePhotoUrl ? (
            <Image
              source={{ uri: activePhotoUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
          )}

          {isFetchingPhoto && (
            <View style={styles.photoLoader}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}

          {activePhotoUrl && !isFetchingPhoto && (
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.45)"]}
              style={StyleSheet.absoluteFill}
            />
          )}
        </View>

        {/* Photo actions */}
        <View style={styles.photoActions}>
          {suggestedPhotoUrl !== null && userPhotoUri === null && (
            <TouchableOpacity
              onPress={handleTryAnother}
              disabled={isFetchingPhoto}
              activeOpacity={0.7}
            >
              <Text style={[styles.photoActionText, { color: theme.textSecondary }]}>
                Try another
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handlePickFromLibrary} activeOpacity={0.7}>
            <Text style={[styles.photoActionText, { color: theme.accent }]}>
              {userPhotoUri ? "Change photo" : "Choose from library"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={[styles.form, { borderTopColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            City name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
            placeholder="e.g. Tokyo, Paris, New York"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={handleNameChange}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: canSave ? theme.accent : theme.border },
          ]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[Typography.button, styles.saveButtonText]}>
              Save city
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  photoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
  },
  photoLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    paddingVertical: 12,
  },
  photoActionText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
});
