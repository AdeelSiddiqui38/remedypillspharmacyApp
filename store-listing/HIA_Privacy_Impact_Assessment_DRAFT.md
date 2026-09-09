# Privacy Impact Assessment — Remedy Pills Pharmacy Patient Portal

**Prepared under Alberta's Health Information Act (HIA), section 64, for submission to the
Office of the Information and Privacy Commissioner (OIPC) of Alberta.**

This draft follows the mandatory structure and headings set out in the OIPC's
*Privacy Impact Assessment Requirements* (HIA), so that it can be submitted largely as-is
once the bracketed items are filled in and the Section E policy documents are attached.
Submit to **pia@oipc.ab.ca**.

Everything describing what the system actually does, what data it collects, and what
technical safeguards exist has been drawn directly from the application's source code and configuration as of
2026-08-31, not summarized secondhand — so it should be accurate without
further verification on that front. Items only the pharmacy can answer (governance,
staffing, formal written policies) are marked `[PHARMACY TO COMPLETE]`.

✅ **Update (2026-09-01):** The app's privacy policy previously stated health records are
stored in Canada — that was false (Railway hosts the database and app server in US West) and
has since been corrected to disclose the actual, cross-border hosting. See Section C.7 for
the full detail. The pharmacy has decided not to migrate hosting for now; the remaining open
item is putting the Health Information Regulation's required contractual safeguards in place
with Railway (see Section C.6).

> **⚠️ Current status of the App (as of this submission):** This PIA is being submitted
> **before the App is placed into live operation.** As of the submission date:
> **(1)** the App is currently listed for **testing purposes only** (internal/closed testing)
> and contains **no patient data;** **(2)** **no patient information has been captured or
> entered into the App or the patient portal;** and **(3)** **Kroll has not been connected to
> the App and no information has been pulled from Kroll.** Accordingly, this document describes
> the system **as designed and built.** Every "the App does X" statement below should be read
> as "the App is built to do X once it is live," not as a description of processing already
> occurring against real patient information. The pharmacy will not place the App into live
> use or connect it to Kroll until this review is appropriately addressed.

---

## COVER LETTER

**✅ Finalized as a standalone, signable file:** `store-listing/Remedy_Pills_PIA_Cover_Letter.docx`,
built on the official Remedy Pills Pharmacy letterhead (`branding/Remedy_Pills_Letterhead.docx`,
logo + address/contact masthead and footer). Signer: Adeel Siddiqui, Proprietor. Only the
`[DATE]` field remains to be filled in — with the actual submission date — before signing and
sending to pia@oipc.ab.ca. The text below is kept for reference/history; edit the .docx directly
for the copy that actually gets sent.

> Office of the Information and Privacy Commissioner of Alberta
> #410, 9925 – 109 Street
> Edmonton, Alberta T5K 2J8
>
> Re: Privacy Impact Assessment — Remedy Pills Pharmacy Patient Portal (including a planned
> Kroll medication-history import feature)
>
> Please find enclosed a Privacy Impact Assessment for the Remedy Pills Pharmacy patient
> portal application ("the App"), submitted under section 64 of the *Health Information Act*.
> This is the first PIA submitted for this system, and it is being submitted **before the App
> goes into live operation**, so that your office's review can be completed in advance of any
> real patient information being handled.
>
> To be clear about the App's current status:
>
> - **No patient information has been captured or entered into the App or patient portal.** The
>   system holds no patient health information at this time.
> - **Kroll has not been connected to the App, and no information has been pulled from Kroll.**
>   The medication-history import feature described in this PIA is designed and built, but it
>   has not been used against any real Kroll data.
> - **The App is currently listed for testing purposes only** (internal/closed testing) and
>   contains no patient data.
>
> This PIA therefore describes the system as designed and built, so that it can be reviewed
> before launch rather than after. We will not place the App into live use or connect it to
> Kroll until this review is appropriately addressed.
>
> We welcome any questions from your office and will respond promptly to complete the
> review.
>
> Sincerely,
> Adeel Siddiqui, Proprietor
> Remedy Pills Pharmacy

