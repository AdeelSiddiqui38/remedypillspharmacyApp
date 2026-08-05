import { storage } from "./storage";

// Alberta College of Pharmacy record retention rule (see
// https://abpharmacy.ca/regulated-members/licensure/managing-my-pharmacy/storage-of-pharmacy-records/):
// patient records must be kept 10 years past the last date of pharmacy
// service, or — if the patient was a minor at that time — until 2 years
// past the age of majority (i.e. until they turn 20).
const RETENTION_YEARS = 10;
const MINOR_RETENTION_AGE = 20;
const SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000; // once a day is enough for a year-scale rule

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ageAt(dob: Date, when: Date): number {
  let age = when.getFullYear() - dob.getFullYear();
  const monthDiff = when.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && when.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

async function getLastServiceDate(userId: string): Promise<Date | null> {
  const [prescriptions, appointments] = await Promise.all([
    storage.getPrescriptionsByUser(userId),
    storage.getAppointmentsByUser(userId),
  ]);

  const dates = [
    ...prescriptions.map((p: any) => parseDate(p.lastFillDate)),
    ...appointments.map((a: any) => parseDate(a.date)),
  ].filter((d): d is Date => d !== null);

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

function isPastRetention(lastService: Date, dob: Date | null, now: Date): boolean {
  const retentionCutoff = new Date(lastService);
  retentionCutoff.setFullYear(retentionCutoff.getFullYear() + RETENTION_YEARS);

  if (dob) {
    const ageAtService = ageAt(dob, lastService);
    if (ageAtService < 18) {
      const minorCutoff = new Date(dob);
      minorCutoff.setFullYear(minorCutoff.getFullYear() + MINOR_RETENTION_AGE);
      // Keep the record until whichever cutoff is later.
      return now > retentionCutoff && now > minorCutoff;
    }
  }

  return now > retentionCutoff;
}

async function purgeUser(userId: string, lastServiceDate: Date) {
  await storage.createAuditLog({
    userId,
    action: "retention_auto_deletion",
    details: `Patient record auto-deleted: last pharmacy service on ${lastServiceDate.toISOString().slice(0, 10)}, exceeded ${RETENTION_YEARS}-year ACP retention period.`,
    ipAddress: "system",
    timestamp: new Date().toISOString(),
  });

  await Promise.all([
    storage.deleteAllPrescriptionsByUser(userId),
    storage.deleteAllRemindersByUser(userId),
    storage.deleteAllAppointmentsByUser(userId),
    storage.deleteAllMessagesByUser(userId),
    storage.deleteAllNotificationsByUser(userId),
    storage.deleteAllHealthLogsByUser(userId),
    storage.deleteAllCalorieLogsByUser(userId),
  ]);
  await storage.deleteUser(userId);
}

// Patients with no prescriptions/appointments on record have no "pharmacy
// service" date to anchor the retention rule to, so they're left alone here
// — only patients with an actual service history are eligible for the sweep.
export async function runRetentionSweep(): Promise<{ checked: number; deleted: number }> {
  const allUsers = await storage.getAllUsers();
  const patients = allUsers.filter((u: any) => u.role === "patient");
  const now = new Date();

  let deleted = 0;
  for (const patient of patients) {
    const lastService = await getLastServiceDate(patient.id);
    if (!lastService) continue;

    const dob = parseDate(patient.dob);
    if (isPastRetention(lastService, dob, now)) {
      try {
        await purgeUser(patient.id, lastService);
        deleted++;
        console.log(`[retention] Purged patient ${patient.id} (last service ${lastService.toISOString().slice(0, 10)})`);
      } catch (err) {
        console.error(`[retention] Failed to purge patient ${patient.id}:`, err);
      }
    }
  }

  return { checked: patients.length, deleted };
}

/**
 * Handle a patient asking for their own account to be deleted.
 *
 * Google Play and the App Store both require an in-app deletion path, but a
 * pharmacy cannot simply erase a patient on request: the ACP rule above still
 * applies to prescriptions and appointments, and those records identify the
 * patient, so the user row has to survive alongside them.
 *
 * So there are two outcomes:
 *   • No pharmacy service on record  → nothing to retain, purge everything now.
 *   • Has prescriptions/appointments → delete the data that isn't a pharmacy
 *     record (reminders, notifications, health and calorie logs), block sign-in
 *     by stamping `deletedAt`, and leave the clinical records for the sweep to
 *     purge when the retention period lapses.
 *
 * Returns what happened so the UI can tell the patient the truth rather than a
 * blanket "your data is gone".
 */
export async function deletePatientAccount(
  userId: string,
): Promise<{ purged: boolean; retainedUntil: string | null }> {
  const lastService = await getLastServiceDate(userId);

  if (!lastService) {
    await purgeUser(userId, new Date());
    return { purged: true, retainedUntil: null };
  }

  const user = await storage.getUser(userId);
  const dob = parseDate(user?.dob);

  // Non-clinical data has no retention obligation, so it goes immediately.
  await Promise.all([
    storage.deleteAllRemindersByUser(userId),
    storage.deleteAllNotificationsByUser(userId),
    storage.deleteAllHealthLogsByUser(userId),
    storage.deleteAllCalorieLogsByUser(userId),
  ]);

  await storage.updateUser(userId, { deletedAt: new Date().toISOString() });

  await storage.createAuditLog({
    userId,
    action: "account_deletion_requested",
    details:
      `Patient requested account deletion. Sign-in disabled and non-clinical data removed. ` +
      `Pharmacy records retained under the ${RETENTION_YEARS}-year ACP rule ` +
      `(last service ${lastService.toISOString().slice(0, 10)}).`,
    ipAddress: "user",
    timestamp: new Date().toISOString(),
  });

  const cutoff = new Date(lastService);
  cutoff.setFullYear(cutoff.getFullYear() + RETENTION_YEARS);
  if (dob && ageAt(dob, lastService) < 18) {
    const minorCutoff = new Date(dob);
    minorCutoff.setFullYear(minorCutoff.getFullYear() + MINOR_RETENTION_AGE);
    if (minorCutoff > cutoff) {
      return { purged: false, retainedUntil: minorCutoff.toISOString().slice(0, 10) };
    }
  }

  return { purged: false, retainedUntil: cutoff.toISOString().slice(0, 10) };
}

export function startRetentionSweepSchedule() {
  runRetentionSweep().catch((err) => console.error("[retention] Initial sweep failed:", err));
  setInterval(() => {
    runRetentionSweep().catch((err) => console.error("[retention] Scheduled sweep failed:", err));
  }, SWEEP_INTERVAL_MS);
}
