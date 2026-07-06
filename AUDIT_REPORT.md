# RemedyPills Pharmacy App — Audit & Upgrade Report

**Repo reviewed:** github.com/AdeelSiddiqui38/remedypillspharmacyApp
**Date:** July 6, 2026
**Scope:** Security, design & accessibility (older patients), modernization, ease of use
**Deliverable:** This report + an upgraded copy of the codebase in the `app/` folder

---

## What you got right

Credit where due — this codebase is better than most small-clinic apps I see. Passwords are hashed with scrypt and compared in constant time. Account lockout after 5 failed attempts is implemented. Registration uses a picked Zod schema that blocks privilege escalation via mass assignment. Every API route checks record ownership before returning data, so one patient cannot read another patient's prescriptions by guessing IDs. There is an audit log for logins, consent, and password changes, and a data-retention sweep. The stack itself is modern: React 19, Vite 7, Express 5, Tailwind v4, Drizzle ORM (parameterized queries, so SQL injection is effectively off the table), and Capacitor 8 for iOS/Android. Nothing here needed a rewrite — the work below is hardening and polish.

## Security findings and fixes

### High severity

**1. Patient health data was being written to server logs.** The request logger in `server/index.ts` captured every JSON response body and printed it to the console — prescriptions, health logs, names, dates of birth, phone numbers. On Render, console output is retained in the hosting provider's log system, outside your control and outside your retention policy. For a pharmacy app handling PHI this is the most serious issue in the codebase (PHIPA/PIPEDA exposure in Canada). **Fixed:** the logger now records only method, path, status code, and duration.

**2. No rate limiting anywhere.** Your per-account lockout stops someone hammering one account, but nothing stopped an attacker from trying one password against thousands of usernames (credential stuffing), spamming registrations, or flooding the transfer-request endpoint to make your Gmail account send spam. **Fixed:** added `express-rate-limit` with three tiers — a global API ceiling, a strict limiter on login/register/change-password, and an hourly cap on email/SMS-triggering endpoints and the public contact webhook (new file: `server/security.ts`).

### Medium severity

**3. No security headers.** No Content-Security-Policy, no HSTS, no X-Frame-Options — the app was embeddable in an iframe (clickjacking) and had no script-injection backstop. **Fixed:** added `helmet` with a production CSP (`frame-ancestors 'none'`, scripts restricted to same origin).

**4. Database TLS verification disabled.** `rejectUnauthorized: false` accepts any certificate, so a man-in-the-middle between your server and the managed Postgres could read all traffic. **Fixed:** the pool now verifies against a CA certificate when you set `DATABASE_CA_CERT` (download it from your DigitalOcean database dashboard and add it as an environment variable on Render). Until you set it, behavior is unchanged — set it.

**5. No password rules at sign-up.** The change-password endpoint required 8 characters, but registration accepted a 1-character password. **Fixed:** registration now requires 8+ characters with at least one letter and one number.

