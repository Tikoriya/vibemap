import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Elevation, Radius, Spacing } from "@/constants/Theme";
import { FontFamily, Typography } from "@/constants/Typography";

export type SegmentedTab<T extends string> = {
  key: T;
  label: string;
};

type SegmentedTabsProps<T extends string> = {
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (key: T) => void;
};

export const SegmentedTabs = <T extends string>(
  props: SegmentedTabsProps<T>,
) => {
  const { tabs, value, onChange } = props;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface },
        Elevation.card,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === value;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.text : theme.textMuted,
                  fontFamily: isActive
                    ? FontFamily.bold
                    : FontFamily.semiBold,
                },
              ]}
            >
              {tab.label}
            </Text>
            {isActive ? (
              <View
                style={[styles.underline, { backgroundColor: theme.accent }]}
              />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: Radius.xl,
    paddingVertical: Spacing.space3,
    paddingHorizontal: Spacing.space2,
  },
  tab: {
    paddingHorizontal: Spacing.space4,
    alignItems: "center",
  },
  label: {
    ...Typography.button,
    fontSize: 16,
  },
  underline: {
    alignSelf: "stretch",
    height: 2.5,
    borderRadius: Radius.full,
    marginTop: Spacing.space1,
  },
});
