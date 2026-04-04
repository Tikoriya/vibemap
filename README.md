# VibeMap

> Your personal map of places worth remembering.

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

**Authentication**
- Sign in with Apple
- Sign in with Google
- Magic link via email (no password required)
- Persistent session — users stay logged in until they log out or delete the app

**Cities**
- Create a city with a name, country, and cover photo
- Cover photo auto-suggested from Unsplash when a city name is typed; user can replace with their own photo
- City list displayed as a 2-column image card grid
- Edit and delete cities

**Spots**
- Create a spot using Google Places autocomplete — selecting a result auto-fills name, address, latitude/longitude
- Add a cover photo (from camera roll or camera)
- Add personal notes
- Add tags from a predefined list or create custom ones
- View spots as a scrollable list inside a city
- Edit and delete spots
- Spot detail screen with image, address, tags, notes, website, phone, and an "Open in Maps" button

**Tags**
- Predefined tag library: Cocktails, Coffee, Work-friendly, Fancy, Casual, Brunch, Nightlife, Nature, and more
- Custom tag creation
- Tags are color-coded by vibe category
- Filter spots in a city by one or more tags

**Profile**
- Account screen with name, avatar (pulled from OAuth provider), and logout

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

**Import from a link**
- Paste any URL (Google Maps link, restaurant website, etc.) into the Create Spot screen
- The app extracts the place name, address, coordinates, website, and phone number automatically via a backend function
- The form is pre-filled — user adds tags, picks a city, and saves

**Import from Instagram, TikTok, or any app**
- iOS: share directly from Instagram/TikTok/Chrome using the native iOS Share Sheet — VibeMap appears as a destination
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

| Layer | Technology |
|---|---|
| Mobile framework | React Native + Expo SDK 53 |
| Navigation | Expo Router (file-based) |
| Backend / database | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Server state | React Query v5 |
| Client state | Zustand v5 |
| Maps | react-native-maps |
| Place search | Google Places API |
| City images | Unsplash API |
| Authentication | Supabase Auth (magic link, Apple, Google) |
| Share Extension | expo-share-intent |
| Image picker | expo-image-picker |
| Animations | react-native-reanimated |
| Haptics | expo-haptics |
| Fonts | DM Sans via @expo-google-fonts/dm-sans |
| Build | EAS Build (Expo) |
| Product analytics | PostHog (`posthog-react-native`) |
| Crash reporting | Sentry (`@sentry/react-native`) |
| In-app purchases | RevenueCat (Phase 5) |

---

## Design System

**Color palette — "Late Night Editorial"**

A warm-neutral base so food and travel photography sits naturally in the UI without clashing with the chrome.

| Token | Light | Dark |
|---|---|---|
| Background | `#F7F4F0` | `#141210` |
| Surface / cards | `#FFFFFF` | `#1F1C19` |
| Text primary | `#1A1714` | `#F2EDE6` |
| Text secondary | `#8C8078` | `#9E9488` |
| Primary accent | `#C4703A` | `#D4845A` |

**Semantic tag colors**

| Tag | Color |
|---|---|
| Cocktails / Drinks | `#C4572A` |
| Coffee | `#8B5E3C` |
| Food / Brunch | `#D4933A` |
| Fancy / Upscale | `#8B6FAD` |
| Work-friendly | `#4A7C59` |
| Casual / Chill | `#5B7FA8` |
| Nightlife / Bars | `#2D3A5E` |
| Nature / Outdoor | `#5A7A4A` |
| Custom tags | `#8C8078` |

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
