# Remedy Pills Pharmacy — App Store Submission Pack

Everything you need to paste into App Store Connect, pre-written. Work top to bottom.
Companion to `MACSTORE_DEPLOYMENT.md` (which explains the *why*); this file is the *what to type*.

**Reminder of the path:** you submit the **iOS** app, then enable "available on Apple Silicon Macs." There is no separate Mac build.

---

## 0. Status tracker

| # | Step | Who | Status |
|---|---|---|---|
| 0 | D-U-N-S number for Remedy Pills Inc | You | ☑ `24-337-1905` |
| 1 | Apple Developer Program enrollment **submitted** | You | ☑ ID `MHH8W6VX3X` — awaiting Apple |
| 1b | Apple verifies signing authority → emails instructions | Apple | ☐ |
| 1c | Pay US $99 membership | **You** (payment) | ☐ |
| 2 | Sign Paid Apps Agreement | **You** (legal) | ☐ |
| 3 | Native build prep (code, Info.plist) | **Claude — done** | ☑ |
| 4 | `npm install && npx cap sync ios` | You (your Mac) | ☐ |
| 5 | Xcode signing + Archive + Upload | You (your Mac) | ☐ |
| 5b | Seed reviewer demo account (`npm run seed:reviewer`) | You (one command) | ☐ |
| 6 | Create app record + paste metadata below | You, with Claude guiding live | ☐ |
| 7 | Screenshots | You capture, Claude advises | ☐ |
| 8 | Enable Mac availability | You (one toggle) | ☐ |
| 9 | Submit for Review | **You** (legal declaration) | ☐ |

---

## 0a. Enrollment status — submitted 2026-08-12

**Enrollment ID: `MHH8W6VX3X`** — quote this in any correspondence with Apple.

Submitted exactly as accepted by Apple:

| Field | Submitted value |
|---|---|
| Entity type | Company / Organization |
| Legal Entity Name | Remedy Pills Inc |
| D-U-N-S | 243371905 |
| Address | 246 Nolanridge Cres NW Unit 135, Calgary, ALBERTA, T3R 1W9, CA |
| Website | www.remedypills.ca |
| Work email | info@remedypills.ca |
| Account Holder | Adeel Siddiqui, +1 (403) 980-7003 |

Apple's message: *"Once we verify your authority to sign legal agreements, we'll email you with instructions on how to complete your enrollment."*

**What happens next, in order:**

1. Apple verifies your authority to bind Remedy Pills Inc. They frequently **phone the business number on the D&B record** — make sure +1 403-980-7003 is answered, and that whoever answers can confirm Adeel Siddiqui is an owner/officer. This is the single most common cause of delay.
2. Apple emails **info@remedypills.ca** with instructions. Watch that inbox, including spam.
3. You then pay the **US $99** membership and accept the **Apple Developer Program License Agreement**.
4. After that, sign the **Paid Apps Agreement** in App Store Connect → Business — required before the app can be distributed, and before the "iPhone/iPad apps on Apple Silicon Macs" toggle takes effect.

Typical timeline is a few days to two weeks. If nothing arrives in ~10 business days, contact Apple with the Enrollment ID above.

## 0b. Company / enrollment details

Use these exact values when enrolling in the Apple Developer Program.

| Field | Value |
|---|---|
| **Legal entity name** | **Remedy Pills Inc** |
| **D-U-N-S Number** | **24-337-1905** (enter as `243371905` if hyphens are rejected) |
| Business address | Unit #135, 246 Nolanridge Crescent NW, Calgary, AB T3R 1W9, Canada |
| Business phone | +1 403-980-7003 |
| Business email | info@remedypills.ca |
| Website | https://remedypills.ca |
| Entity type | Corporation (Canada) |
| Program cost | US $99/year |

⚠️ **Two names — both correct, used in different places. Do not mix them up:**

| | Name | Where it goes |
|---|---|---|
| **Legal entity** | `Remedy Pills Inc` | Apple Developer enrollment, D-U-N-S record, tax & banking forms, agreements |
| **App / trade name** | `Remedy Pills Pharmacy` | App Store listing name, Play listing name, the app itself |

