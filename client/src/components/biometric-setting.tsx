/**
 * Account → Security toggle for the biometric app lock.
 *
 * Renders nothing on the web or when the device has no enrolled biometrics,
 * so it only appears where it actually works (the native shell on a device
 * with Face ID / Touch ID / fingerprint set up).
 */
import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  disableBiometricLock,
  enableBiometricLock,
  getBiometryLabel,
  getLockEnabled,
  isBiometryAvailable,
} from "@/lib/biometric-auth";

export function BiometricSetting() {
  const { toast } = useToast();
  const [available, setAvailable] = useState(false);
  const [label, setLabel] = useState("Biometrics");
  const [enabled, setEnabled] = useState(getLockEnabled());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    isBiometryAvailable().then((ok) => {
      if (!active) return;
      setAvailable(ok);
      if (ok) getBiometryLabel().then((l) => active && setLabel(l));
    });
    return () => {
      active = false;
    };
  }, []);

  if (!available) return null;

  const onToggle = async (next: boolean) => {
    setBusy(true);
    if (next) {
      const ok = await enableBiometricLock();
      setEnabled(ok);
      if (!ok) {
        toast({
          title: `Couldn't enable ${label}`,
          description: "Verification was cancelled or failed.",
          variant: "destructive",
        });
      }
    } else {
      disableBiometricLock();
      setEnabled(false);
    }
    setBusy(false);
  };

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Fingerprint className="h-4 w-4 text-primary" /> Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Require {label} to open the app
            </p>
            <p className="text-xs text-muted-foreground">
              Adds a lock screen each time you open RemedyPills, protecting your
              health information on this device.
            </p>
          </div>
          <Switch
            checked={enabled}
            disabled={busy}
            onCheckedChange={onToggle}
            data-testid="switch-biometric-lock"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default BiometricSetting;
