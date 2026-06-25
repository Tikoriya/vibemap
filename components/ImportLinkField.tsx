import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { useImportLink } from "@/hooks/useImportLink";
import { ImportedSpot } from "@/lib/services/import";
import { AlertCircle } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Props = {
  onImported: (spot: ImportedSpot) => void;
  label?: string;
};

export const ImportLinkField = (props: Props) => {
  const { onImported, label = "Import from link" } = props;
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { importLink, isImporting, importError, resetImport } = useImportLink();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const result = await importLink(trimmed);
      onImported(result);
      setUrl("");
    } catch {
      // error is surfaced via importError from the hook
    }
  };

  const handleChangeText = (text: string) => {
    setUrl(text);
    if (importError) resetImport();
  };

  const canImport = url.trim().length > 0 && !isImporting;
  const isActive = !!importError || isFocused;
  const borderColor = importError
    ? theme.error
    : isFocused
      ? theme.accent
      : theme.border;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.row,
          { borderBottomColor: borderColor, borderBottomWidth: isActive ? 2 : 1 },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Paste a link to import a spot…"
          placeholderTextColor={theme.textMuted}
          value={url}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          onSubmitEditing={handleImport}
          editable={!isImporting}
        />

        {isImporting ? (
          <ActivityIndicator
            size="small"
            color={theme.accent}
            style={styles.trailing}
          />
        ) : (
          <TouchableOpacity
            onPress={handleImport}
            disabled={!canImport}
            activeOpacity={0.7}
            style={styles.trailing}
          >
            <Text
              style={[
                styles.importButton,
                { color: canImport ? theme.accent : theme.textMuted },
              ]}
            >
              Import
            </Text>
          </TouchableOpacity>
        )}

        {importError ? (
          <AlertCircle size={18} color={theme.error} style={styles.trailing} />
        ) : null}
      </View>

      {importError ? (
        <Text style={[styles.error, { color: theme.error }]}>{importError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.space2,
  },
  label: {
    ...Typography.label,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.space2,
  },
  input: {
    ...Typography.body,
    flex: 1,
    padding: 0,
  },
  trailing: {
    marginLeft: Spacing.space2,
  },
  importButton: {
    ...Typography.button,
  },
  error: {
    ...Typography.secondary,
  },
});
