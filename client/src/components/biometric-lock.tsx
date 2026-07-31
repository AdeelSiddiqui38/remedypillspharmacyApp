/**
 * Full-screen lock overlay that gates the app behind Face ID / Touch ID.
 *
 * Wraps the app router. It renders children unchanged unless a lock is
 * required (native platform + feature enabled + a logged-in user), in which
 * case it shows a lock screen and prompts for biometric verification. It
 * re-locks whenever the app returns to the foreground.
 *
 * On the web (or when the feature is off), this is a transparent passthrough.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Fingerprint, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  authenticateBiometric,
  getLockEnabled,
  isBiometricSupported,
  onAppResume,
} from "@/lib/biometric-auth";

export function BiometricLock({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [locked, setLocked] = useState(false);
  const [authing, setAuthing] = useState(false);
  const [failed, setFailed] = useState(false);

  const lockIfNeeded = useCallback(() => {
    if (user && isBiometricSupported() && getLockEnabled()) setLocked(true);
  }, [user]);

  // Lock on first mount and whenever a user session appears.
  useEffect(() => {
    lockIfNeeded();
  }, [lockIfNeeded]);

  // Re-lock every time the app returns to the foreground.
  useEffect(() => {
    let handle: { remove: () => void } | null = null;
    onAppResume(() => lockIfNeeded()).then((h) => {
      handle = h;
    });
    return () => handle?.remove();
  }, [lockIfNeeded]);

  const unlock = useCallback(async () => {
    setAuthing(true);
    setFailed(false);
    const ok = await authenticateBiometric("Unlock RemedyPills Pharmacy");
    setAuthing(false);
    if (ok) setLocked(false);
    else setFailed(true);
  }, []);

  // Auto-prompt as soon as we become locked.
  useEffect(() => {
    if (locked) void unlock();
    // Intentionally depend only on `locked`: we want one prompt per lock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  if (!locked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-[hsl(186,86%,96%)] to-white px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[hsl(186,86%,30%)] text-white">
        <Lock className="h-9 w-9" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">RemedyPills Pharmacy</h1>
        <p className="text-sm text-muted-foreground">
          {failed ? "Authentication needed to continue." : "Verifying your identity…"}
        </p>
      </div>
      <Button
        onClick={unlock}
        disabled={authing}
        className="rounded-2xl px-6"
        data-testid="button-biometric-unlock"
      >
        {authing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="mr-2 h-4 w-4" />
        )}
        {authing ? "Verifying…" : "Unlock"}
      </Button>
    </div>
  );
}

export default BiometricLock;