`Remedy Pills Inc` is the registered Alberta corporation (the name on the registry papers D&B required). `Remedy Pills Pharmacy` is the operating/trade name patients know. Apple matches the **legal entity** character-for-character against Dun & Bradstreet — a mismatch ("Remedy Pills Inc.", "Remedy Pills Pharmacy", "Remedy Pills Incorporated") bounces the application and you restart the multi-week review. Enter it exactly as `Remedy Pills Inc`.

**The app name is unrestricted.** Apple does *not* require your App Store listing name to match the legal entity, so listing the app as **Remedy Pills Pharmacy** — matching Google Play — is straightforward. Just type it in the Name field (§1).

**Seller name — expect `Remedy Pills Inc`.** The "seller"/developer line under the app on the App Store defaults to the legal entity. To display "Remedy Pills Pharmacy" there instead you'd request a DBA/trade name in App Store Connect → Business, and Apple requires an Alberta trade name registration certificate as proof. You currently hold only the Inc. registry papers, so:

- **Recommended:** proceed now, accept `Remedy Pills Inc` as the seller name. It's accurate, patients still see "Remedy Pills Pharmacy" as the app name, and it does not delay launch. This is normal — most incorporated businesses show their legal name as seller.
- **Optional later:** register the Alberta trade name, then request the DBA. It can be changed after the app is live; it is not worth blocking submission over.

Also confirm the address and phone you give Apple match the D&B record exactly — Apple often verifies by calling the number on file, so make sure it's answered.

## 1. App information

| Field | Value |
|---|---|
| **Name** | Remedy Pills Pharmacy |
| **Subtitle** (30 max) | Refills, reminders & advice |
| **Bundle ID** | `ca.remedypills.app` |
| **SKU** | `remedypills-ios-01` |
| **Primary language** | English (Canada) |
| **Primary category** | Medical |
| **Secondary category** | Health & Fitness |
| **Content rights** | Does not contain third-party content |
| **Age rating** | 4+ (answer "None" to all questionnaire items) |
| **Price** | Free |

## 2. Store listing copy

**Promotional text** (170 max):
```
Request refills, set medication reminders, and book pharmacist appointments — securely, from Remedy Pills Pharmacy in Calgary.
```

**Description:**
```
Remedy Pills Pharmacy puts your Calgary pharmacy in your pocket. Manage prescriptions, stay on top of your medications, and reach a licensed pharmacist — all from one secure app.

REFILLS MADE SIMPLE
Request prescription refills in seconds and track their status. No phone calls, no waiting on hold.

MEDICATION REMINDERS
Set reminders so you never miss a dose. Notifications arrive on your device at each dose time, even when the app is closed.

BOOK APPOINTMENTS
Schedule consultations, vaccinations, and medication reviews with your pharmacist at a time that suits you.

TRANSFER PRESCRIPTIONS
Moving to Remedy Pills? Transfer prescriptions from another pharmacy right in the app.

MESSAGE YOUR PHARMACY
Ask questions and get answers from our team without a trip to the counter.

HEALTH LOGS
Keep simple records of blood pressure, glucose, and other measurements to share with your care team.

FAMILY ACCOUNTS
Manage medications for the people you care for from a single login.

BUILT FOR PRIVACY
Protect the app with Face ID or Touch ID. Your health information is stored securely in Canada, is never sold, and is never shared with advertisers.

Designed to be easy to read and easy to tap, for patients of every age.

Remedy Pills Pharmacy — Unit #135, 246 Nolanridge Crescent NW, Calgary, AB T3R 1W9
```

**Keywords** (100 chars, no spaces after commas):
```
pharmacy,prescription,refill,medication,reminder,pharmacist,appointment,health,calgary,rx
```

**Support URL:** `https://remedypillspharmacyapp-production.up.railway.app`
**Marketing URL:** (optional — your main pharmacy site)
**Privacy Policy URL:** `https://remedypillspharmacyapp-production.up.railway.app/privacy-policy`

## 3. App Review Information — CRITICAL

This is your defense against a Guideline 4.2 rejection. Paste verbatim into **Notes**:

