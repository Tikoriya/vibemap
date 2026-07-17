import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Palette } from "@/constants/Colors";
import { FontFamily } from "@/constants/Typography";
import { supabase } from "@/utils/supabase";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error_description?: string;
  }>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const completeSignIn = async () => {
      const code = typeof params.code === "string" ? params.code : undefined;
      if (!code) {
        console.error("Magic link callback missing code", params);
        router.replace("/login");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Magic link exchange failed", error);
        router.replace("/login");
        return;
      }

      router.replace("/(tabs)/cities");
    };

    completeSignIn();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Palette.forest800} />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.paper100,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  text: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Palette.subtleText,
  },
});
