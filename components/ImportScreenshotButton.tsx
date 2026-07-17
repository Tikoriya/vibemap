import { Colors } from "@/constants/Colors";
import { Radius, Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { useImportImage } from "@/hooks/useImportImage";
import { ImportedSpot } from "@/lib/services/import";
import * as ImagePicker from "expo-image-picker";
import { AlertCircle, Image as ImageIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Props = {
  onImported: (spot: ImportedSpot, sourceUri: string) => void;
};

export const ImportScreenshotButton = (props: Props) => {
  const { onImported } = props;
  const { importImage, isImporting, importError, resetImport } =
    useImportImage();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const handlePress = async () => {
    if (importError) resetImport();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access in Settings to import from a screenshot.",
      );
      return;
    }

    // quality < 1 re-encodes to a compressed JPEG, keeping the base64 payload
    // small while staying sharp enough for Gemini to read the text.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.base64) {
      Alert.alert("Error", "Could not read that image. Please try another one.");
      return;
    }

    try {
      const spot = await importImage({
        image: asset.base64,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      onImported(spot, asset.uri);
    } catch {
      // surfaced via importError below
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: importError ? theme.error : theme.accent,
            backgroundColor: theme.surface,
          },
        ]}
        onPress={handlePress}
        disabled={isImporting}
        activeOpacity={0.85}
      >
        {isImporting ? (
          <ActivityIndicator size="small" color={theme.accent} />
        ) : (
          <>
            <ImageIcon size={18} color={theme.accent} />
            <Text style={[styles.label, { color: theme.accent }]}>
              Import from a screenshot
            </Text>
          </>
        )}
      </TouchableOpacity>

      {importError ? (
        <View style={styles.errorRow}>
          <AlertCircle size={16} color={theme.error} />
          <Text style={[styles.error, { color: theme.error }]}>
            {importError}
          </Text>
        </View>
      ) : (
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Screenshot an Instagram post, reel, or profile — we&apos;ll read the
          place from it.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.space2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.space2,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.space3,
  },
  label: {
    ...Typography.button,
  },
  hint: {
    ...Typography.secondary,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space1,
  },
  error: {
    ...Typography.secondary,
    flex: 1,
  },
});