```
Remedy Pills Pharmacy is the official app of a licensed community pharmacy in Calgary, Alberta, Canada. It is not a generic web wrapper — it provides native device functionality that a website cannot:

1. BIOMETRIC APP LOCK (Face ID / Touch ID)
   Where: Account tab > Security > "Require Face ID to open the app"
   Enabling it locks the app behind Face ID/Touch ID on every launch and every
   return to the foreground, protecting personal health information if the
   device is left unlocked. Uses LocalAuthentication via Capacitor.

2. LOCAL MEDICATION-REMINDER NOTIFICATIONS
   Where: Reminders tab > "Reminder Alerts" toggle
   Schedules OS-level notifications that fire at each dose time even when the
   app is closed. Add a reminder with a time a few minutes out to observe it.

The app requires a patient login because it displays personal prescription and
health data. Demo credentials are provided below. The account contains only
synthetic test data — no real patient information.

Suggested review path:
  Log in > Reminders tab > enable "Reminder Alerts" > add a reminder for ~2
  minutes ahead > background the app > the notification fires natively.
  Then Account tab > Security > enable Face ID > background and reopen the app
  to see the biometric lock.

Health data is used solely to deliver pharmacy services. It is never sold,
never shared with third parties, and never used for advertising or tracking.
The app contains no advertising or analytics SDKs. Data is stored in Canada.
Users can request account deletion in-app.

Pharmacy contact: Remedy Pills Pharmacy, Unit #135, 246 Nolanridge Crescent NW,
Calgary, AB T3R 1W9.
```

**Sign-in required:** Yes.

**Demo account — seeded by script.** Run this once against production before submitting:

```bash
cd ~/Documents/Claude/Projects/RemedyPillsPharmacy_App/app
REVIEWER_BOOTSTRAP_PASSWORD='<a strong unique password>' npm run seed:reviewer
```

Creates username **`appstore-review`** with entirely synthetic data — 3 prescriptions (one marked ready for pickup), 4 daily medication reminders, 2 appointments, 4 health logs, and a short pharmacy message thread. No real patient information.

- Put `appstore-review` + that password into the App Store Connect review fields (and Play Console — the same account works for both).
- The reminder times are real (`08:00 AM`, `09:00 AM`, `06:00 PM`, `10:00 PM`), so the reviewer's notification test in the notes below will genuinely fire.
- Safe to re-run: it does nothing if the account exists. Add `--reset` (`npm run seed:reviewer -- --reset`) to rebuild the demo content.
- ⚠️ This is a **real login on your production database**. Use a strong, unique password you don't use elsewhere, store it in your password manager, and consider disabling the account once the app is approved.
- **Do not** use a real patient account.

**Contact:** Adeel Siddiqui · +1 403-980-7003 · info@remedypills.ca — Apple uses this if they have questions during review, so make sure it's monitored while the app is in review.

## 3b. Login services (Guideline 4.8) — already handled

Google sign-in is **disabled on iOS**; the iOS build offers email/password only, so Sign in with Apple is not required. Nothing to do at submission time — just don't re-enable Google for iOS without shipping Sign in with Apple alongside it. Full explanation in `MACSTORE_DEPLOYMENT.md` §5.

If a reviewer asks why sign-in options differ from the Android app, the answer is: the iOS build intentionally offers only email/password.

**One nuance.** `@capgo/capacitor-social-login` is a shared dependency, so the Google Sign-In SDK is still *linked* into the iOS binary even though iOS never calls it (`isSocialLoginAvailable()` returns false, and `signInWithGoogle()` throws as a second guard). Apple does scan binaries, so if review asks about the presence of Google Sign-In:

> The Google Sign-In SDK is present because Android and iOS share one codebase, but the iOS build never invokes it — Google sign-in is disabled on iOS and the button is not rendered. iOS offers email/password only.

This is accurate and not a 4.8 violation: 4.8 governs what login options the app *offers*, not what code is linked. If you'd rather remove the SDK from the iOS binary entirely, that requires excluding the plugin from the iOS platform in the Capacitor config — worth doing only if a reviewer actually raises it.

## 4. App Privacy (nutrition label)

Answer **"Yes, we collect data."** Then, for every item below: **Linked to the user = Yes**, **Used for tracking = No**, **Purpose = App Functionality**.

| Category | Specific data to declare |
|---|---|
| Contact Info | Name, Email Address, Phone Number |
| Health & Fitness | Health (prescriptions, health logs, calorie logs) |
| User Content | Customer Support / Other User Content (messages to the pharmacy) |
| Identifiers | User ID |
| Sensitive Info | Date of birth (declare under Other Data if prompted) |

