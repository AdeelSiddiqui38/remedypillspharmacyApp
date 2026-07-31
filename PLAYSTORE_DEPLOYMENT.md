# Remedy Pills Pharmacy — Google Play Store Deployment Guide

Your Android app is a Capacitor shell that loads the live site at `https://app.remedypills.ca`. That means deployment happens in three stages, in this order — the app is an empty screen until the backend is live, and Google's reviewers will open it.

---

## Stage 1 — Deploy the backend (do this first)

Follow your existing `DEPLOYMENT.md` (DigitalOcean App Platform, TOR1 region for Alberta data-residency). Summary of what must be true before touching the Play Store:

1. Managed Postgres cluster in TOR1; run `npm run db:push` against it, and create the `session` table (connect-pg-simple needs it — run the SQL from `node_modules/connect-pg-simple/table.sql` once).
2. App Platform web service from the GitHub repo, all env vars from `.env.example` set — including the new `DATABASE_CA_CERT` (download the CA cert from the DO database dashboard).
3. Custom domain `app.remedypills.ca` pointed at the App Platform service with a valid HTTPS certificate (DO provisions this automatically once the CNAME is in place at your DNS host).
4. Verify in a normal browser: registration, login, prescriptions, appointments all work at `https://app.remedypills.ca`.
5. Verify your privacy policy renders at a public URL, e.g. `https://app.remedypills.ca/privacy` — Google requires this link and checks it. (The app already has `privacy-page.tsx`, so this should just work once deployed.)

If you deploy under a different domain than `app.remedypills.ca`, update `productionUrl` in `capacitor.config.ts` before building.

## Stage 2 — Google Play Developer account

1. Go to `play.google.com/console/signup` and register. One-time US$25 fee.
2. Register as an **organization** if you can rather than a personal account — organization accounts skip the "12 testers for 14 days" closed-testing requirement that personal accounts created after Nov 2023 must satisfy, and look more trustworthy for a health app. Organization registration needs a D-U-N-S number, which you already have:

   | Field | Value |
   |---|---|
   | Legal entity name | **Remedy Pills Inc** |
   | D-U-N-S Number | **24-337-1905** (`243371905`) |
   | Business address | Unit #135, 246 Nolanridge Crescent NW, Calgary, AB T3R 1W9 |

   Enter the legal entity as **`Remedy Pills Inc`** — it must match the Dun & Bradstreet record exactly. "Remedy Pills Pharmacy" is the app/trade name and belongs in the store listing, not the legal entity field. The same D-U-N-S number works for both Google Play and Apple.
3. Complete identity verification. This can take a few days — start it early and do Stage 1 while you wait.

## Stage 3 — Build, sign, and submit

### 3a. Create your signing keystore (once, on your Mac)

```bash
cd android
keytool -genkey -v -keystore remedypills-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias remedypills
```

Then create `android/keystore.properties` (both files are already gitignored — never commit them):

```properties
storeFile=remedypills-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=remedypills
keyPassword=YOUR_KEY_PASSWORD
```

Back up the `.jks` file and passwords somewhere safe (password manager + offline copy). With Play App Signing, Google holds the final signing key, but you still need this upload key for every release.

### 3b. Build the release bundle

```bash
npm install
CAPACITOR_ENV=production npx cap sync android
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Before building, sanity-check `android/app/build.gradle`: `versionCode 1`, `versionName "1.0"` are correct for a first release. Every future upload must increment `versionCode`.

Test the release build on a real device first: `./gradlew assembleRelease` produces an APK you can `adb install`.

### 3c. Create the app in Play Console

App name **Remedy Pills Pharmacy**, default language English (Canada), type App, Free.

Then work through the **Set up your app** checklist. The answers for this app:

**Privacy policy:** `https://app.remedypills.ca/privacy`

**App access:** the app requires login, so provide reviewer credentials. Create a dedicated test patient account (e.g. `playstore-review` with a strong password and no real health data) and enter it under "All or some functionality is restricted". Reviewers will actually log in.

**Ads:** No. **App category:** Medical. **Contact details:** your pharmacy email and phone.

**Content rating questionnaire:** category "Utility/Productivity/Communication or other" — answer no to all violence/sexual content questions; result should be Everyone.

**Target audience:** 18 and over (this avoids Play Families requirements; a pharmacy app has no business targeting children).

**Health apps declaration:** Play now has a dedicated health-apps section. Declare it as a health & wellness / medical app that handles personal health information. Do not declare it a "medical device" — it manages pharmacy logistics, not diagnosis or treatment decisions.

**Data safety form** — this one matters and must match reality. Declare:

| Question | Answer |
|---|---|
| Does your app collect or share user data? | Collects: yes. Shares: no. |
| Personal info | Name, email, phone, date of birth — collected, not shared, required for account |
| Health info | Health information (prescriptions, health logs, calorie logs) — collected, not shared |
| Messages | In-app messages to the pharmacy — collected, not shared |
| Data encrypted in transit? | Yes (HTTPS everywhere) |
| Can users request deletion? | Yes — you must actually honor this; your retention sweep + admin delete covers it. Also provide a "delete account" contact path in the privacy policy. |
| Purpose | App functionality only. No advertising, no analytics SDKs (true — the app has none). |

### 3d. Store listing

Ready-to-paste copy — edit freely:

**Short description (80 chars max):**
"Refills, reminders, and pharmacist appointments from Remedy Pills Pharmacy."

**Full description:**
"The official app of Remedy Pills Pharmacy. Request prescription refills and track when they're ready for pickup, set medication reminders so you never miss a dose, book appointments with your pharmacist, transfer prescriptions from another pharmacy, message our team directly, and keep simple health logs — blood pressure, glucose, and more. Designed to be easy to read and easy to tap, for patients of every age. Your health information is stored securely in Canada and is never sold or shared."

**Graphics you must prepare:** app icon 512×512 PNG (export from `assets/icon.png`), feature graphic 1024×500, and at least 4 phone screenshots (take them from the release build on a real device or emulator — Pixel 6 size works well). Screenshots of the home, prescriptions, reminders, and appointments tabs would represent the app honestly.

### 3e. Submit

1. Play Console → Testing → **Internal testing** → create a release, upload the `.aab`, add yourself as a tester, and confirm the app works installed from Play.
2. If you registered as a personal account: run the required closed test (12 testers, 14 days) before production access is granted. Organization accounts skip this.
3. Promote to **Production**, complete any remaining checklist items, and submit for review. First reviews of health apps commonly take 3–7 days.

---

## Honest risk note: the "WebView wrapper" policy

Google's minimum-functionality policy rejects apps that are just a website in a WebView with nothing native added. Capacitor apps that load a remote URL (like this one) sit close to that line. Many pass — especially branded apps for a real business with login-gated functionality, which this is — but if you get rejected on "Minimum functionality," the fix is to add genuinely native behavior. The highest-value option here is **local push notifications for medication reminders** (`@capacitor/local-notifications`): reminders that fire even when the app is closed are both a real win for older patients and unambiguous native functionality. Consider adding it before submission rather than after a rejection; happy to build it with you.

## Version-update routine (for later)

Backend changes deploy instantly (the shell loads the live site — no store release needed). You only ship a new AAB when the native shell changes: bump `versionCode`/`versionName` in `android/app/build.gradle`, rebuild, upload to a new release.
