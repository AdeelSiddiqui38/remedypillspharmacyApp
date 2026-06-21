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

export function startRetentionSweepSchedule() {
  runRetentionSweep().catch((err) => console.error("[retention] Initial sweep failed:", err));
  setInterval(() => {
    runRetentionSweep().catch((err) => console.error("[retention] Scheduled sweep failed:", err));
  }, SWEEP_INTERVAL_MS);
}
