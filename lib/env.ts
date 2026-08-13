// Everything here ships inside the JS bundle: Expo inlines `EXPO_PUBLIC_*` at
// build time, so these values can be read straight out of a released binary.
// Only keys that are safe to expose belong here — the Supabase publishable key
// (guarded by RLS) and the Google key (guarded by app restrictions in Cloud
// Console). A service-role key or any server-side secret must never be added.
//
// Each variable has to be written out as a full static expression; a dynamic
// lookup such as process.env[name] is not substituted and reads as undefined.

const requireEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill in the values.`,
    );
  }
  return value;
};

export const supabaseUrl = requireEnv(
  "EXPO_PUBLIC_SUPABASE_URL",
  process.env.EXPO_PUBLIC_SUPABASE_URL,
);

export const supabasePublishableKey = requireEnv(
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

// Optional — each powers a single feature that reports its own failure, so a
// missing key degrades that screen instead of blocking app startup.
export const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export const unsplashAccessKey = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
