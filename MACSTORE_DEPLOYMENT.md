# Remedy Pills Pharmacy — Mac App Store Deployment Guide

This is the companion to `PLAYSTORE_DEPLOYMENT.md`. It covers getting **Remedy Pills Pharmacy** onto the **Mac App Store** using the path you chose: **"iPhone/iPad app made available on Apple Silicon Macs."**

Read this first, because it changes how you think about the whole thing:

> **There is no separate "Mac build."** On the path you chose, you do **not** create a macOS target, an Electron app, or a Catalyst app. You ship the **iOS app** to the App Store, and then flip one switch in App Store Connect that lets the *same iOS binary* run on Apple Silicon Macs (M1 and later). So "deploying to the Mac store" is really "deploying to the iOS App Store, then opting in to Mac." Everything below is therefore an iOS submission guide with a Mac toggle at the end.

Two consequences of this choice:

1. **Apple Silicon only.** The app appears only on M-series Macs running macOS 11+. Intel Macs won't see it. That's fine for a modern pharmacy audience but worth knowing.
2. **It must pass iOS review first.** The Mac availability is downstream of an approved iOS app. Apple's review (especially Guideline 4.2, below) is stricter than Google's, so plan for that.

Your app is a Capacitor 8 shell (`appId: ca.remedypills.app`, appName **Remedy Pills Pharmacy**) that loads the live server, exactly like the Android build that is now live on Google Play.

⚠️ **The shell currently loads `https://remedypillspharmacyapp-production.up.railway.app`**, not `app.remedypills.ca` — see `productionUrl` in `capacitor.config.ts`. The custom domain isn't verified yet, and pointing the shell at a domain that doesn't resolve ships an app that opens to a blank error page (an automatic rejection). Use the Railway URL everywhere below until the custom domain is live, then change it in one place (`capacitor.config.ts`) and rebuild.

iOS is scaffolded in `ios/`, and both native features Apple's Guideline 4.2 cares about are implemented: local notifications (`@capacitor/local-notifications`) and a Face ID/Touch ID app lock (`@aparajita/capacitor-biometric-auth`).

---

## Stage 1 — Backend must be live (already done for Play)

Same prerequisite as the Play Store guide: the app is an empty screen until the server is serving. Android is live on Google Play, so this already holds — but re-confirm before an Apple reviewer opens it:

1. Registration, login, prescriptions, appointments all work at `https://remedypillspharmacyapp-production.up.railway.app` in Safari.
2. Privacy policy renders publicly at `https://remedypillspharmacyapp-production.up.railway.app/privacy-policy` (verified working; it redirects to `/privacy`). Apple checks this link and **also** requires an in-app link to it.
3. Whenever the URL changes, update `productionUrl` in `capacitor.config.ts` and rebuild — the shipped binary hard-codes it.

**On the Railway URL vs. a custom domain.** Reviewers will see a `railway.app` address in the address-less WebView only indirectly, so this is not a rejection risk on its own. But moving to `app.remedypills.ca` later means shipping a new build. If you intend to use the custom domain, it's cheaper to finish the DNS work *before* the first submission than to ship 1.1.0 on Railway and 1.2.0 on the custom domain.

## Stage 2 — Apple Developer Program enrollment ✅ SUBMITTED

Organization enrollment was submitted on **2026-08-12** under Apple Account `info@remedypills.ca`.

**Enrollment ID: `MHH8W6VX3X`**

| Field | Submitted |
|---|---|
| Entity type | Company / Organization |
| Legal entity name | Remedy Pills Inc |
| D-U-N-S | 243371905 |
| Address | 246 Nolanridge Cres NW Unit 135, Calgary, Alberta, T3R 1W9, CA |
| Website | www.remedypills.ca |

Apple pulled the address straight from the Dun & Bradstreet record and it matched, so the entity data is clean.

**Remaining, in order:**

