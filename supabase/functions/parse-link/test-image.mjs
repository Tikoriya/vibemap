// Dev helper to test the Gemini Vision screenshot path of parse-link.
// Runs under plain Node, so it reads .env itself rather than relying on Expo:
// node --env-file=.env supabase/functions/parse-link/test-image.mjs path/to/screenshot.png
import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error(
    "Usage: node --env-file=.env test-image.mjs <path-to-screenshot>",
  );
  process.exit(1);
}

const BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!BASE_URL || !KEY) {
  console.error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Run with --env-file=.env",
  );
  process.exit(1);
}

const URL = `${BASE_URL}/functions/v1/parse-link`;

const ext = path.split(".").pop().toLowerCase();
const mimeType =
  ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
const image = readFileSync(path).toString("base64");

const res = await fetch(URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${KEY}`,
    apikey: KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ image, mimeType }),
});

console.log("HTTP", res.status);
console.log(JSON.stringify(await res.json(), null, 2));
