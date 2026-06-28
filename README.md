# VibeMap

> Your personal map of places worth remembering.

---

## Quick Start

### 1. Restore Supabase (if inactive)

Supabase free tier pauses after 7 days of inactivity.

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open the **VibeMap** project
3. Click **Restore project** — takes ~2 minutes
4. Confirm tables are visible: `cities`, `spots`, `tags`, `spot_tags`

### 1b. Run pending migrations

If the `spots` table is missing the location columns, run this in the Supabase **SQL Editor**:

```sql
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS latitude FLOAT8,
  ADD COLUMN IF NOT EXISTS longitude FLOAT8;
```

If the `cities` table is missing the `country` column (used on the city card), also run:

```sql
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS country TEXT;
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npx expo start --tunnel
```

Then press `i` for iOS simulator or `a` for Android emulator.

### 4. Log in

On the login screen, tap **DEV — Quick login** (only visible in dev mode) to sign in instantly with the test account.

### API Keys (already in source)

All keys are hardcoded directly in the source for now — no `.env` setup required:

| Key                       | File                       |
| ------------------------- | -------------------------- |
| Supabase URL + public key | `utils/supabase.ts`        |
| Unsplash Access Key       | `lib/services/unsplash.ts` |
| Google Places API Key     | `lib/services/google.ts`   |

---

## Build & Run on a Device (dev build)

This app uses native modules (e.g. `react-native-maps`), so it can't run in Expo Go — it
needs a **development build**. Most days you don't rebuild; you just start the dev server
and open the build you already installed.

### Daily loop (no native changes)

```bash
npx expo start
```

Then press `i` (Simulator) or open the installed dev build on your phone.

### When you changed native stuff (added/removed a native package or an `app.json` plugin)

```bash
npx expo prebuild --clean   # regenerate ios/ + android/ from scratch
npx expo run:ios            # build + install on the iOS Simulator (no Apple account needed)
```

### To install on your physical iPhone

1. One-time signing setup — open the native project and pick a Team:

```bash
open ios/vibemap.xcworkspace
```

   In Xcode → **vibemap** target → **Signing & Capabilities** → check **Automatically
   manage signing** → set **Team** to your Apple ID. (Free personal team works; the build
   expires after 7 days.)

2. Build to the device:

```bash
npx expo run:ios --device
```

### Notes

- `run:ios` defaults to a plugged-in iPhone if one is connected — that path needs the
  signing Team above. Unplug it (or use the Simulator) to skip signing.
- **Apple & Google sign-in are removed for now.** `@react-native-google-signin/google-signin`
  broke `pod install`, and `expo-apple-authentication` adds the *Sign In with Apple*
  entitlement, which a **free** Apple account can't sign (it needs the paid Developer
  Program). Reinstall those packages and re-wire the login screen when you enroll in the
  paid program and actually use Apple/Google login.
- TestFlight / EAS Build is only needed later, to distribute to other people's phones.

---

## What is VibeMap?

VibeMap is a mobile app for saving the places that matter to you — not just the address, but the feeling. Bars with great cocktails. Coffee shops where you can actually work. Restaurants worth the hype. Hidden gems you stumbled onto. Any spot you want to remember and find again.

It is built for people who travel often, live across cities, or simply want a more personal and expressive way to keep track of places than a generic Google Maps list. The difference is the vibe layer: every place you save can have custom tags that describe not just what it is, but why it is worth going back to.

---

## The Problem It Solves

Google Maps saved places exist, but they are flat. A list of pins with no way to filter by "work-friendly coffee shops" vs "fancy date night spots" vs "best cocktails in the city." You either remember or you scroll through everything.

Instagram and TikTok constantly surface great place recommendations via ads and posts, but there is no easy way to save them into a personal list without losing the context. A screenshot is not a plan.

VibeMap solves both: a beautiful, organized personal database of places, tagged by vibe, filterable on a map, and quick to add to — including directly from social media with one tap.

---

## Target User

- Expats, frequent travelers, and people who split time between cities
- Anyone who discovers places via Instagram, TikTok, or word of mouth and wants to save them properly
- People who want to remember not just where a place is, but why they liked it or why they want to go

---

## Core Concepts

### Cities