1. **Apple verifies signing authority.** They often **phone the D&B business number** (+1 403-980-7003). Make sure it's answered and that whoever answers can confirm Adeel Siddiqui is an owner/officer — an unanswered call is the top cause of multi-week delays.
2. **Apple emails `info@remedypills.ca`** with completion instructions (check spam).
3. **Pay US $99** and accept the **Apple Developer Program License Agreement**.
4. **Sign the Paid Apps Agreement** in App Store Connect → Business. **This one matters for the Mac step** — Apple only distributes iOS apps to Apple Silicon Macs once it's signed.

If nothing arrives within ~10 business days, contact Apple quoting the Enrollment ID.

Everything in Stages 3–4 can be done now, up to the point of needing a signing Team in Xcode.

## Stage 3 — Prerequisites (on your Mac)

Building and uploading an iOS app **requires a Mac** — there is no cloud shortcut for the archive/upload step without one (or a CI service like Xcode Cloud/Codemagic, which still needs your Apple credentials).

1. **Xcode** (latest from the Mac App Store). Open it once, install additional components, and accept the license.
2. **CocoaPods** — Capacitor iOS uses it: `sudo gem install cocoapods` (or `brew install cocoapods`).
3. Node + the repo installed: from `app/`, run `npm install`.

## Stage 4 — Build and sign the iOS app

### 4a. Sync the native shell

```bash
cd app
npm install
CAPACITOR_ENV=production npx cap sync ios
npx cap open ios
```

`cap sync` copies config and installs pods; `cap open ios` opens `ios/App/App.xcworkspace` in Xcode. **Always open the `.xcworkspace`, never the `.xcodeproj`.**

### 4b. App icons ✅ already correct

Verified: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` is a valid **1024×1024** icon with a correct `Contents.json`, and `assets/icon.png` (the 1024×1024 master) is in place. Nothing to do.

Only if you change the artwork, re-run:

```bash
npx @capacitor/assets generate --ios
```

The master must have no transparency and no rounded corners — Apple applies the mask. The same 1024×1024 image is uploaded separately in App Store Connect.

### 4c. Signing and identifiers in Xcode

In Xcode, select the **App** target → **Signing & Capabilities**:

- **Bundle Identifier:** `ca.remedypills.app` (matches `capacitor.config.ts` — keep it identical).
- **Team:** your organization team. ⚠️ This is the **only** field that can't be set until enrollment completes — everything else is ready.
- Leave **Automatically manage signing** on. Xcode creates the App ID, certificates, and provisioning profile for you.
- **Version** (`CFBundleShortVersionString`): **`1.1.0`** — already set, matching Android's versionName. **Build** (`CFBundleVersion`): **`1`** — correct for the first iOS upload. Every *subsequent* upload must increment the build number.

**Info.plist ✅ already configured.** Both required keys are committed:

| Key | Value | Why |
|---|---|---|
| `NSFaceIDUsageDescription` | "Remedy Pills uses Face ID to lock the app so only you can view your prescriptions and health information." | Face ID crashes/rejects without it |
| `UIRequiredDeviceCapabilities` | `arm64` | Was the legacy `armv7`, which could have blocked Apple Silicon Mac eligibility |

After pulling this code, run `npm install && npx cap sync ios` so both native plugins (`local-notifications`, `biometric-auth`) are installed into the Xcode project. `cap sync` does **not** overwrite `Info.plist`, so these keys survive.

Local notifications need no extra capability for *local* (non-push) delivery. The app requests permission only when the user enables the Reminders toggle — deliberately, not on cold launch, which reviewers dislike.

### 4d. Archive and upload

1. In Xcode's device selector, choose **Any iOS Device (arm64)** (not a simulator).
2. **Product → Archive.** When the Organizer opens, select the archive → **Distribute App → App Store Connect → Upload.**
3. Let Xcode manage signing again, upload, and wait for it to finish processing in App Store Connect (a few minutes to an hour).

> Test on a real iPhone first via **Distribute → Ad Hoc** or TestFlight before you submit, so you catch a blank-screen/backend problem before a reviewer does.

## Stage 5 — Create the app record in App Store Connect

At `appstoreconnect.apple.com` → **My Apps → +** :

- **Platform:** iOS. **Name:** Remedy Pills Pharmacy. **Primary language:** English (Canada). **Bundle ID:** `ca.remedypills.app`. **SKU:** any internal string, e.g. `remedypills-ios-01`.

Then complete these sections — the health-app ones are what get scrutinized:

**App Privacy ("nutrition label")** — must match reality, and should mirror the Data Safety answers from your Play submission:

| Data type | Collected | Linked to user | Used for tracking | Purpose |
|---|---|---|---|---|
| Name, email, phone, date of birth | Yes | Yes | No | App functionality (account) |
| Health & fitness (prescriptions, health/calorie logs) | Yes | Yes | No | App functionality |
| Messages (in-app messages to pharmacy) | Yes | Yes | No | App functionality |
| Identifiers | Only if used for account/session | Yes | No | App functionality |

Declare **no tracking** and **no third-party analytics/ads SDKs** (true — the app has none). Everything is encrypted in transit (HTTPS).

**Account deletion (required, not optional).** Apple Guideline 5.1.1(v): any app that lets users create an account must let them **initiate account deletion from within the app** — a support email alone is not sufficient. Confirm the app exposes a delete-account path (your retention sweep + admin delete covers the backend; make sure the user can trigger it in-app or via a clearly linked in-app flow). Provide the deletion method when the form asks.

**Age rating:** complete the questionnaire; answer no to violence/sexual/gambling content. A pharmacy utility rates **4+**. Do not target children.

**App privacy policy URL:** `https://remedypillspharmacyapp-production.up.railway.app/privacy-policy`.

