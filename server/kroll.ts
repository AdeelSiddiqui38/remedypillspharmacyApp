import { parse } from "csv-parse/sync";
import { storage } from "./storage";

// How long an uploaded Kroll batch stays in the staging table before it's
// purged if nobody claims it. Deliberately short: staff should upload small
// batches tied to the patients they're actively onboarding, not the whole
// Kroll roster at once, and this expiry is the backstop that keeps the
// app's internet-facing database from permanently holding medication data
// for patients who never install the app. See the schema comment in
// shared/schema.ts for the full reasoning (Alberta Health Information Act).
const STAGING_RETENTION_DAYS = 75;
const SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily is plenty for a ~2.5-month window

function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Strip common punctuation (commas from "Last, First" exports, periods,
    // hyphens) without a unicode property-escape regex, which needs a newer
    // TS/JS target than this project compiles against.
    .replace(/[.,'"()]/g, "");
}

// Accepts common Kroll export date formats (M/D/YYYY, YYYY-MM-DD, D-Mon-YYYY)
// and normalizes to YYYY-MM-DD so matching isn't sensitive to which format a
// given Kroll install exports. Falls back to the trimmed original if it
// can't be parsed, so a weird value doesn't silently vanish.
function normalizeDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return trimmed;
}

/**
 * Normalizes a Health Card / Personal Health Number to digits only, so
 * "123 456 789", "123-456-789" and "123456789" are all treated as the same
 * card. Canada's provincial PHNs are commonly nine digits (Alberta's
 * included) with no check digit, but this pharmacy may also serve
 * out-of-province patients carrying a different format, so length isn't
 * hard-enforced here — callers that need a user-facing validation message
 * should use isPlausibleHealthCardNumber below.
 */
export function normalizeHealthCardNumber(value: string): string {
  return value.replace(/\D/g, "");
}

/** Loose sanity check for a manually-typed Health Card Number, not a real checksum validation. */
export function isPlausibleHealthCardNumber(normalized: string): boolean {
  return normalized.length >= 6 && normalized.length <= 12;
}

function findField(row: Record<string, string>, ...candidates: string[]): string {
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const match = entries.find(([key]) => key.toLowerCase().replace(/[^a-z]/g, "").includes(candidate));
    if (match && typeof match[1] === "string" && match[1].trim()) return match[1].trim();
  }
  return "";
}

export interface ParsedKrollRow {
  patientName: string;
  dob: string;
  healthCardNumber: string;
  drugName: string;
  strength: string;
  directions: string;
  rxNumber: string;
  lastFillDate: string;
}

/**
 * Parses a Kroll "Rx for Drug/Doctor Groups" CSV export (Rx menu → Rx for
 * Drug/Doctor Groups → Save CSV). Column headers vary by pharmacy
 * configuration and Kroll version, so fields are matched case-insensitively
 * against common name variants rather than fixed headers. Rows missing a
 * patient name, date of birth, or drug name are dropped — all three are
 * required to safely match and populate a patient's profile later.
 */
export function parseKrollCsv(buffer: Buffer): ParsedKrollRow[] {
  const records: Record<string, string>[] = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  const rows: ParsedKrollRow[] = [];
  for (const record of records) {
    const patientName = findField(record, "patientname", "patient", "name");
    const dobRaw = findField(record, "dob", "dateofbirth", "birthdate", "birthdt");
    const drugName = findField(record, "drugname", "drug", "medication", "rxname");
    if (!patientName || !dobRaw || !drugName) continue;

    rows.push({
      patientName,
      dob: normalizeDate(dobRaw),
      healthCardNumber: findField(record, "healthcard", "healthcarenumber", "personalhealthnumber", "phn", "healthnumber", "hcn", "ahcip"),
      drugName,
      strength: findField(record, "strength", "dose", "dosage"),
      directions: findField(record, "directions", "sig", "instructions"),
      rxNumber: findField(record, "rxnumber", "rxno", "rxnbr", "prescriptionnumber"),
      lastFillDate: normalizeDate(findField(record, "filldate", "lastfilldate", "dispensedate", "dispdate")),
    });
  }
  return rows;
}

/**
 * Stores a parsed CSV as a new staging batch. Nothing here touches a
 * patient's live records — these rows sit in kroll_import_records until a
 * matching patient explicitly confirms the match (claimKrollMatch below).
 */
