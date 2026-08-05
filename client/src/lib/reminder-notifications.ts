/**
 * Local push notifications for medication reminders (Capacitor).
 *
 * Native-only feature with a user-facing toggle in Account → Notifications.
 * The preference is stored per device (localStorage in the WebView) because
 * notifications are inherently a device-level concern — a patient may want
 * them on their phone but not their tablet.
 *
 * Everything is guarded so the same web bundle runs unchanged in a plain
 * browser (feature hidden) and in the Capacitor shell (feature available).
 */
import { Capacitor } from "@capacitor/core";

/** Minimal shape this module needs — matches the Reminder used in pharmacy-app.tsx. */
export interface Reminder {
  id: string;
  medicationName: string;
  time: string;
  taken: boolean;
}

const PREF_KEY = "rpp.reminderNotifications";

export function isNotificationsSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("LocalNotifications");
}

export function getNotificationsEnabled(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}

function setPref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* private mode etc. — feature simply won't persist */
  }
}

async function plugin() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

/**
 * Parse the reminder's free-text time ("08:00 AM", "8:00 pm", "14:30")
 * into 24h hour/minute. Returns null if unparseable — that reminder is
 * skipped rather than scheduled at a wrong time.
 */
export function parseReminderTime(time: string): { hour: number; minute: number } | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ampm = m[3]?.toLowerCase();
  if (minute > 59) return null;
  if (ampm === "pm" && hour !== 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;
  if (hour > 23) return null;
  return { hour, minute };
}

/** Stable positive 32-bit int from a reminder's UUID, for notification IDs. */
function notificationId(reminderId: string): number {
  let h = 0;
  for (let i = 0; i < reminderId.length; i++) {
    h = (h * 31 + reminderId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

/**
 * Turn the feature on: ask the OS for permission, then schedule.
 * Returns false if the user denied permission (caller should flip the
 * toggle back off and point them at system settings).
 */
export async function enableReminderNotifications(reminders: Reminder[]): Promise<boolean> {
  if (!isNotificationsSupported()) return false;
  const ln = await plugin();
  const perm = await ln.requestPermissions();
  if (perm.display !== "granted") {
    setPref(false);
    return false;
  }
  setPref(true);
  await syncReminderNotifications(reminders);
  return true;
}

/** Turn the feature off and cancel everything we scheduled. */
export async function disableReminderNotifications(): Promise<void> {
  setPref(false);
  if (!isNotificationsSupported()) return;
  try {
    const ln = await plugin();
    const pending = await ln.getPending();
    if (pending.notifications.length > 0) {
      await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }
  } catch (err) {
    console.error("Failed to cancel reminder notifications:", err);
  }
}

/**
 * Reconcile scheduled notifications with the current reminder list.
 * Called on toggle-on and whenever reminders change while enabled.
 * Cancel-all-then-reschedule keeps the logic simple and correct; the
 * volume (a handful of daily reminders) makes efficiency irrelevant.
 */
export async function syncReminderNotifications(reminders: Reminder[]): Promise<void> {
  if (!isNotificationsSupported() || !getNotificationsEnabled()) return;
  try {
    const ln = await plugin();

    const pending = await ln.getPending();
    if (pending.notifications.length > 0) {
      await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }

    const toSchedule = reminders
      .filter((r) => !r.taken)
      .map((r) => ({ r, at: parseReminderTime(r.time) }))
      .filter((x): x is { r: Reminder; at: { hour: number; minute: number } } => x.at !== null)
      .map(({ r, at }) => ({
        id: notificationId(r.id),
        title: "Medication reminder",
        body: `Time to take ${r.medicationName}`,
        // Repeats daily at the reminder's time, firing even when the app
        // is closed — handled by the OS, no server involvement.
        schedule: { on: { hour: at.hour, minute: at.minute }, allowWhileIdle: true },
        // Must match a drawable in android/app/src/main/res/drawable. Capacitor
        // silently falls back to a generic system icon when the name is wrong.
        smallIcon: "ic_stat_reminder",
      }));

    if (toSchedule.length > 0) {
      await ln.schedule({ notifications: toSchedule });
    }
  } catch (err) {
    console.error("Failed to sync reminder notifications:", err);
  }
}
