# PIA Submission Record — Remedy Pills Pharmacy Patient Portal

Running record of the Alberta *Health Information Act* Privacy Impact Assessment (PIA) and the
decisions and app changes tied to it. Update this file as the OIPC review progresses.

## Submission

| Item | Detail |
|---|---|
| Submitted to | Office of the Information and Privacy Commissioner of Alberta (OIPC), `pia@oipc.ab.ca` |
| Submitted on | 2026-10-31 |
| Documents sent | `Application.pdf` (signed cover letter + PIA) and `Appendix.pdf` (Appendix E-1, Privacy & Information Security Policy Manual) — signed PDFs kept in the `PIA Package` folder alongside this repo |
| Source documents in this repo | `HIA_Privacy_Impact_Assessment_DRAFT.md/.docx`, `Remedy_Pills_PIA_Cover_Letter.md/.docx`, `Remedy_Pills_Appendix_E1_Policy_Manual.md/.docx` (as of commit `512d81e`) |
| OIPC acknowledgement | Automatic receipt confirmation received 2026-10-31 |
| OIPC file number | *Pending — issued once the submission is processed* |
| Assigned Portfolio Officer | *Pending* |

If no file number arrives, contact `generalinfo@oipc.ab.ca` **before** resubmitting, to avoid a
duplicate submission. The `pia@` inbox accepts submissions only.

## Commitments made in the cover letter

- The App will not be placed into live use, and will not be connected to Kroll, until the OIPC
  review is complete.
- No patient information has been captured or entered into the App.

## Actions taken to keep those commitments (2026-10-31)

| Action | Detail |
|---|---|
| Android app unpublished from Google Play | Play Console → Advanced settings → App availability → **Unpublished**. New users cannot find or install it; the 4 existing installs (own/staff devices) keep working. An unsubmitted "Turn on Managed Google Play" draft had disabled the Unpublish option; it was reverted to "Turn off" first. **Do not use "Delete app"** — it is permanent. To relaunch: App availability → Published. |
| Public sign-up closed on the web portal | Commit `4fb2cf6`. Self-registration (sign-up form, Google on web, Google in the app) is refused unless the server environment variable `REGISTRATION_OPEN=true` is set on Railway. Existing accounts can still sign in; admins can still create accounts from the admin console. |
| Privacy policy hosting statement corrected | Commit `fb7feb6`. The `/privacy` page now discloses that records are hosted outside Canada (Railway, US West), replacing an inaccurate "stored within Canada" statement. |

## Decisions on record

- **Hosting:** Keep Railway (US West) for now. Railway has no Canadian region; moving to a
  Canadian-region provider was considered and deferred.
- **Encryption:** File the PIA first; add application-level field encryption later. Planned
  approach: AES-256-GCM on sensitive fields (patient name, date of birth, Health Card Number,
  medication details, messages, health logs, Kroll staging tables), key held outside the
  database, keyed-hash "blind index" values for matching and uniqueness. This plan is **not**
  in the submitted PIA; once implemented, submit a PIA amendment to the OIPC.

## Open follow-ups

- [ ] Record the OIPC file number and Portfolio Officer here when received.
- [ ] Information Manager Agreement (HIA s.66) with Railway, including the out-of-province
      safeguards required by the Health Information Regulation; then Twilio, Google/Gmail and
      DigitalOcean.
- [ ] Confirm the DigitalOcean Spaces storage region.
- [ ] Add the Kroll medication-history import feature to the patient-facing `/privacy` page.
- [ ] Implement field-level encryption, then file a PIA amendment.
- [ ] After OIPC review completes: republish the Android app and set `REGISTRATION_OPEN=true`
      on Railway to reopen sign-up.