A city is the top-level organizer. You create a city (e.g. Dubai, Lisbon, New York), give it a cover photo, and all your saved spots live inside it. When you visit a city, you open it and immediately see everything you have saved there, filterable by vibe.

### Spots

A spot is a saved place inside a city. It has a name, photo, address, notes, and tags. Spots are created either manually (search via Google Places), by pasting a link (Google Maps, a website), or by sharing directly from Instagram or TikTok.

### Tags

Tags describe the vibe of a spot. There are predefined categories (Cocktails, Coffee, Fancy, Work-friendly, Brunch, Nightlife, Casual, Nature, etc.) and users can add their own custom tags. Tags are color-coded by category so filters are visual and fast to scan.

---

## Features

### Phase 1 — Core MVP

**Authentication** ✅

- [x] Sign in with Apple
- [x] Sign in with Google
- [x] Magic link via email (no password required)
- [x] Persistent session — users stay logged in until they log out or delete the app

**Cities** ✅

- [x] Create a city with a name, country, and cover photo
- [x] Cover photo auto-suggested from Unsplash when a city name is typed; user can replace with their own photo
- [x] City list displayed as a 2-column image card grid
- [x] Edit and delete cities

**Spots** ✅

- [x] Create a spot using Google Places autocomplete — selecting a result auto-fills name, address, latitude/longitude
- [x] Import a spot by pasting any link (Google Maps, restaurant website, Instagram) — form pre-fills automatically via the `parse-link` Edge Function
- [x] Add a cover photo (from camera roll or camera)
- [x] Add personal notes
- [x] Add tags from a predefined list or create custom ones
- [x] View spots as a scrollable list inside a city
- [x] Edit and delete spots
- [x] Spot detail screen with image, address, tags, notes, website, phone, and an "Open in Maps" button

**Tags** ✅

- [x] Predefined tag library: Cocktails, Coffee, Work-friendly, Fancy, Casual, Brunch, Nightlife, Nature, and more
- [x] Custom tag creation
- [x] Tags are color-coded by vibe category
- [x] Filter spots in a city by one or more tags

**Profile** ✅

- [x] Account screen with name, avatar (pulled from OAuth provider), and logout

---

### Phase 2 — Maps

**In-app map view**

- Full-screen map for each city showing all spots as pins
- Pins are color-coded by the spot's primary tag category
- Global map tab showing all spots across all cities
- Tag filter bar on the map — tap a tag to show only matching pins
- Tap a pin to see a bottom sheet with the spot's photo, name, tags, and address
- "Open in Maps" from the bottom sheet to navigate in Apple Maps or Google Maps
- Map centers on the user's current location when opened

**UI polish**

- Animated bottom sheet (spring physics)
- Card press scale feedback
- Haptic feedback on tag selection and spot save
- Skeleton loading states instead of spinners
- Empty state screens for no cities, no spots, no filter results

---

### Phase 3 — Smart Import + Dark Mode

**Import from a link** ✅ (paste-a-link, Phase 3a)

- [x] Paste any URL into the Create Spot screen — Google Maps links (including `maps.app.goo.gl` short links), restaurant websites, and Instagram posts (best-effort) are supported
- [x] The app extracts the place name and resolves it via Google Places — form is pre-filled with name, address, and coordinates
- [x] User reviews, adds tags, and saves — no typing required

**How it works:** A Supabase Edge Function (`supabase/functions/parse-link/`) receives the URL, manually follows HTTP redirects with a plain User-Agent (necessary because Google returns a JS interstitial to browsers), extracts the place name from the URL structure (`?q=` param for Maps links) or from `og:` meta tags for websites, uses Gemini (`gemini-1.5-flash`) to parse messy captions into `{ name, city }`, and resolves the result against Google Places Text Search. Secrets: `GEMINI_API_KEY` and `GOOGLE_PLACES_API_KEY` stored as Supabase function secrets.

**Import from Instagram, TikTok, or any app** (Phase 3b — not yet built)

- iOS: share directly from Instagram/TikTok/Chrome using the native iOS Share Sheet — VibeMap appears as a destination (requires `expo-share-intent` + EAS dev build)
- Android: same via Android Share Intent
- The shared URL is processed automatically and opens a pre-filled Create Spot form

**Dark mode**

