import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { Slot } from "expo-router";
import { useEffect } from "react";
import "react-native-get-random-values";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import { initAuth } from "@/utils/initAuth";
import { supabase } from "@/utils/supabase";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      const { queryParams } = Linking.parse(url);
      const code = queryParams?.code;
      if (typeof code === "string") {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
      <Toast />
    </QueryClientProvider>
  );
}
