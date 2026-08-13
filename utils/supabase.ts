import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // PKCE is the recommended flow for native: the magic link redirects back
    // with a `?code=` we exchange in app/auth/callback.tsx.
    flowType: "pkce",
    // Web-only option — on native, deep links are handled by the callback route.
    detectSessionInUrl: false,
  },
  global: {
    // Force React Native's native fetch — prevents cross-fetch from falling back
    // to the XHR-based whatwg-fetch polyfill, which is flaky in the iOS Simulator.
    fetch: fetch.bind(globalThis),
  },
});