**Sign in with Apple — resolved by disabling Google on iOS.** ⚠️ This changed once native Google sign-in was added for Android. Guideline 4.8 (Login Services) requires an app offering a third-party social login to *also* offer an equivalent privacy-preserving option — in practice, Sign in with Apple. It's a frequent rejection.

Google sign-in was not platform-gated, so the button would have appeared on iOS. It is now disabled there (`client/src/lib/social-auth.ts` returns `false` when `Capacitor.getPlatform() === "ios"`), leaving iOS with **email/password only**. 4.8 therefore does not apply and Sign in with Apple is not required for this submission. Android keeps Google sign-in.

Two consequences:

- A patient who registered via *Google on Android* can't sign in on iOS unless their account has a password. Worth a support note when promoting the iOS app to existing users.
- To enable Google on iOS later you must ship Sign in with Apple **at the same time**, plus the iOS Google config (`CFBundleURLTypes` with the reversed client ID, and `GIDClientID` in `Info.plist`) — none of which exists today. Remove the gate only as part of that work.

**App Review Information — demo account:** the app is login-gated, so provide working reviewer credentials. Create a dedicated test patient (e.g. `appstore-review`, strong password, no real health data). Add notes explaining the app loads the live pharmacy site and what to test (refills, reminders, appointments).

**Screenshots:** Your Xcode target is currently set to **iPhone + iPad** (`TARGETED_DEVICE_FAMILY = "1,2"`), so you'll need **both** a 6.7"/6.9" iPhone set (e.g. iPhone 15/16 Pro Max) **and** a 13" iPad set. Capture home, prescriptions, reminders, and appointments from the release build. If you'd rather skip iPad screenshots, change the target to iPhone-only (family `1`) in Xcode before archiving — iPhone-only apps still run on Apple Silicon Macs in a phone-sized window, which is acceptable.

## Stage 6 — Turn on Mac availability (the actual "Mac store" step)

This is the switch that fulfills your goal:

1. In App Store Connect, open the app → **Pricing and Availability** (or the app's **Availability** section).
2. Find **"iPhone and iPad Apps on Apple Silicon Macs"** (also labeled "Make this app available on Mac").
3. It defaults to **on**, so usually you just **confirm** it's enabled. It's set at the app level and applies to all versions.
4. Requirement: the app must be **Mac-compatible** — it can't depend on frameworks, symbols, or hardware that Macs lack. A WKWebView shell loading a remote URL is compatible; just make sure any iPhone-only capability (e.g. a hardware sensor) isn't marked *required*. Local notifications are supported on Mac, so you're fine there.

That's it — no separate Mac binary, listing, or review. When the iOS app is approved with this enabled, it becomes installable from the Mac App Store on Apple Silicon.

> Caveat to remember for later: if you ever ship a *dedicated* macOS app (Catalyst or native) under the same bundle ID, it **replaces** the auto-provided iOS-on-Mac version. Fine, just don't do both by accident.

## Stage 7 — Store listing copy

Reuse and lightly adapt the copy from the Play guide:

**Subtitle (30 chars max):** "Refills, reminders & pharmacist"

**Promotional text (170 chars):** "Request refills, set medication reminders, and book pharmacist appointments — securely, from Remedy Pills Pharmacy."

**Description:**
"The official app of Remedy Pills Pharmacy. Request prescription refills and track when they're ready for pickup, set medication reminders so you never miss a dose, book appointments with your pharmacist, transfer prescriptions from another pharmacy, message our team directly, and keep simple health logs — blood pressure, glucose, and more. Designed to be easy to read and easy to tap, for patients of every age. Your health information is stored securely in Canada and is never sold or shared."

**Keywords (100 chars, comma-separated):** "pharmacy,prescription,refill,medication,reminder,pharmacist,appointment,health,Remedy Pills"

**Support URL:** a public contact page, e.g. `https://remedypillspharmacyapp-production.up.railway.app` or a support page. **Marketing URL:** optional.

## Stage 8 — Submit for review

1. In the app's version page, attach the uploaded build, screenshots, description, and the completed privacy/age/review sections.
2. Choose **Manually release** (so you control go-live) or automatic.
3. **Add for Review → Submit.** First reviews of health apps typically take **1–3 days** but can run longer.
4. Once approved with Mac availability enabled, it's live on both the iOS App Store and the Mac App Store (Apple Silicon).

---

## The big risk: Guideline 4.2 "Minimum Functionality"

This is the Apple equivalent of Google's "WebView wrapper" policy, **and Apple enforces it harder.** Guideline 4.2 says an app must include "features, content, and UI that elevate it beyond a repackaged website… If your app is not particularly useful, unique, or 'app-like,' it doesn't belong on the App Store." A Capacitor shell that just loads a remote site is squarely in the risk zone, and 4.2 is the #1 rejection reason for WebView apps.

What makes reviewers approve these anyway is visible **native platform integration** — things Safari can't do. In your favor: it's a real, login-gated app for a real business, and you already have `@capacitor/local-notifications`. To materially lower rejection odds before submitting, add native behavior and make it obvious in the demo notes:

- **Local notifications for medication reminders** (already installed) — wire them so reminders fire when the app is closed. High value for patients, unambiguous native functionality. Do this before submitting, not after a rejection.
- **Biometric login (Face ID / Touch ID)** — **now implemented** via `@aparajita/capacitor-biometric-auth`: an Account → Security toggle that gates the app behind Face ID/Touch ID on every launch and resume (`client/src/lib/biometric-auth.ts`, `client/src/components/biometric-lock.tsx`). Reviewers specifically like seeing biometric APIs, and this protects health data. Remember the `NSFaceIDUsageDescription` Info.plist key above.
- Optionally **native share** and **haptics** on key actions.

In the **App Review notes**, spell out the native features and where to find them ("Enable medication reminder → notification fires natively even with app closed; login screen offers Face ID"). Reviewers don't always dig, so tell them.

If you're rejected on 4.2, the fix is more genuine native functionality, then reply/resubmit — not an appeal arguing the current build is enough.

## Health-data note

Apple treats health data seriously (Guidelines 1.4.1 and 5.1.1–5.1.3). Don't use collected health data for advertising or share it with third parties (you don't), keep the privacy policy accurate about what's collected and how it's stored in Canada, and make sure the in-app account-deletion path genuinely works. These are the same commitments as your Play Data Safety form, so they should already hold.

## Version-update routine (for later)

Same principle as Android: backend changes deploy instantly to the live site with **no store release needed**. You only ship a new build when the native shell changes — bump `CFBundleVersion` (and `CFBundleShortVersionString` for a user-visible version), `cap sync ios`, archive, upload, and submit the new version. The Mac availability toggle carries over automatically.