- Full dark mode support, respecting the device system setting
- Warm dark palette (`#141210` base) designed to make food and travel photography look cinematic

---

### Phase 4 — Sharing

- Toggle each city list between Private, Share via link, and Public
- Shareable link for a city list that opens a read-only view in the app or a web preview
- Deep linking support so shared links open directly in the app
- Foundation for a public browse feed of curated city lists (creator layer)

---

### Phase 5 — Monetization

- Free tier: limited number of cities and spots
- Pro plan (monthly or annual): unlimited cities and spots, public sharing, priority features
- In-app purchases via RevenueCat (iOS App Store + Google Play)
- Future social features: follow other users, browse public lists, creator profiles

---

## Tech Stack

| Layer              | Technology                                            |
| ------------------ | ----------------------------------------------------- |
| Mobile framework   | React Native + Expo SDK 53                            |
| Navigation         | Expo Router (file-based)                              |
| Backend / database | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Server state       | React Query v5                                        |
| Client state       | Zustand v5                                            |
| Maps               | react-native-maps                                     |
| Place search       | Google Places API                                     |
| City images        | Unsplash API                                          |
| Authentication     | Supabase Auth (magic link, Apple, Google)             |
| Share Extension    | expo-share-intent                                     |
| Image picker       | expo-image-picker                                     |
| Animations         | react-native-reanimated                               |
| Haptics            | expo-haptics                                          |
| Fonts              | DM Sans via @expo-google-fonts/dm-sans                |
| Build              | EAS Build (Expo)                                      |
| Product analytics  | PostHog (`posthog-react-native`)                      |
| Crash reporting    | Sentry (`@sentry/react-native`)                       |
| In-app purchases   | RevenueCat (Phase 5)                                  |

---

## Design System

**Color palette — "Late Night Editorial"**

A warm-neutral base so food and travel photography sits naturally in the UI without clashing with the chrome.

| Token           | Light     | Dark      |
| --------------- | --------- | --------- |
| Background      | `#F7F4F0` | `#141210` |
| Surface / cards | `#FFFFFF` | `#1F1C19` |
| Text primary    | `#1A1714` | `#F2EDE6` |
| Text secondary  | `#8C8078` | `#9E9488` |
| Primary accent  | `#C4703A` | `#D4845A` |

**Semantic tag colors**

| Tag                | Color     |
| ------------------ | --------- |
| Cocktails / Drinks | `#C4572A` |
| Coffee             | `#8B5E3C` |
| Food / Brunch      | `#D4933A` |
| Fancy / Upscale    | `#8B6FAD` |
| Work-friendly      | `#4A7C59` |
| Casual / Chill     | `#5B7FA8` |
| Nightlife / Bars   | `#2D3A5E` |
| Nature / Outdoor   | `#5A7A4A` |
| Custom tags        | `#8C8078` |

**Typography:** DM Sans (Google Fonts) — display 28–32px bold, screen titles 22–24px bold, card titles 16–18px semibold, body 14–15px regular, tag chips 12px medium.

---

## Analytics

VibeMap uses **PostHog** for product analytics and **Sentry** for crash and error reporting. Both are free at the scale of an indie app (PostHog: 1M events/month, Sentry: 5k errors/month).

Analytics are instrumented from Phase 1 so user behaviour data is collected from the first real user. Key events tracked:

- Sign up and login (with method: Apple / Google / magic link)
- City and spot creation, editing, deletion
- Tags applied (to understand which vibes are most popular)
- Map opened and filters applied
- "Open in Maps" tapped
- Import feature usage (URL paste and share extension)
- Screen views and session data

This data informs product decisions: which features are actually used, where users drop off in the create-spot flow, which tag categories are most common, and whether the import feature is worth continuing to invest in.

---

## Project Status

This is an indie side project. The goal is to build something genuinely useful first, then grow it into a platform. Development costs are kept at zero during the build phase using free tiers across all services.

---

## Development Notes

- API keys and Supabase credentials must be stored in `.env` and EAS secrets — never committed to source
- EAS Build replaces Expo Go as the development build method (required for Share Extension native code)
- Supabase free tier: 500MB database, 1GB storage, 50,000 monthly active users — sufficient for MVP and early growth
- Google Places API: $200/month free credit — sufficient for personal and small-scale use
