import { Colors } from "@/constants/Colors";
import { FontFamily, Typography } from "@/constants/Typography";
import { ImportedSpot } from "@/lib/services/import";
import { useImportLink } from "@/hooks/useImportLink";
import React, { useState } from "react";
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
};

export const ImportLinkField = (props: Props) => {
  const { onImported } = props;
  const [url, setUrl] = useState("");
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

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.row,
          {
            borderColor: importError ? "#D94F3D" : theme.border,
            backgroundColor: theme.surface,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Paste a link to import a spot…"
          placeholderTextColor={theme.textSecondary}
          value={url}
          onChangeText={handleChangeText}
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
            style={styles.action}
          />
        ) : (
          <TouchableOpacity
            onPress={handleImport}
            disabled={!canImport}
            activeOpacity={0.7}
            style={styles.action}
          >
            <Text
              style={[
                styles.importButton,
                { color: canImport ? theme.accent : theme.textSecondary },
              ]}
            >
              Import
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {importError ? (
        <Text style={styles.errorText}>{importError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    paddingVertical: 14,
  },
  action: {
    marginLeft: 8,
  },
  importButton: {
    ...Typography.button,
  },
  errorText: {
    ...Typography.secondary,
    color: "#D94F3D",
    marginLeft: 4,
  },
});