Declare **no** Advertising Data, **no** Analytics, **no** Third-Party Advertising, **no** Data Broker sharing, and **no tracking** across apps/websites (so no ATT prompt needed).

**Account deletion:** answer that users can request deletion, and confirm the in-app path works before you submit — Apple actively tests this (Guideline 5.1.1(v)).

## 5. Screenshots

Required for the device families your target supports (currently iPhone **and** iPad):

- **iPhone 6.9"** (1320×2868 or 1290×2796) — e.g. iPhone 16 Pro Max simulator
- **iPad 13"** (2064×2752 or 2048×2732) — e.g. iPad Pro 13" simulator

Capture 4–6 per size, in this order: **Home → Prescriptions → Reminders (alerts toggle visible) → Appointments → Account (Face ID toggle visible)**.

In Xcode: run on the simulator, then **Device → Screenshot** (⌘S). Showing the two native toggles in screenshots quietly reinforces the 4.2 case.

> Shortcut: to skip iPad screenshots entirely, set the target to iPhone-only (`TARGETED_DEVICE_FAMILY = 1`) in Xcode before archiving. It still runs on Apple Silicon Macs.

## 6. Build commands (your Mac)

```bash
cd ~/Documents/Claude/Projects/Remedy PillsPharmacy_App/app
git pull origin main          # get the biometric + notification work
npm install                   # installs @aparajita/capacitor-biometric-auth
CAPACITOR_ENV=production npx cap sync ios
npx cap open ios              # opens App.xcworkspace
```

In Xcode: select the **App** target → **Signing & Capabilities** → set **Team** to your org → confirm Bundle Identifier is `ca.remedypills.app` → device selector to **Any iOS Device (arm64)** → **Product → Archive** → **Distribute App → App Store Connect → Upload**.

**Already handled in the repo — no action needed:**

- `NSFaceIDUsageDescription` set in `Info.plist` (Face ID fails without it)
- `UIRequiredDeviceCapabilities` corrected from legacy `armv7` → `arm64` (the old value could have blocked Apple Silicon Mac eligibility)
- iOS version set to **1.1.0**, build **1**
- App icon verified: 1024×1024 with valid `Contents.json`
- Google sign-in disabled on iOS (Guideline 4.8 — see §3b)
- Share App link made platform-aware (no longer points iOS users at Google Play)
- In-app account deletion implemented (Guideline 5.1.1(v))
- Both native features wired: medication-reminder notifications and Face ID app lock

The **only** thing that can't be done until enrollment completes is setting the signing **Team** in Xcode.

## 7. Enable Mac availability

App Store Connect → your app → **Pricing and Availability** → **"iPhone and iPad Apps on Apple Silicon Macs"** → ensure it is **enabled**. It defaults on once the Paid Apps Agreement is signed. This is the entire "Mac App Store" step.

## 7b. What you can do NOW, while Apple verifies enrollment

None of these need a Developer account:

- ☐ **Capture screenshots** (§5). Run the app in the iOS Simulator via Xcode — no signing needed. This is the most time-consuming remaining task, so front-load it.
- ☐ **Seed the reviewer account** (§3): `REVIEWER_BOOTSTRAP_PASSWORD='…' npm run seed:reviewer`
- ☐ **Verify in-app account deletion** works end-to-end (Apple actively tests this)
- ☐ **Decide the domain question**: ship on the Railway URL, or finish `app.remedypills.ca` DNS first and avoid a second build (see `MACSTORE_DEPLOYMENT.md` Stage 1)
- ☐ **Run `npm install && npx cap sync ios`** and confirm the Xcode project opens cleanly
- ☐ **Test on a real iPhone** via a free personal signing profile — catches blank-screen/backend issues before a reviewer sees them

## 8. Final pre-submit checks

- ☐ `https://remedypillspharmacyapp-production.up.railway.app` loads and login works in Safari right now
- ☐ `https://remedypillspharmacyapp-production.up.railway.app/privacy-policy` loads publicly
- ☐ Demo account works from a fresh install
- ☐ Reminder notification fires with the app closed (test on a real device)
- ☐ Face ID lock engages on relaunch
- ☐ In-app account deletion path works
- ☐ Build finished processing in App Store Connect
- ☐ Mac availability toggle on
- ☐ Review notes from §3 pasted in

Then **Add for Review → Submit**. Health-app reviews typically take 1–3 days.