---

## COVER PAGE

| Field | Value |
|---|---|
| **Official Project Name** | Remedy Pills Pharmacy Patient Portal (mobile app + web application) |
| **Other names used** | "RemedyPills," `ca.remedypills.app` |
| **Legal Name of Custodian** | [CONFIRM — likely "Remedy Pills Inc.," operating as Remedy Pills Pharmacy, per store-listing docs; confirm exact registered legal name] |
| **Person completing this PIA (OIPC's primary contact)** | [NAME, TITLE, PHONE, EMAIL] |
| **Person responsible for HIA compliance ("responsible affiliate" — HIA s.62)** | Nayel Anwer, Pharmacy Manager — remedypillspharmacy@gmail.com, +1 403-980-7003 *(currently listed as Privacy Officer in the app's own privacy policy; confirm this is the correct designation)* |
| **PIA submission date** | [DATE] |
| **Expected/actual implementation date** | **Not yet in live operation.** The App is currently in testing only, with no patient data. Go-live date is to be determined, following the OIPC's review of this PIA. The Kroll import feature is built but has not been connected to Kroll or run against any real data. |
| **OIPC file references for related prior PIAs** | None on file. |

---

## SECTION A — PROJECT SUMMARY

*(This section is published in the OIPC's public PIA Registry.)*

**1. What does the system do?**

The Remedy Pills Pharmacy Patient Portal is a mobile app (Android, published on Google Play
as `ca.remedypills.app`; iOS in development) and companion web application that lets
patients of Remedy Pills Pharmacy (Calgary, Alberta):

- View and request refills of their prescriptions
- Set personal medication reminders
- Book and manage pharmacy service appointments (consultations, injections, medication
  reviews)
- Exchange secure messages with pharmacy staff
- Log personal health measurements and food/calorie intake
- Manage family members' prescriptions where they hold caregiver authority
- Submit a prescription transfer request from another pharmacy
- **(Built, not yet enabled in production — no Kroll data has been imported) Link their provincial Health Card Number and/or confirm a name +
  date-of-birth match to import their existing medication history from the pharmacy's Kroll
  dispensing system into their profile**, with explicit patient confirmation required before
  anything is copied

Pharmacy staff use an administrative console within the same system to manage patient
records, respond to messages, send broadcast notifications and SMS, manage promotional
content, and — for the Kroll import feature, once enabled — upload a CSV export from Kroll (not yet used against any real data).

**2. Business rationale**

The App reduces phone-call volume for routine pharmacy interactions (refills, appointment
booking, status questions) and gives patients a persistent record of their own medications
and appointments. The Kroll import feature specifically addresses new patients who are
transferring to Remedy Pills Pharmacy or existing patients who have not previously used the
App: rather than re-entering their medication history by hand, they can have it populated
from the pharmacy's own dispensing records, subject to their explicit confirmation that the
record shown is theirs.

**3. Key players**

- **Custodian:** Remedy Pills Pharmacy (Nolan Hill, Calgary, AB), licensed under the Alberta
  College of Pharmacy.
- **Patients:** individuals with an account, who are current or prospective patients of the
  pharmacy.
- **Pharmacy staff / administrators:** pharmacists and pharmacy technicians with
  administrative access to the App, and to Kroll (the pharmacy's system of record for
  dispensing).
- **Hosting/technology vendors** (see Section C.6 for the full list and current agreement
  status): Railway (application hosting and database), Google (authentication, Google Play
  distribution), Twilio (SMS), Google/Gmail (transactional email), DigitalOcean (file/image
  storage for uploaded attachments).

**4. Where is health information stored/accessed?**

The system's database and application server currently run in Railway's **US West** region
— see the note under Section C.7. Uploaded files (e.g. patient-submitted images/PDFs) are
stored in DigitalOcean Spaces object storage; region to be confirmed (see Section C.7).
Staff access the App's administrative console and Kroll separately; Kroll itself is a
locally/vendor-hosted dispensing system not covered by this PIA except as a source of data
described in Section C.5.

**5. Why does the project need to collect, use, or disclose health information?**

Health information (prescription details, medication history, appointment records, health
measurements, and messages with pharmacy staff) is the core content the App exists to manage
on the patient's behalf, as part of the pharmacy's delivery of pharmacy services. The Kroll
import feature specifically needs to *use* existing dispensing records (already lawfully held
by the pharmacy as custodian) by copying a patient's own medication history into their App
profile, only after the patient — who is the subject of that information — has confirmed it
is theirs.

---

## SECTION B — ORGANIZATIONAL PRIVACY MANAGEMENT

**1. Management structure — `[PHARMACY TO COMPLETE]`**

*Describe who is accountable for privacy decisions (e.g. the Pharmacy Manager/Privacy
Officer), whether there is a privacy committee, and how privacy issues are escalated. The
App's own privacy policy currently names Nayel Anwer, Pharmacy Manager, as the designated
Privacy Officer — confirm this is accurate and describe reporting lines.*

**2. Policy management — `[PHARMACY TO COMPLETE]`**

*How are privacy policies developed, approved, communicated, and reviewed? See Section E:
several of the required written policies do not yet appear to exist as standalone
documents and will need to be created (see checklist at the end of this document).*

**3. Training and awareness — `[PHARMACY TO COMPLETE]`**

*What privacy training do pharmacy staff and administrators receive, and how often?*

**4. Incident response**

Partially implemented in the system itself: every sensitive action (Health Card Number
linked/unlinked, a linking conflict blocked, Kroll data uploaded/deleted, a Kroll match
claimed or declined, an account password changed, an account deleted, admin actions on
patient records) is written to an append-only audit log (`audit_logs` table) with the
acting user, action, detail, timestamp, and IP address. **What is not yet documented:** a
written incident-response *policy* describing who is notified, decision criteria for
notifying affected patients or the OIPC, and post-incident review. `[PHARMACY TO COMPLETE
— this policy must be written; see Section E]`.

**5. Access and correction requests**

Patients can view their own health information at any time by logging into the App
(prescriptions, appointments, health logs, messages are all patient-scoped by design — a
patient can only query their own records; see Section D.1). Patients can update their own
name, email, phone, date of birth, and Health Card Number directly (`PATCH /api/profile`).
Corrections to clinical data itself (e.g. a prescription's directions) are made by pharmacy
staff through the admin console. `[PHARMACY TO COMPLETE — describe the process/timeframe
for a patient who requests a correction pharmacy staff need to action, e.g. via a message
or phone call to the pharmacy.]`

---

## SECTION C — PROJECT PRIVACY ANALYSIS

### C.1 Health Information Listing

| Category | Data elements | Unique identifiers? |
|---|---|---|
| Registration / identity | Name, username, email, phone, date of birth, password (hashed, never stored in plain text) | Name + DOB combination; email; phone |
| **Health Card / Personal Health Number** *(new)* | Patient-entered provincial Health Card Number, stored digits-only, unique per account | **Yes — a real unique identifier** |
| Prescriptions | Drug name, strength, directions, Rx number, status, last fill date, refill count/auto-refill flag, optional linked family member | Rx number |
| Medication reminders | Medication name, scheduled time, frequency, taken/snoozed status | — |
| Appointments | Service type, date/time, status, pharmacist notes, patient notes | — |
| Messages | Free-text message content between patient and pharmacy staff, sender, timestamp, category | — |
| Health logs | Type of measurement, value, secondary value, unit, notes, timestamp | — |
| Calorie/food logs | Meal type, food items, calorie/macro estimates, optional photo, notes | — |
| Family members | Name, relationship, date of birth, caregiver's attestation of authority | — |
| **Kroll staged import data** *(new — see C.5)* | Patient name, DOB, Health Card Number (if present in the Kroll export), drug name, strength, directions, Rx number, last fill date | Health Card Number where present |
| Notifications | Type, title, body text, read status | — |
| Audit log | Acting user, action taken, free-text details, IP address, timestamp | — |
| Session data | Server-side session token, expiry | — |

### C.2 Information Flow Analysis

**Component 1 — Information Flow Diagram (description; a visual diagram should be produced
for the formal submission)**

```
                    ┌─────────────────────┐
   Patient  ───1───▶│                     │
   (registration,    │                     │
    profile, logs,   │                     │
    messages)        │   Remedy Pills App  │
                     │   (Railway, US West)│
   Pharmacy Staff ──2▶│                     │
   (Kroll CSV export,│                     │
    messages, admin  │                     │
    actions)         └──────────┬──────────┘
                                 │
                    ┌────────────┼────────────┬─────────────┬──────────────┐
                    ▼            ▼            ▼             ▼              ▼
                 Flow 3       Flow 4       Flow 5        Flow 6         Flow 7
                (Google      (Twilio SMS  (Gmail/       (DigitalOcean  (back to
                 OAuth —      — appt/     nodemailer    Spaces —       patient,
                 auth only)   refill      — transactional attachment    on login)
                              alerts)      email)        storage)
```

**Component 2 — Purposes and Legal Authority**

| # | Flow | Type of information | Purpose | Legal authority |
|---|---|---|---|---|
| 1 | Collection directly from patient (registration, profile edits, health logs, messages, Health Card Number) | Registration + health information | To provide the App's pharmacy-service features to the patient | Collection — HIA ss.18–24 |
| 2 | Collection from pharmacy staff (Kroll CSV upload) | Patient name, DOB, HCN, medication history | To populate a staging area from which a matching patient may import their own history | Collection — HIA s.20 (custodian already holds this information as dispensing records); indirect collection where staff act on the custodian's behalf |
| 3 | Disclosure to Google (OAuth) | Name, email (profile only — no health information) | Authentication | Use/Disclosure — limited to non-health identity data; no health information is sent to Google |
| 4 | Disclosure to Twilio | Phone number, minimal appointment/refill status text (no diagnosis or drug names sent by SMS) | SMS notification | Disclosure — HIA s.27/35(1)(a) use/disclosure for provision of health services, minimized per app design |
| 5 | Disclosure to Gmail/Google (nodemailer) | Email address, transactional content (appointment/prescription status) | Transactional email | Disclosure — same basis as above |
| 6 | Disclosure to DigitalOcean Spaces | Uploaded attachments (e.g. prescription images) | Storage of patient-submitted files | Use — Information Manager arrangement (HIA s.66) — **written agreement status to be confirmed, see C.6** |
| 7 | Use within the App — Kroll match/claim | Medication history (drug name, strength, directions, Rx number, fill date) | Copied into the patient's own prescriptions **only after the patient explicitly confirms the match is theirs** | Use — HIA ss.25–30; patient confirmation additionally documented in the audit log |
| 8 | Disclosure back to patient (in-app display) | All of the above, patient's own record only | Ongoing care / the patient viewing their own information | HIA s.33 |

### C.3 Notice

The App's `/privacy` page (linked from the app and required at Play Store submission) states
what information is collected and why, in patient-facing language, and names a Privacy
Officer and contact details. **This page needs to be updated to (a) correct the data-location
statement (see C.7) and (b) explicitly describe the Kroll import feature** — it currently
does not mention it. `[PHARMACY TO COMPLETE / ACTION ITEM]`

### C.4 Consent and Expressed Wishes

- **Account-level consent:** patients affirmatively check a consent checkbox at registration
  ("I consent to Remedy Pills Pharmacy storing my health information and managing my
  prescriptions electronically"), timestamped (`consentGiven`, `consentDate`), and can
  withdraw consent at any time (`POST /api/consent/withdraw`), which is itself audit-logged.
- **Kroll import specifically requires a second, separate, explicit action:** finding a
  possible match (by name+DOB passively, or by Health Card Number when the patient enters
  it) **never** copies anything into the patient's record on its own. The patient is shown
  only a summary — name, DOB, and a medication *count*, never the actual drug list — and
  must click "Yes, that's me" before any medication data is copied in. Declining is recorded
  in the audit log for HIA accountability. This is intentionally more protective than the
  HIA's general consent-not-required-for-care-purposes rule, because the risk of a
  false-positive name/DOB match (two different people sharing both) is a real, if narrow,
  privacy risk — see Section D.2.

### C.5 Data Matching

**Yes — this project performs data matching within the meaning of HIA ss.70–71**, and this
PIA is submitted in part to satisfy that requirement, in addition to section 64.

The Kroll import feature combines two sets of health information: (1) medication/dispensing
records exported from Kroll and staged in the App's database, and (2) a patient's own
account information (name, date of birth, and optionally their self-entered Health Card
Number). Matching occurs two ways:

1. **Passive name + DOB matching** — on every login, the App checks whether any unclaimed
   staged Kroll record matches the logged-in patient's own name and date of birth exactly
   (normalized for case/spacing/punctuation). If so, a banner offers to show them the match.
2. **Patient-initiated Health Card Number matching** — a patient may enter their Health Card
   Number, which the server checks against staged Kroll records sharing that number. This is
   the stronger match path, since a Health Card Number is a genuine unique identifier
   unlike name+DOB, which can collide between two people.

**Privacy risk specific to this matching:** because name+DOB is not a guaranteed-unique
identifier, an unlikely name+DOB collision between two different patients could cause a
patient to see a banner confirming that *someone* matching their name and birthdate has
medication records at the pharmacy, even before they click "Yes, that's me" — which is
itself a narrow disclosure (that a health relationship exists) though it never discloses
the actual medications. This risk is mitigated by (a) requiring explicit confirmation
before anything is copied, (b) the stronger Health Card Number path being available and
encouraged, and (c) both a match shown and a match declined being audit-logged. See
Section D.2 for the full risk/mitigation entry.

### C.6 Contracts and Agreements

| Vendor | Role | Data it can access | Information Manager Agreement (HIA s.66) on file? |
|---|---|---|---|
| **Railway** | Application hosting, PostgreSQL database (all patient/health data at rest) | Full database access as the underlying infrastructure provider | `[TO CONFIRM — likely NOT in place; see action item below]` |
| **Google** | OAuth authentication; Google Play distribution | Name, email (auth only) — no health information | `[TO CONFIRM]` — likely governed by Google's standard terms, not a custom IMA; confirm whether that is sufficient |
| **Twilio** | SMS delivery | Phone number, message text (minimized — no drug names) | `[TO CONFIRM]` |
| **Google (Gmail/nodemailer)** | Transactional email | Email address, message content | `[TO CONFIRM]` |
| **DigitalOcean** | Object storage for uploaded attachments | Uploaded files (may include prescription images) | `[TO CONFIRM]` |
| **TELUS Health (Kroll)** | Pharmacy's dispensing system of record; source of the CSV exports staff upload | N/A — Kroll does not receive data *from* the App; the App only imports from Kroll | Not an information manager *for this project* (Kroll is the pharmacy's own separate system); confirm the pharmacy's existing Kroll license permits this export/reuse |

**Action item:** none of these vendor relationships appear to have a written HIA-compliant
Information Manager Agreement in place, as best determined from the codebase and available
documentation. Per HIA s.66, a custodian using a third party to store, process, retrieve, or
dispose of health information on its behalf must have a written agreement meeting specific
statutory content requirements (objectives, whether the manager may collect/use/disclose
further, access-request handling, etc.). **This should be put in place — at minimum with
Railway, which holds the entire database — before or shortly after this PIA is submitted.**
`[PHARMACY TO ACTION]`

### C.7 Use of Health Information Outside Alberta

**Verified fact, disclosed here and now reflected in the App's privacy policy:**

The application server and PostgreSQL database are hosted on Railway in the **US West**
region (confirmed directly in Railway's console: the database's proxy endpoint is
`sakura.proxy.rlwy.net`, tagged "US West"; the application server shows the same region
tag). **All health information described in Section C.1 — including the new Health Card
Numbers and Kroll-imported medication history — will therefore be stored in the United
States, not in Alberta or elsewhere in Canada, once the App is live and begins holding
patient data.**

**Decision (2026-09-01): the pharmacy is keeping US hosting for now, not migrating to a
Canadian region.** Railway does not currently offer one in any case — its available regions
are US West, US East, EU West (Amsterdam), and Southeast Asia (Singapore); moving to Canadian
residency would require switching providers entirely (e.g. AWS ca-central-1, Azure Canada
Central/East, GCP northamerica-northeast1/2), which was considered and deferred.

The App's public privacy policy has accordingly been corrected (previously stated the
opposite — that records were "stored within Canada," which was inaccurate) to instead
disclose: "Our pharmacy records are currently hosted with a cloud infrastructure provider
located outside of Canada. We remain fully responsible for this information regardless of
where it is hosted, require our hosting provider to protect it accordingly, and are working
to store pharmacy records within Canada." The last clause ("working to store... within
Canada") should be revisited if the no-migration decision above becomes final/permanent
rather than "for now" — an OIPC reviewer may reasonably ask what that work consists of.

**Storage outside Alberta is permitted under the HIA**, but requires the extra measures
described in the *Health Information Regulation*, and the custodian's agreement with the
out-of-province provider (Railway) must contain the specific contractual language the
Regulation requires. **This has not been confirmed to be in place — still the open item to
close (see C.6).** Since the pharmacy is not migrating hosting, securing this contractual
language with Railway is now the operative path to compliance for this section, not a
fallback option.

The object storage for uploaded attachments (DigitalOcean Spaces) has a separately
configured region (`SPACES_REGION` environment variable) that was not verified as part of
this review — `[PHARMACY TO CONFIRM]`.

Additionally, Twilio, Google, and Gmail are US-domiciled global services; email and SMS
content is minimized (no drug names or diagnoses sent by SMS/email) but transits US
infrastructure. This is consistent with how most Alberta virtual-care technology already
operates and does not by itself require a different resolution, but should be listed here
for completeness per the OIPC template's instruction to "consider all possible disclosures
or uses of health information outside Alberta."

---

## SECTION D — PROJECT PRIVACY RISK MITIGATION

### D.1 Access Controls

| Position / Role | Number of staff in role | Type of access | Description of information this role can access |
|---|---|---|---|
| Patient | [PHARMACY: current registered count] | Read/write, own records only | Own registration data, prescriptions, appointments, messages, health logs, Health Card Number. Enforced server-side: every patient-facing query and mutation is scoped to `req.user!.id`; a patient cannot query another patient's records by guessing an ID. |
| Admin (pharmacist/pharmacy manager) | `[PHARMACY TO COMPLETE — number of staff with admin role]` | Read/write, all patients | Full read/write access to all patient records, messaging, Kroll CSV upload, broadcast notifications/SMS, promotional content, audit log. Gated by `requireAdmin` middleware — checked server-side on every admin route, not just hidden in the UI. |
| Unauthenticated visitor | N/A | None (except public routes) | Only the public marketing/privacy pages, the promo banner, and the public prescription-transfer / contact-webhook intake forms (rate-limited). No health information is accessible without authentication. |

**Authentication:** password-based (scrypt with random salt, timing-safe comparison — not a
fast/weak hash) or Google OAuth (native SDK on mobile, redirect flow on web); account lockout
after 5 failed attempts; session cookie backed by a server-side Postgres session store, not a
client-trusted token.

**Termination of access:** an admin account is removed via `DELETE /api/admin/users/:id`
(prevented for the last admin, so the pharmacy can't accidentally lock itself out).
`[PHARMACY TO COMPLETE — describe the staff offboarding process for revoking admin access
when someone leaves.]`

### D.2 Privacy Risk Assessment and Mitigation Plans

| Privacy risk | Description as it applies to this project | Mitigation measures already implemented | Policy reference |
|---|---|---|---|
| **1. Unauthorized use by authorized/internal parties** | An admin (pharmacy staff) could view or export patient data beyond what's needed for their task. | Every sensitive admin action is audit-logged (who, what, when, IP). Admin access itself requires the `requireAdmin` server-side check on every route — not just UI-level hiding. | `[PHARMACY: staff access/training policy — to be written]` |
| **2. Unauthorized collection/use/disclosure by external parties** | A hosting provider, or an attacker who breaches one, could access patient data. | HTTPS-only transport; Helmet security headers with a strict Content-Security-Policy in production; rate limiting on all API traffic and a stricter limiter on credential/messaging endpoints; passwords hashed (scrypt), never stored plain; server-side session validation. | `[PHARMACY: information security policy — to be written]` |
| **3. Loss of integrity of health information** | Data corrupted or altered without authorization. | Server-side validation (Zod schemas) on all writes; Kroll-claim events re-derive the match server-side rather than trusting client-submitted record IDs, preventing a tampered request from attaching the wrong medication history to an account. | — |
| **4. Loss, destruction, or loss of use of health information** | Data deleted or made unavailable. | Railway-managed Postgres with a persistent volume; retention logic (`server/retention.ts`) enforces the 10-year ACP rule rather than deleting early; account deletion (`DELETE /api/account`) preserves the underlying clinical record and only removes what has no retention obligation, specifically to avoid destroying records the pharmacy is legally required to keep. | `[PHARMACY: backup/disaster-recovery policy — to be written; confirm Railway's backup schedule for the Postgres volume]` |
| **5. Contractor/business partner non-compliance** | A vendor (Railway, Google, Twilio, DigitalOcean) mishandles data. | See Section C.6 — **this is the weakest area currently**: no confirmed written Information Manager Agreements. | `[PHARMACY: third-party/vendor management policy — to be written; IMAs to be executed]` |
| **6. Name+DOB false-positive match (project-specific)** | Two different patients could, in principle, share the same name and date of birth, causing an incorrect match to be surfaced. | Only a summary (name, DOB, medication *count*) is shown before confirmation — never drug names. Nothing is copied into a profile without explicit "Yes, that's me." A decline is audit-logged. The Health Card Number path avoids this risk entirely, since it is a genuine unique identifier. | — |
| **7. Staged Kroll data lingering unclaimed** | Bulk dispensing data uploaded to the App's database but never matched to a patient. | Automatic 75-day expiry on unclaimed staged records, swept daily; CSV file itself is parsed in memory only and never written to disk. | — |
| **8. Health Card Number reuse across accounts** | Two patient accounts both claiming the same Health Card Number, corrupting the "one card, one account" audit guarantee. | Enforced twice: an application-level pre-check for a clear error message, and a database-level `UNIQUE` constraint as the race-condition backstop (a concurrent duplicate request is rejected with a Postgres error the server specifically catches and reports). | — |

### D.3 Monitoring

The audit log (`audit_logs` table) captures every privacy-relevant action with actor, action
type, free-text detail, and timestamp, and is queryable by admins
(`GET /api/admin/audit-logs`). `[PHARMACY TO COMPLETE — describe who reviews these logs, how
often, and what would trigger escalation to a formal incident review.]`

### D.4 PIA Compliance

The pharmacy commits to reviewing this PIA whenever a material change is made to the
information described in it (new data elements, new vendors, new features that collect,
use, or disclose health information differently than described here), consistent with
section 8(3) of the *Health Information Regulation*, and to submitting a PIA amendment or
revised PIA to the OIPC when such changes occur. `[PHARMACY TO COMPLETE — name who owns this
review and how often it is scheduled, e.g. annually.]`

---

## SECTION E — POLICY & PROCEDURES ATTACHMENTS

**This is the section most likely to cause the OIPC to return this submission as incomplete
if sent as-is.** The Requirements are explicit: *"Incomplete PIA submissions will be returned
to the submitter un-reviewed. This applies particularly to submissions that are missing
policy and procedure attachments."*

Based on what exists in the codebase and documentation reviewed, **the pharmacy has strong
technical/operational practices already (audit logging, retention automation, minimized SMS
content, patient confirmation before data import) but does not appear to have these as
separate, written, organizational policy documents** — which is what this section requires.
The table below is a checklist, not a claim that these documents already exist:

| Topic | Status | Notes |
|---|---|---|
| Privacy Accountability | `[NEEDS TO BE WRITTEN]` | Who's responsible for privacy, information security, complaints; commitments to the practices already implemented in code |
| Access to Health Information (patient requests) | `[NEEDS TO BE WRITTEN]` | Process/timeframe — the app supports this technically; document the process |
| Correction Requests | `[NEEDS TO BE WRITTEN]` | |
| Training, Awareness & Sanctions | `[NEEDS TO BE WRITTEN]` | |
| Collection of Health Information & Notice | Largely covered by `/privacy` page | Needs the Kroll feature added and the storage-location correction (see C.7) |
| Use of Health Information | `[NEEDS TO BE WRITTEN]` | |
| Disclosure of Health Information | `[NEEDS TO BE WRITTEN]` | |
| Research | Likely N/A | State "not applicable — the pharmacy does not use patient data for research" if true |
| Third Parties | `[NEEDS TO BE WRITTEN]` | Ties directly to the IMA gap in C.6 |
| Privacy Impact Assessments (internal trigger policy) | `[NEEDS TO BE WRITTEN]` | When does the pharmacy decide internally that a new PIA is needed |
| Records Retention & Disposition | **Largely written already** — describe the existing 10-year ACP rule and its automated enforcement (`server/retention.ts`) as the policy | |
| Information Classification | `[NEEDS TO BE WRITTEN]` | |
| Risk Assessment | `[NEEDS TO BE WRITTEN]` | |
| Physical Security of Data & Equipment | `[NEEDS TO BE WRITTEN]` | Covers staff devices, how the Kroll CSV export is handled *before* upload (on a staff computer, outside the app's control) |
| Network & Communications Security | Partially covered | HTTPS, Helmet CSP, rate limiting are implemented — describe as policy |
| Access Controls | Partially covered | Server-side role enforcement exists — describe as policy, plus staff onboarding/offboarding process |
| Monitoring & Audit | Partially covered | Audit log exists — describe review cadence as policy |
| Incident Response | `[NEEDS TO BE WRITTEN]` | Most important gap — see B.4 |
| Business Continuity | `[NEEDS TO BE WRITTEN]` | Confirm Railway backup schedule |
| Change Control | `[NEEDS TO BE WRITTEN]` | |

Most of these can be short — a paragraph or two each is normal for an organization this
size. The OIPC's guidance is clear that thoroughness matters more than length.

---

## Before this is submitted — action checklist

1. ~~Fix the "stored in Canada" claim in `/privacy`~~ — **done 2026-09-01**, wording now
   accurately discloses US hosting.
2. Add the Kroll import feature to the patient-facing `/privacy` notice.
3. Confirm/execute Information Manager Agreements — at minimum with Railway.
4. Confirm the DigitalOcean Spaces storage region.
5. Write the Section E policy documents (or confirm which already exist elsewhere and just
   need attaching).
6. Fill in every `[PHARMACY TO COMPLETE]` bracket above.
7. ~~Have the responsible custodian (or authorized representative) review and sign the cover
   letter~~ — cover letter is finalized on official letterhead as
   `store-listing/Remedy_Pills_PIA_Cover_Letter.docx`; fill in the submission date and print/sign
   (or apply an e-signature) before sending.
8. Email the signed cover letter and this PIA to **pia@oipc.ab.ca**.

Expect a **preliminary response within ~45 days**, but current overall review turnaround can
run up to **12 months** given OIPC's backlog — worth starting now rather than waiting for
every checklist item above to be perfect first, since the guide itself notes it's fine to
submit and then respond to the Portfolio Officer's follow-up questions as they come.
