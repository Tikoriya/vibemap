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
  /**
   * Compact variant used when the button sits alongside another action
   * (e.g. next to "Import from link"). Drops the helper hint and lets the
   * button flex to share row width.
   */
  compact?: boolean;
  /** Fired the moment the button is tapped, before the picker opens. */
  onPress?: () => void;
};

export const ImportScreenshotButton = (props: Props) => {
  const { onImported, compact = false, onPress } = props;
  const { importImage, isImporting, importError, resetImport } =
    useImportImage();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const handlePress = async () => {
    onPress?.();
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
      Alert.alert(
        "Error",
        "Could not read that image. Please try another one.",
      );
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
    <View style={[styles.container, compact && styles.containerCompact]}>
      <TouchableOpacity
        style={[
          styles.button,
          compact && styles.buttonCompact,
          {
            borderColor: importError ? theme.error : theme.border,
            backgroundColor: theme.surface,
          },
        ]}
        onPress={handlePress}
        disabled={isImporting}
        activeOpacity={0.85}
      >
        {isImporting ? (
          <ActivityIndicator size="small" color={theme.text} />
        ) : (
          <>
            <ImageIcon size={26} color={theme.text} strokeWidth={1} />
            <Text
              style={[styles.label, { color: theme.text }]}
              numberOfLines={1}
            >
              {compact ? "Import screenshot" : "Import from a screenshot"}
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
      ) : compact ? null : (
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
  containerCompact: {
    flex: 1,
  },
  button: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.space2,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space3,
  },
  buttonCompact: {
    paddingHorizontal: Spacing.space2,
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
