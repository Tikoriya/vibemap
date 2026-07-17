// Dev helper to test the Gemini Vision screenshot path of parse-link.
// Usage: node supabase/functions/parse-link/test-image.mjs path/to/screenshot.png
import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node test-image.mjs <path-to-screenshot>");
  process.exit(1);
}

const URL = "https://gcyldtyfmelfgpytrzpr.supabase.co/functions/v1/parse-link";
const KEY = "sb_publishable_uPidKhITRvv11PoXpQ6DZw_wuT_d2Lq";

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
