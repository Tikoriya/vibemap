import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors, Palette } from "@/constants/Colors";
import { FontFamily } from "@/constants/Typography";
import { Radius } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/supabase/auth";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const displayName = user?.user_metadata?.full_name as string | undefined;

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await authApi.logout();
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.accentSubtle }]}>
          <Text style={[styles.avatarInitial, { color: theme.accent }]}>
            {initial}
          </Text>
        </View>
        {displayName ? (
          <Text style={[styles.name, { color: theme.text }]}>
            {displayName}
          </Text>
        ) : null}
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
            Plan
          </Text>
          <Text style={[styles.rowValue, { color: theme.text }]}>Free</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.border }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarInitial: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 32,
  },
  name: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
  section: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
  },
  rowValue: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: Palette.closed,
  },
});
