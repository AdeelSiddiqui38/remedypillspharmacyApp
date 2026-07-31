# RemedyPills Pharmacy — Mac App Store Deployment Guide

This is the companion to `PLAYSTORE_DEPLOYMENT.md`. It covers getting **RemedyPills Pharmacy** onto the **Mac App Store** using the path you chose: **"iPhone/iPad app made available on Apple Silicon Macs."**

Read this first, because it changes how you think about the whole thing:

> **There is no separate "Mac build."** On the path you chose, you do **not** create a macOS target, an Electron app, or a Catalyst app. You ship the **iOS app** to the App Store, and then flip one switch in App Store Connect that lets the *same iOS binary* run on Apple Silicon Macs (M1 and later). So "deploying to the Mac store" is really "deploying to the iOS App Store, then opting in to Mac." Everything below is therefore an iOS submission guide with a Mac toggle at the end.

Two consequences of this choice:

1. **Apple Silicon only.** The app appears only on M-series Macs running macOS 11+. Intel Macs won't see it. That's fine for a modern pharmacy audience but worth knowing.
2. **It must pass iOS review first.** The Mac availability is downstream of an approved iOS app. Apple's review (especially Guideline 4.2, below) is stricter than Google's, so plan for that.

Your app is a Capacitor 8 shell (`appId: ca.remedypills.app`, appName **RemedyPills Pharmacy**) that loads the live site `https://app.remedypills.ca`, exactly like the Android build. iOS platform is already scaffolded in `ios/`, and `@capacitor/local-notifications` is already a dependency — that matters for review.

---

## Stage 1 — Backend must be live (already done for Play)

Same prerequisite as the Play Store guide: the app is an empty screen until `https://app.remedypills.ca` is serving. Since your Android build is already submitted, this is presumably already true. Before an Apple reviewer opens the app, re-confirm:

1. Registration, login, prescriptions, appointments all work at `https://app.remedypills.ca` in Safari.
2. Privacy policy renders at a public URL, e.g. `https://app.remedypills.ca/privacy`. Apple checks this link and **also** requires an in-app link to it.
3. If you ever move off `app.remedypills.ca`, update `productionUrl` in `capacitor.config.ts` before building.

## Stage 2 — Apple Developer Program enrollment (start this now)

You don't have an account yet, and enrollment is the long pole — start it before touching Xcode.

1. Go to `developer.apple.com/programs/enroll`. Cost is **US $99/year** (same for individuals and organizations).
2. **Enroll as an organization** using your pharmacy's legal entity, not a personal account. A health app under a real business name reviews more smoothly, and org accounts let you manage roles later.
3. Organization enrollment requires a **D-U-N-S number** — a free nine-digit business identifier from Dun & Bradstreet. Check/request one at Apple's D-U-N-S lookup. Getting the number takes **1–5 business days**; total org enrollment commonly takes **1–2 weeks**. You also need legal authority to bind the organization to Apple's agreement.
4. Once enrolled, sign the latest **Paid Apps Agreement** in App Store Connect → Business. **This matters for the Mac step:** Apple only auto-distributes your iOS apps to Apple Silicon Macs after this agreement is signed.

While you wait for enrollment, do Stages 3–4 up to the point of needing a signing team.

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

### 4b. App icons

You have `@capacitor/assets` installed. Put a 1024×1024 master icon at `assets/icon.png` (no transparency, no rounded corners — Apple applies the mask) and run:

```bash
npx @capacitor/assets generate --ios
```

This fills the iOS icon set. The **1024×1024 App Store icon** is also uploaded in App Store Connect.

### 4c. Signing and identifiers in Xcode

In Xcode, select the **App** target → **Signing & Capabilities**:

- **Bundle Identifier:** `ca.remedypills.app` (matches `capacitor.config.ts` — keep it identical).
- **Team:** your organization team (appears after Stage 2 enrollment).
- Leave **Automatically manage signing** on. Xcode creates the App ID, certificates, and provisioning profile for you.
- **Version** (`CFBundleShortVersionString`): `1.0`. **Build** (`CFBundleVersion`): `1`. Every upload must increment the build number.

Because `@capacitor/local-notifications` is present, confirm the notifications capability is wired and that the app requests permission at a sensible moment (not on cold launch).

### 4d. Archive and upload

1. In Xcode's device selector, choose **Any iOS Device (arm64)** (not a simulator).
2. **Product → Archive.** When the Organizer opens, select the archive → **Distribute App → App Store Connect → Upload.**
3. Let Xcode manage signing again, upload, and wait for it to finish processing in App Store Connect (a few minutes to an hour).

> Test on a real iPhone first via **Distribute → Ad Hoc** or TestFlight before you submit, so you catch a blank-screen/backend problem before a reviewer does.

## Stage 5 — Create the app record in App Store Connect

At `appstoreconnect.apple.com` → **My Apps → +** :

- **Platform:** iOS. **Name:** RemedyPills Pharmacy. **Primary language:** English (Canada). **Bundle ID:** `ca.remedypills.app`. **SKU:** any internal string, e.g. `remedypills-ios-01`.

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

**App privacy policy URL:** `https://app.remedypills.ca/privacy`.

**Sign in with Apple:** **not required** here — you use your own email/password login, not a third-party social login, so the "must also offer Sign in with Apple" rule doesn't apply. (Only triggered if you add Google/Facebook login.)

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

**Promotional text (170 chars):** "Request refills, set medication reminders, and book pharmacist appointments — securely, from RemedyPills Pharmacy."

**Description:**
"The official app of RemedyPills Pharmacy. Request prescription refills and track when they're ready for pickup, set medication reminders so you never miss a dose, book appointments with your pharmacist, transfer prescriptions from another pharmacy, message our team directly, and keep simple health logs — blood pressure, glucose, and more. Designed to be easy to read and easy to tap, for patients of every age. Your health information is stored securely in Canada and is never sold or shared."

**Keywords (100 chars, comma-separated):** "pharmacy,prescription,refill,medication,reminder,pharmacist,appointment,health,RemedyPills"

**Support URL:** a public contact page, e.g. `https://app.remedypills.ca` or a support page. **Marketing URL:** optional.

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
- **Biometric login (Face ID / Touch ID)** via a Capacitor biometric plugin — reviewers specifically like seeing biometric APIs. A "unlock with Face ID" option on top of the web login is a strong 4.2 signal.
- Optionally **native share** and **haptics** on key actions.

In the **App Review notes**, spell out the native features and where to find them ("Enable medication reminder → notification fires natively even with app closed; login screen offers Face ID"). Reviewers don't always dig, so tell them.

If you're rejected on 4.2, the fix is more genuine native functionality, then reply/resubmit — not an appeal arguing the current build is enough.

## Health-data note

Apple treats health data seriously (Guidelines 1.4.1 and 5.1.1–5.1.3). Don't use collected health data for advertising or share it with third parties (you don't), keep the privacy policy accurate about what's collected and how it's stored in Canada, and make sure the in-app account-deletion path genuinely works. These are the same commitments as your Play Data Safety form, so they should already hold.

## Version-update routine (for later)

Same principle as Android: backend changes deploy instantly to the live site with **no store release needed**. You only ship a new build when the native shell changes — bump `CFBundleVersion` (and `CFBundleShortVersionString` for a user-visible version), `cap sync ios`, archive, upload, and submit the new version. The Mac availability toggle carries over automatically.
