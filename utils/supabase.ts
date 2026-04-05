import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://gcyldtyfmelfgpytrzpr.supabase.co";
const publicKey = "sb_publishable_uPidKhITRvv11PoXpQ6DZw_wuT_d2Lq";
export const supabase = createClient(supabaseUrl, publicKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
  global: {
    // Force React Native's native fetch — prevents cross-fetch from falling back
    // to the XHR-based whatwg-fetch polyfill, which is flaky in the iOS Simulator.
    fetch: fetch.bind(globalThis),
  },
});
