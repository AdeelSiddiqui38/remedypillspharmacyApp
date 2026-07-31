/**
 * Seeds the App Store / Play Store reviewer demo account.
 *
 * Apple and Google both require working credentials for login-gated apps.
 * This creates one patient account populated with entirely synthetic data so
 * reviewers can exercise every feature — including the two native ones
 * (medication reminder notifications, Face ID lock) — without ever touching
 * real patient health information.
 *
 * Run manually, not on boot:
 *
 *   REVIEWER_BOOTSTRAP_PASSWORD='<strong-password>' npx tsx server/seed-reviewer.ts
 *
 * Idempotent and safe to re-run. If the account already exists, nothing is
 * changed unless you pass --reset, which clears the deletable demo content
 * (prescriptions, reminders, health logs) and rebuilds it. Appointments and
 * messages have no delete method in `storage`, so they are only ever created
 * when none exist — this avoids silently duplicating them.
 *
 * The password is read from the environment and never stored in this repo.
 */
import "dotenv/config";
import { storage } from "./storage";
import { hashPassword } from "./auth";

const USERNAME = "appstore-review";

/** Local YYYY-MM-DD for an offset in days from today. */
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** ISO timestamp for an offset in days from now. */
function tsOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function main() {
  const reset = process.argv.includes("--reset");
  const password = process.env.REVIEWER_BOOTSTRAP_PASSWORD;

  if (!password) {
    console.error(
      "REVIEWER_BOOTSTRAP_PASSWORD is not set.\n\n" +
        "Run it like this (use a strong, unique password — you'll paste the\n" +
        "same one into App Store Connect / Play Console):\n\n" +
        "  REVIEWER_BOOTSTRAP_PASSWORD='...' npx tsx server/seed-reviewer.ts\n",
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("Refusing to seed: use a password of at least 12 characters.");
    process.exit(1);
  }

  let user = await storage.getUserByUsername(USERNAME);

  if (user) {
    console.log(`Reviewer account '${USERNAME}' already exists (id ${user.id}).`);
    if (!reset) {
      console.log("Demo content left as-is. Re-run with --reset to rebuild it.");
      return;
    }
    console.log("--reset given: clearing existing demo content…");
    for (const p of await storage.getPrescriptionsByUser(user.id)) {
      await storage.deletePrescription(p.id);
    }
    for (const r of await storage.getRemindersByUser(user.id)) {
      await storage.deleteReminder(r.id);
    }
    for (const h of await storage.getHealthLogsByUser(user.id)) {
      await storage.deleteHealthLog(h.id);
    }
  } else {
    user = await storage.createUser({
      username: USERNAME,
      password: await hashPassword(password),
      name: "App Review Tester",
      email: "appstore-review@remedypills.ca",
      phone: "403-555-0100",
      dob: "1980-01-01",
      role: "patient",
      provider: "local",
      providerId: null,
      consentGiven: true,
      consentDate: new Date().toISOString(),
      lastLoginAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    console.log(`Created reviewer account '${USERNAME}' (id ${user.id}).`);
  }

  const userId = user.id;

  // ---- Prescriptions (synthetic; common, non-sensitive maintenance meds) ----
  const prescriptions = [
    {
      userId,
      name: "Metformin",
      strength: "500 mg",
      directions: "Take one tablet twice daily with meals.",
      rxNumber: "DEMO-100001",
      status: "active",
      lastFillDate: dateOffset(-20),
      refillable: true,
      refillCount: 3,
      autoRefill: false,
    },
    {
      userId,
      name: "Atorvastatin",
      strength: "20 mg",
      directions: "Take one tablet at bedtime.",
      rxNumber: "DEMO-100002",
      status: "active",
      lastFillDate: dateOffset(-12),
      refillable: true,
      refillCount: 2,
      autoRefill: true,
    },
    {
      userId,
      name: "Ramipril",
      strength: "5 mg",
      directions: "Take one capsule each morning.",
      rxNumber: "DEMO-100003",
      status: "ready",
      lastFillDate: dateOffset(-2),
      refillable: false,
      refillCount: 0,
      autoRefill: false,
      pickupTime: "Ready for pickup",
    },
  ];

  // ---- Reminders (spread across the day so a reviewer sees a full list) ----
  const reminders = [
    { userId, medicationName: "Metformin 500 mg", time: "08:00 AM", frequency: "daily", taken: true, snoozed: false, category: "general" },
    { userId, medicationName: "Ramipril 5 mg", time: "09:00 AM", frequency: "daily", taken: false, snoozed: false, category: "general" },
    { userId, medicationName: "Metformin 500 mg", time: "06:00 PM", frequency: "daily", taken: false, snoozed: false, category: "general" },
    { userId, medicationName: "Atorvastatin 20 mg", time: "10:00 PM", frequency: "daily", taken: false, snoozed: false, category: "general" },
  ];

  const appointments = [
    {
      userId,
      service: "Medication Review",
      date: dateOffset(4),
      time: "02:00 PM",
      status: "upcoming",
      notes: null,
      patientNotes: "Demo booking for app review.",
    },
    {
      userId,
      service: "Flu Vaccination",
      date: dateOffset(-14),
      time: "11:00 AM",
      status: "completed",
      notes: null,
      patientNotes: null,
    },
  ];

  const healthLogs = [
    { userId, type: "blood_pressure", value: 122, secondaryValue: 78, unit: "mmHg", notes: "Morning reading", loggedAt: tsOffset(-3) },
    { userId, type: "blood_pressure", value: 118, secondaryValue: 76, unit: "mmHg", notes: null, loggedAt: tsOffset(-1) },
    { userId, type: "glucose", value: 5.6, secondaryValue: null, unit: "mmol/L", notes: "Fasting", loggedAt: tsOffset(-2) },
    { userId, type: "weight", value: 78.5, secondaryValue: null, unit: "kg", notes: null, loggedAt: tsOffset(-5) },
  ];

  const messages = [
    {
      userId,
      sender: "patient",
      text: "Hello, is my prescription ready for pickup?",
      timestamp: tsOffset(-1),
      category: "general",
    },
    {
      userId,
      sender: "pharmacy",
      text: "Hi! Yes, your Ramipril is ready at the counter. We're open until 7pm today.",
      timestamp: tsOffset(-1),
      category: "general",
    },
  ];

  for (const p of prescriptions) await storage.createPrescription(p);
  for (const r of reminders) await storage.createReminder(r);
  for (const h of healthLogs) await storage.createHealthLog(h);

  // No delete method exists for these two, so only create them when the
  // account has none — re-running must not pile up duplicates.
  const existingAppointments = await storage.getAppointmentsByUser(userId);
  const createdAppointments = existingAppointments.length === 0 ? appointments.length : 0;
  if (createdAppointments) {
    for (const a of appointments) await storage.createAppointment(a);
  }

  const existingMessages = await storage.getMessagesByUser(userId);
  const createdMessages = existingMessages.length === 0 ? messages.length : 0;
  if (createdMessages) {
    for (const m of messages) await storage.createMessage(m);
  }

  console.log(
    `Seeded: ${prescriptions.length} prescriptions, ${reminders.length} reminders, ` +
      `${healthLogs.length} health logs, ${createdAppointments} appointments, ${createdMessages} messages` +
      `${createdAppointments === 0 ? " (appointments/messages already present — skipped)" : ""}.`,
  );
  console.log(
    `\nUse these in App Store Connect / Play Console:\n` +
      `  Username: ${USERNAME}\n` +
      `  Password: (the REVIEWER_BOOTSTRAP_PASSWORD you just used)\n`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reviewer seed failed:", err);
    process.exit(1);
  });
