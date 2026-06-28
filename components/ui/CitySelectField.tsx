import { AlertCircle, Check, ChevronDown, MapPin } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Elevation, Radius, Spacing } from "@/constants/Theme";
import { Typography } from "@/constants/Typography";
import { CityWithCount } from "@/types";

type CitySelectFieldProps = {
  label?: string;
  cities: CityWithCount[];
  value: number | null;
  onChange: (cityId: number) => void;
  error?: string;
  /** When true the city is fixed (e.g. opened from a city) and cannot change. */
  locked?: boolean;
};

export const CitySelectField = (props: CitySelectFieldProps) => {
  const { label = "City", cities, value, onChange, error, locked } = props;

  const [isOpen, setIsOpen] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const selected = cities.find((city) => city.id === value) ?? null;
  const borderColor = error ? theme.error : theme.border;

  const handleSelect = (cityId: number) => {
    onChange(cityId);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      ) : null}

      <Pressable
        style={[
          styles.field,
          { borderBottomColor: borderColor, borderBottomWidth: error ? 2 : 1 },
        ]}
        onPress={() => !locked && setIsOpen(true)}
        disabled={locked}
        accessibilityRole="button"
        accessibilityLabel={
          selected ? `City: ${selected.name}` : "Select a city"
        }
      >
        <MapPin size={18} color={theme.textSecondary} strokeWidth={2} />
        <Text
          style={[
            styles.value,
            { color: selected ? theme.text : theme.textMuted },
          ]}
          numberOfLines={1}
        >
          {selected ? selected.name : "Select a city"}
        </Text>
        {locked ? null : error ? (
          <AlertCircle size={18} color={theme.error} />
        ) : (
          <ChevronDown size={18} color={theme.textSecondary} strokeWidth={2} />
        )}
      </Pressable>

      {error ? (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      ) : null}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: theme.surface },
              Elevation.sheet,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[Typography.title, styles.sheetTitle, { color: theme.text }]}>
              Choose a city
            </Text>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              ItemSeparatorComponent={() => (
                <View
                  style={[styles.separator, { backgroundColor: theme.border }]}
                />
              )}
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowText}>
                      <Text
                        style={[styles.rowName, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {item.country ? (
                        <Text
                          style={[
                            styles.rowMeta,
                            { color: theme.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {item.country}
                        </Text>
                      ) : null}
                    </View>
                    {active ? (
                      <Check size={18} color={theme.accent} strokeWidth={2.5} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: theme.textSecondary }]}>
                  No cities yet. Create one first.
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space2,
    paddingVertical: Spacing.space2,
  },
  value: {
    ...Typography.body,
    flex: 1,
  },
  error: {
    ...Typography.secondary,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20,32,26,0.4)",
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space8,
    maxHeight: "70%",
  },
  sheetTitle: {
    marginBottom: Spacing.space2,
  },
  list: {
    flexGrow: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.space3,
    gap: Spacing.space3,
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    ...Typography.cardTitle,
  },
  rowMeta: {
    ...Typography.secondary,
    marginTop: 2,
  },
  empty: {
    ...Typography.body,
    paddingVertical: Spacing.space4,
    textAlign: "center",
  },
});
