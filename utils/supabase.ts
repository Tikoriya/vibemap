import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://gcyldtyfmelfgpytrzpr.supabase.co";
const publicKey = "sb_publishable_uPidKhITRvv11PoXpQ6DZw_wuT_d2Lq";
export const supabase = createClient(supabaseUrl, publicKey, {
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
