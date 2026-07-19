# Release Guide

This document describes how to distribute Tukka to testers via **TestFlight** (iOS) and **Google Play Internal Testing** (Android), using **EAS Build** for artifact creation.

Testers install the app once from an invite email and receive automatic update notifications for every new release.

---

## Phase 0 — Accounts to create (once)

Estimated total: ~30 min of active work, plus 24–48h of waiting for Apple to activate.

1. **Apple Developer Program** — $99/yr — <https://developer.apple.com/programs/enroll>
   - Enroll as **Individual** unless you have a registered company (Organization requires a D-U-N-S number).
   - Activation takes 24–48h.
2. **Google Play Console** — $25 one-time — <https://play.google.com/console/signup>
   - Choose **Personal** account type (no D-U-N-S needed).
   - Activates in ~15 min.
3. **Expo account** — free — <https://expo.dev/signup>
   - Required for EAS Build.

You can start Phase 1 while Apple's approval is pending.

---

## Phase 1 — Local + project setup (once)

### 1.1 Install and log in

```bash
npm install -g eas-cli
eas login
```

### 1.2 Initialize EAS on the project

```bash
eas init
```

Adds `extra.eas.projectId` to `app.json` linking it to your Expo account.

### 1.3 Create `eas.json`

At the repo root:

```json
{
  "cli": { "version": ">= 16.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_EMAIL",
        "ascAppId": "APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

`eas.json` must exist before `eas build:version:set` — since EAS CLI 12+ the command writes `appVersionSource` into that file and errors out if it's missing.

### 1.4 Configure remote versioning

```bash
eas build:version:set
```

Pick **remote** for both platforms when prompted. EAS will manage the build number so you don't have to bump it by hand.

### 1.5 Update `package.json` scripts

```json
"build:ios": "eas build --platform ios --profile production",
"build:android": "eas build --platform android --profile production",
"submit:ios": "eas submit --platform ios --latest",
"submit:android": "eas submit --platform android --latest"
```

### 1.6 Ignore secrets

Add to `.gitignore`:

```
play-service-account.json
```

---

## Phase 2 — iOS / TestFlight (once)

### 2.1 Create the app record in App Store Connect

- Go to <https://appstoreconnect.apple.com> → **My Apps** → **+** → **New App**.
- **Platform**: iOS
- **Bundle ID**: `com.tukka.app` (must match `app.json`)
- **Name**: `Tukka`
- **SKU**: any unique string, e.g. `tukka-001`

### 2.2 First build + submit

```bash
npm run build:ios:prod       # ~15-25 min, runs on EAS cloud
npm run submit:ios      # uploads to App Store Connect
```

- First run: EAS asks to generate signing credentials — accept, it handles the certificate and provisioning profile.
- You'll enter your Apple ID and an **app-specific password** (create one at <https://account.apple.com/account/manage> → App-Specific Passwords).

### 2.3 Set up the TestFlight external testing group

In App Store Connect → your app → **TestFlight** tab:

1. Wait for the uploaded build to finish processing (~10 min, you'll get an email).
2. Fill in **Test Information** (email, description, feedback URL) — one-time.
3. **External Testing** → **+** → create a group, e.g. "Beta Testers".
4. Add tester emails.
5. Add the build to the group → **Submit for Beta App Review**.

The first external build waits ~24h for Beta App Review. Subsequent builds go through in minutes with no review.

### 2.4 Tester onboarding (iOS)

Each tester receives an email inviting them to test Tukka. They:

1. Install **TestFlight** from the App Store.
2. Tap the redeem link in the email → **Install**.

From then on, TestFlight auto-updates or shows an update badge on every new release, plus a push notification.

---

## Phase 3 — Android / Play Internal Testing (once)

### 3.1 Create the app in Play Console

- <https://play.google.com/console> → **Create app**
- **App name**: `Tukka`
- **Default language**, **App or Game**: App
- **Free or paid**: Free

Fill the initial questionnaire (ads declaration, content rating, target audience, data safety). ~30 min, tedious but mandatory.

### 3.2 Create a service account for `eas submit`

Follow <https://docs.expo.dev/submit/android/#creating-a-google-service-account-key>. Summary:

1. Play Console → **Setup** → **API access** → link a Google Cloud project → create a service account.
2. In Google Cloud, grant the service account the **Service Account User** role.
3. Download the JSON key → save at the repo root as `play-service-account.json`.
4. Confirm `play-service-account.json` is in `.gitignore` (from step 1.6).
5. Back in Play Console → **API access** → **Grant access** for the service account → **Admin (all permissions)**, or at minimum **Release manager** on the Internal testing track.

### 3.3 First build + first manual upload

The very first build must be uploaded manually — Play Console won't accept API submissions until an artifact exists in the track.

```bash
npm run build:android:prod        # produces an AAB
```

- Download the AAB from the EAS build page.
- Play Console → **Testing** → **Internal testing** → **Create new release** → upload the AAB → save & roll out.

### 3.4 Set up the tester list

**Internal testing** → **Testers** tab:

1. Create an email list, add tester emails.
2. Copy the **opt-in URL** at the bottom of the page.
3. Email that URL to your testers.

### 3.5 From now on, submit via CLI

```bash
npm run submit:android
```

Uses the service account to push new builds straight to the Internal testing track — no manual upload.

### 3.6 Tester onboarding (Android)

Each tester:

1. Opens the opt-in URL on their Android phone.
2. Taps **Become a tester** → **Download it on Google Play** → install.

From then on, updates arrive automatically through the Play Store like any normal app.

---

## Phase 4 — The release loop (every new version)

Whenever you want to ship an update:

```bash
npm run build:ios:prod && npm run submit:ios
npm run build:android:prod && npm run submit:android
```

- Build numbers auto-increment (thanks to Phase 1.3).
- Bump the marketing version in `app.json` (`"version": "1.0.1"`) only when you want testers to see a new user-facing version number.
- TestFlight and Play Store notify testers automatically.

### Optional — OTA updates for JS-only changes

For fixes that don't touch native code (no new native modules, no `app.json` native config changes), skip the rebuild entirely:

```bash
npx expo install expo-updates
eas update:configure          # one-time
eas update --branch production --message "fix login bug"
```

Testers get the new JS bundle the next time they open the app — no reinstall, no email.

---

## Troubleshooting

| Symptom                                                   | Fix                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `eas submit` iOS asks for password every time             | Save the app-specific password in your login keychain or set `EXPO_APPLE_APP_SPECIFIC_PASSWORD` in your shell env. |
| Play Console rejects the AAB: "Version code already used" | Ensure `autoIncrement: true` is set in the `production` profile in `eas.json` and versioning is `remote`.          |
| iOS build fails on credentials                            | Run `eas credentials` and let EAS regenerate the certificate + provisioning profile.                               |
| TestFlight build stuck "Processing" for >1h               | Contact Apple support — usually resolves itself, occasionally the upload needs to be re-submitted.                 |
