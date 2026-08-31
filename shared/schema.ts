import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default(""),
  email: text("email"),
  phone: text("phone"),
  dob: text("dob"),
  // The patient's provincial Health Card / Personal Health Number, entered by
  // the patient themselves (never assigned by the app) to link their account
  // to their Kroll pharmacy record — see server/kroll.ts. Stored normalized
  // (digits only). UNIQUE at the database level is the audit control: it is
  // physically impossible for two patient accounts to hold the same Health
  // Card Number, so a matched/claimed medication history can never be
  // attached to more than one login. Nullable — most patients won't set this
  // until they use the "link my pharmacy record" flow.
  healthCardNumber: text("health_card_number").unique(),
  role: text("role").notNull().default("patient"),
  provider: text("provider").default("local"),
  providerId: text("provider_id"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentDate: text("consent_date"),
  lastLoginAt: text("last_login_at"),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  // Set when the patient asks for their account to be deleted. The row itself
  // has to survive: Alberta College of Pharmacy rules require the prescription
  // and appointment records hanging off it to be kept for 10 years past the
  // last pharmacy service, and those records identify the patient. Login is
  // refused from this moment on, and the retention sweep purges the row (and
  // everything under it) once the hold lapses. See server/retention.ts.
  deletedAt: text("deleted_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// A family member managed by a primary account holder (e.g. a parent
// managing a child's prescriptions, or an adult-child caregiver managing a
// parent's). The caregiver attests to having legal authority (parent/
// guardian or Personal Directive/POA) when adding one — consentAttestedAt
// records when that attestation was made, for HIA accountability.
export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountUserId: varchar("account_user_id").notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  dob: text("dob"),
  consentAttestedAt: text("consent_attested_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({ id: true });
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  strength: text("strength").notNull(),
  directions: text("directions").notNull(),
  rxNumber: text("rx_number").notNull(),
  status: text("status").notNull().default("active"),
  lastFillDate: text("last_fill_date").notNull(),
  refillable: boolean("refillable").notNull().default(true),
  refillCount: integer("refill_count").notNull().default(0),
  autoRefill: boolean("auto_refill").notNull().default(false),
  pickupTime: text("pickup_time"),
  familyMemberName: text("family_member_name"),
  familyMemberId: varchar("family_member_id"),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true });
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  medicationName: text("medication_name").notNull(),
  time: text("time").notNull(),
  frequency: text("frequency").notNull().default("daily"),
  taken: boolean("taken").notNull().default(false),
  snoozed: boolean("snoozed").notNull().default(false),
  category: text("category").default("general"),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true });
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  service: text("service").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").notNull().default("upcoming"),
  notes: text("notes"),
  patientNotes: text("patient_notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sender: text("sender").notNull(),
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  category: text("category"),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: text("created_at").notNull(),
  metadata: text("metadata"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const healthLogs = pgTable("health_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  value: real("value").notNull(),
  secondaryValue: real("secondary_value"),
  unit: text("unit").notNull(),
  notes: text("notes"),
  loggedAt: text("logged_at").notNull(),
});

export const insertHealthLogSchema = createInsertSchema(healthLogs).omit({ id: true });
export type InsertHealthLog = z.infer<typeof insertHealthLogSchema>;
export type HealthLog = typeof healthLogs.$inferSelect;

export const calorieLogs = pgTable("calorie_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mealType: text("meal_type").notNull(),
  foodItems: text("food_items").notNull(),
  totalCalories: real("total_calories").notNull(),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  fiber: real("fiber"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  loggedAt: text("logged_at").notNull(),
});

export const insertCalorieLogSchema = createInsertSchema(calorieLogs).omit({ id: true });
export type InsertCalorieLog = z.infer<typeof insertCalorieLogSchema>;
export type CalorieLog = typeof calorieLogs.$inferSelect;

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  timestamp: text("timestamp").notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export const promoBanners = pgTable("promo_banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const insertPromoBannerSchema = createInsertSchema(promoBanners).omit({ id: true });
export type InsertPromoBanner = z.infer<typeof insertPromoBannerSchema>;
export type PromoBanner = typeof promoBanners.$inferSelect;
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  // Use timestamp without timezone to match connect-pg-simple and the migration
  // This fixes "operator does not exist: text >= timestamp with time zone" error
  expire: timestamp("expire", { withTimezone: false, precision: 6 }).notNull(),
});

export const insertSessionSchema = createInsertSchema(session);
export type SessionRow = typeof session.$inferSelect;

// ── Kroll CSV staging import ────────────────────────────────────────────
// Staff periodically export a patient/medication CSV from Kroll (the
// pharmacy's TELUS Health system of record) and upload it via
// /api/admin/kroll-import. Rows land here — a holding table — NOT in a
// patient's live prescriptions, so nothing is visible to anyone until the
// matching patient is shown the match and explicitly confirms it's them
// (see findKrollMatch/claimKrollMatch in server/kroll.ts). Unclaimed rows
// auto-expire (server/kroll.ts sweep) so the app's internet-facing database
// never holds a standing copy of the whole Kroll patient roster — patients
// who never install the app should not have their medication history
// sitting here indefinitely. This matters under Alberta's Health
// Information Act, which still applies to data in staging.
export const krollImportBatches = pgTable("kroll_import_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploadedByUserId: varchar("uploaded_by_user_id").notNull(),
  filename: text("filename").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const insertKrollImportBatchSchema = createInsertSchema(krollImportBatches).omit({ id: true });
export type InsertKrollImportBatch = z.infer<typeof insertKrollImportBatchSchema>;
export type KrollImportBatch = typeof krollImportBatches.$inferSelect;

export const krollImportRecords = pgTable("kroll_import_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull(),
  patientName: text("patient_name").notNull(),
  // Lowercased/whitespace-collapsed copy used for matching; patientName
  // keeps the original CSV casing for display.
  patientNameNormalized: text("patient_name_normalized").notNull(),
  dob: text("dob").notNull(),
  // Optional — not every Kroll export includes it, but when present this is
  // by far the strongest match key (a real unique patient identifier, unlike
  // name+DOB which can collide). See healthCardNumberNormalized below and
  // findKrollMatchByHealthCard in server/kroll.ts.
  healthCardNumber: text("health_card_number"),
  healthCardNumberNormalized: text("health_card_number_normalized"),
  drugName: text("drug_name").notNull(),
  strength: text("strength"),
  directions: text("directions"),
  rxNumber: text("rx_number"),
  lastFillDate: text("last_fill_date"),
  claimedByUserId: varchar("claimed_by_user_id"),
  claimedAt: text("claimed_at"),
});

export const insertKrollImportRecordSchema = createInsertSchema(krollImportRecords).omit({ id: true });
export type InsertKrollImportRecord = z.infer<typeof insertKrollImportRecordSchema>;
export type KrollImportRecord = typeof krollImportRecords.$inferSelect;