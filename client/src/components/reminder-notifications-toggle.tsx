/**
 * Reminders → notifications toggle for medication reminder alerts.
 *
 * Renders nothing on the web; it only appears inside the native shell where
 * local notifications are available. Turning it on asks the OS for permission
 * and schedules a daily notification for each un-taken reminder; turning it
 * off cancels them. Actual re-scheduling when reminders change is handled by
 * an effect in the parent (see syncReminderNotifications usage in pharmacy-app).
 */
import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  disableReminderNotifications,
  enableReminderNotifications,
  getNotificationsEnabled,
  isNotificationsSupported,
  type Reminder,
} from "@/lib/reminder-notifications";

export function ReminderNotificationsToggle({ reminders }: { reminders: Reminder[] }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(getNotificationsEnabled());
  const [busy, setBusy] = useState(false);

  // Native-only feature — hidden entirely in a plain browser.
  if (!isNotificationsSupported()) return null;

  const onToggle = async (next: boolean) => {
    setBusy(true);
    if (next) {
      const ok = await enableReminderNotifications(reminders);
      setEnabled(ok);
      if (!ok) {
        toast({
          title: "Notifications not enabled",
          description:
            "Allow notifications for RemedyPills in your device Settings to get medication reminders.",
          variant: "destructive",
        });
      }
    } else {
      await disableReminderNotifications();
      setEnabled(false);
    }
    setBusy(false);
  };

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" /> Reminder Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Notify me when it's time to take my medication
            </p>
            <p className="text-xs text-muted-foreground">
              Sends a reminder on this device at each dose time, even when the
              app is closed.
            </p>
          </div>
          <Switch
            checked={enabled}
            disabled={busy}
            onCheckedChange={onToggle}
            data-testid="switch-reminder-notifications"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ReminderNotificationsToggle;