**6. Username enumeration at login.** A wrong password returned "Invalid password. 4 attempts remaining" while an unknown user returned "Invalid username or password" — telling an attacker exactly which usernames exist. **Fixed:** both cases now return the same generic message. (Note: the registration "Username already exists" response still confirms usernames; that's a deliberate UX trade-off, now protected by the rate limiter.)

**7. SMS media URL was not validated.** An admin (or an attacker with a stolen admin session) could pass any URL as MMS media, making your Twilio account distribute arbitrary third-party content to patients. **Fixed:** media URLs must now be HTTPS and point at your own DigitalOcean Spaces bucket.

### Low severity

**8. Webhook secret accepted in the query string.** Query strings are captured by proxy, CDN, and access logs, so the shared secret could leak. **Fixed:** the contact webhook now accepts the secret only via the `X-Webhook-Secret` header — update the Elementor form's webhook configuration accordingly before deploying.

**9. Status fields accepted arbitrary strings.** Prescription and appointment status updates now validate against a fixed set of allowed values.

**10. Raw Zod errors returned to users.** Validation failures returned an internal JSON blob. Users now get the first human-readable message ("Password must be at least 8 characters").

**11. `remedypills.db` was committed to the public repo.** I verified it was empty (0 bytes) — no patient data leaked — but a database file in a public GitHub repo is one `git add` away from a breach. Removed it and added `*.db` / `*.sqlite` to `.gitignore`. In the GitHub repo itself, run `git rm --cached remedypills.db` and push.

**12. Session behavior (also a UX win).** Sessions expired 30 minutes after login regardless of activity, silently logging out an older patient mid-task. Sessions are now *rolling*: the 30-minute window resets on each request, so active users stay signed in while idle sessions still expire on schedule.

### Recommendations not implemented (your call)

Two-factor authentication for admin accounts is the biggest remaining gap — an admin session exposes every patient's data, and right now a phished admin password is game over. CSRF tokens would add defense-in-depth beyond the current `SameSite=Lax` cookie. And consider moving off Gmail app-password email to a transactional provider (SES, Postmark) with a domain you control.

## Design & accessibility (older patients)

The choice was conservative polish — same layout, same branding, better legibility. Changes:

**Type scale raised at the floor.** The app used `text-xs` (12px) in 135 places and hand-coded 10–11px text in 31 more. For a patient base that skews older, 10–12px is unreadable. Rather than touching every call site, I overrode Tailwind's type tokens once in `index.css`: `text-xs` now renders 13.5px, `text-sm` 15px, `text-base` 17px — every screen benefits automatically. The 31 hardcoded 10–11px sizes were swept up to `text-xs`.

**Touch targets meet the 44px standard.** Buttons were 36px tall (WCAG 2.5.5 and Apple's HIG both call for 44px minimum — tremor and reduced dexterity make small targets genuinely unusable). Default buttons are now 44px, large buttons 48px, icon buttons 44×44, inputs and dropdowns 44px, and bottom-navigation tabs 48px with bigger icons.

**Contrast fixed.** Muted body text was ~4.2:1 against white and inactive nav labels (`text-gray-400`) were ~2.8:1 — both below the WCAG AA 4.5:1 line. Muted text is now darker, inactive tabs use gray-500, and the active tab gets a soft teal background pill so "where am I" is answerable at a glance.

**Navigation labels are words, not jargon.** "Rx" became "Meds" — pharmacy shorthand isn't obvious to every 78-year-old. Tabs also carry `aria-label` and `aria-current` now, so VoiceOver/TalkBack announce them properly (the 3,070-line main screen previously contained a total of two ARIA attributes).

**Depth restored — the "cinematic" touch.** Every shadow token in your theme had its alpha set to 0.00, so all cards rendered completely flat. I replaced them with a soft, teal-tinted elevation scale: cards now lift gently off the background, giving the UI the layered, polished feel you asked about without changing a single layout.

**Motion sensitivity respected.** A `prefers-reduced-motion` rule disables animations for users who enable that setting — vestibular disorders are more common with age.

## Modernization notes (future work)

The stack needs no migration, but `pharmacy-app.tsx` at 3,070 lines and `admin-page.tsx` at 1,213 are maintenance hazards — split them by tab into separate components when convenient. The manual `.env` parser in `server/index.ts` duplicates `dotenv` which is already imported and can be deleted.

**Dependency audit.** `npm audit` reported 26 vulnerabilities (16 high) at review time, including high-severity advisories in runtime packages: multer (your file-upload handler), nodemailer, drizzle-orm, axios, form-data, and lodash. I ran `npm audit fix` and upgraded drizzle-orm, multer, and nodemailer to patched versions — TypeScript still compiles cleanly after the bumps. Twelve advisories remain, but every one of them sits in development/build tooling (the esbuild dev server, Capacitor's asset generator, a transitive minimatch) that never runs on your production server, so they carry no patient-facing risk. Re-run `npm audit` each release.

## Deploy checklist

Before pushing these changes live: set `DATABASE_CA_CERT` on Render (from the DigitalOcean DB dashboard); update the Elementor webhook to send the secret as an `X-Webhook-Secret` header instead of a query parameter; run `git rm --cached remedypills.db` in the GitHub repo; and `npm install` to pick up the two new dependencies (`helmet`, `express-rate-limit`) and the security upgrades to multer, nodemailer, and drizzle-orm.

**Verification performed:** `tsc` type-checks the full project with zero errors after all changes, and the dependency upgrades were re-verified the same way. Files changed: 14 (384 insertions, 250 deletions), plus one new file, `server/security.ts`.

*This report reflects a static review of the code as of the latest commit ("Add iOS platform via Capacitor"). It is not a penetration test, and for a production health app in Ontario a professional PHIPA compliance review is still worth the money.*