export async function createKrollImportBatch(uploadedByUserId: string, filename: string, rows: ParsedKrollRow[]) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + STAGING_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const batch = await storage.createKrollImportBatch({
    uploadedByUserId,
    filename,
    rowCount: rows.length,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  if (rows.length > 0) {
    await storage.createKrollImportRecords(
      rows.map((r) => ({
        batchId: batch.id,
        patientName: r.patientName,
        patientNameNormalized: normalizeName(r.patientName),
        dob: r.dob,
        healthCardNumber: r.healthCardNumber || null,
        healthCardNumberNormalized: r.healthCardNumber ? normalizeHealthCardNumber(r.healthCardNumber) || null : null,
        drugName: r.drugName,
        strength: r.strength || null,
        directions: r.directions || null,
        rxNumber: r.rxNumber || null,
        lastFillDate: r.lastFillDate || null,
        claimedByUserId: null,
        claimedAt: null,
      })),
    );
  }

  await storage.createAuditLog({
    userId: uploadedByUserId,
    action: "kroll_import_uploaded",
    details: `Uploaded Kroll CSV "${filename}": ${rows.length} medication row(s) staged as batch ${batch.id}, expires ${expiresAt.toISOString().slice(0, 10)} if unclaimed.`,
    ipAddress: "admin",
    timestamp: now.toISOString(),
  });

  return batch;
}

export interface KrollMatchCandidate {
  patientName: string;
  dob: string;
  medicationCount: number;
  recordIds: string[];
}

/**
 * Looks for unclaimed staged records matching a patient's name + DOB.
 * Deliberately returns only a name/DOB/count summary — never the actual
 * medication list — so the caller can show a patient "Is this you?" without
 * ever displaying real drug data for a match that turns out to be wrong.
 * Real medication data only gets copied in by claimKrollMatch, after the
 * patient has explicitly confirmed.
 */
export async function findKrollMatch(name: string, dob: string): Promise<KrollMatchCandidate | null> {
  if (!name?.trim() || !dob?.trim()) return null;
  const normalizedName = normalizeName(name);
  const normalizedDob = normalizeDate(dob);
  if (!normalizedName || !normalizedDob) return null;

  const records = await storage.getUnclaimedKrollRecords(normalizedName, normalizedDob);
  if (records.length === 0) return null;

  return {
    patientName: records[0].patientName,
    dob: records[0].dob,
    medicationCount: records.length,
    recordIds: records.map((r) => r.id),
  };
}

/**
 * Looks for unclaimed staged records by Health Card / Personal Health
 * Number — a real unique patient identifier, unlike name+DOB, which can
 * collide between two different people. This is the strong match path: the
 * patient types their own card number in (see POST
 * /api/kroll-match/by-health-card), so a match here is a much higher-
 * confidence signal than the passive name+DOB banner. Still returns only a
 * summary, never the medication list itself, so the "Is this you?"
 * confirmation step in the UI is preserved either way.
 */
export async function findKrollMatchByHealthCard(healthCardNumber: string): Promise<KrollMatchCandidate | null> {
  const normalized = normalizeHealthCardNumber(healthCardNumber || "");
  if (!isPlausibleHealthCardNumber(normalized)) return null;

  const records = await storage.getUnclaimedKrollRecordsByHealthCard(normalized);
  if (records.length === 0) return null;

  return {
    patientName: records[0].patientName,
    dob: records[0].dob,
    medicationCount: records.length,
    recordIds: records.map((r) => r.id),
  };
}

/**
 * Copies confirmed staging records into the patient's real prescriptions
 * and marks them claimed. Only ever called after the patient has explicitly
 * confirmed the match in the UI (see POST /api/kroll-match/claim) — never
 * silently. De-dupes against the patient's existing prescriptions by Rx
 * number so re-confirming, or a second batch containing the same fills,
 * doesn't create duplicate medications.
 */
export async function claimKrollMatch(userId: string, recordIds: string[]): Promise<number> {
  if (recordIds.length === 0) return 0;
  const records = await storage.getKrollRecordsByIds(recordIds);
  const unclaimed = records.filter((r) => !r.claimedByUserId);
  if (unclaimed.length === 0) return 0;

  const existing = await storage.getPrescriptionsByUser(userId);
  const existingRxNumbers = new Set(existing.map((p: any) => p.rxNumber).filter(Boolean));

  let created = 0;
  for (const r of unclaimed) {
    if (r.rxNumber && existingRxNumbers.has(r.rxNumber)) continue;
    await storage.createPrescription({
      userId,
      name: r.drugName,
      strength: r.strength || "—",
      directions: r.directions || "As directed by your pharmacist",
      rxNumber: r.rxNumber || `KROLL-${r.id.slice(0, 8)}`,
      status: "active",
      lastFillDate: r.lastFillDate || new Date().toISOString().slice(0, 10),
      refillable: true,
      refillCount: 0,
      autoRefill: false,
    });
    created++;
  }

  const now = new Date().toISOString();
  await storage.markKrollRecordsClaimed(unclaimed.map((r) => r.id), userId, now);

  await storage.createAuditLog({
    userId,
    action: "kroll_match_claimed",
    details: `Patient confirmed a Kroll import match: ${created} medication(s) added from ${unclaimed.length} staged record(s).`,
    ipAddress: "user",
    timestamp: now,
  });

  return created;
}

/** Records that a patient was shown a match and said it wasn't them, for HIA accountability. */
export async function declineKrollMatch(userId: string, recordIds: string[]): Promise<void> {
  await storage.createAuditLog({
    userId,
    action: "kroll_match_declined",
    details: `Patient was shown a Kroll import match and said it was not them (${recordIds.length} staged record(s) left unclaimed).`,
    ipAddress: "user",
    timestamp: new Date().toISOString(),
  });
}

async function sweepExpiredKrollBatches(): Promise<{ batches: number; records: number }> {
  const result = await storage.deleteExpiredKrollBatches(new Date().toISOString());
  if (result.batches > 0) {
    console.log(`[kroll] Purged ${result.batches} expired batch(es), ${result.records} unclaimed record(s)`);
  }
  return result;
}

export function startKrollSweepSchedule() {
  sweepExpiredKrollBatches().catch((err) => console.error("[kroll] Initial sweep failed:", err));
  setInterval(() => {
    sweepExpiredKrollBatches().catch((err) => console.error("[kroll] Scheduled sweep failed:", err));
  }, SWEEP_INTERVAL_MS);
}
