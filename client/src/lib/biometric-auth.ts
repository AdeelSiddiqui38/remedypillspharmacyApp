/**
 * Biometric app lock (Face ID / Touch ID / fingerprint) for Capacitor.
 *
 * Native-only feature with a user-facing toggle in Account → Security.
 * When enabled, the app shows a lock screen and requires a biometric
 * verification every time it is opened or returns to the foreground —
 * protecting a patient's health information if the phone is left unlocked.
 *
 * The preference is stored per device (localStorage in the WebView) because
 * a device lock is inherently a device-level concern. Everything is guarded
 * so the same web bundle runs unchanged in a plain browser (feature hidden)
 * and in the Capacitor shell (feature available).
 *
 * Plugin: @aparajita/capacitor-biometric-auth (Capacitor 8 compatible).
 * After adding it, run `npm install && npx cap sync ios` on the Mac build.
 */
import { Capacitor } from "@capacitor/core";

const PREF_KEY = "rpp.biometricLock";

/** True only inside the native shell with the biometric plugin present. */
export function isBiometricSupported(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("BiometricAuth");
}

async function plugin() {
  return await import("@aparajita/capacitor-biometric-auth");
}

export function getLockEnabled(): boolean {
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

/** True if the device actually has biometrics enrolled and ready to use. */
export async function isBiometryAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    const { BiometricAuth } = await plugin();
    const info = await BiometricAuth.checkBiometry();
    return info.isAvailable;
  } catch {
    return false;
  }
}

/** Human label for the current device's biometry, e.g. "Face ID". */
export async function getBiometryLabel(): Promise<string> {
  if (!isBiometricSupported()) return "Biometrics";
  try {
    const { BiometricAuth, BiometryType } = await plugin();
    const info = await BiometricAuth.checkBiometry();
    switch (info.biometryType) {
      case BiometryType.faceId:
        return "Face ID";
      case BiometryType.touchId:
        return "Touch ID";
      case BiometryType.fingerprintAuthentication:
        return "Fingerprint";
      case BiometryType.faceAuthentication:
        return "Face Unlock";
      case BiometryType.irisAuthentication:
        return "Iris";
      default:
        return "Biometrics";
    }
  } catch {
    return "Biometrics";
  }
}

/**
 * Prompt the OS biometric dialog. Resolves true on success, false on
 * cancel or failure (the plugin throws a BiometricError, which we swallow
 * so callers get a simple boolean).
 */
export async function authenticateBiometric(reason: string): Promise<boolean> {
  if (!isBiometricSupported()) return false;
  try {
    const { BiometricAuth } = await plugin();
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Cancel",
      iosFallbackTitle: "Use passcode",
      // Let the OS fall back to the device passcode if biometrics fail,
      // so a legitimate user is never fully locked out on their own phone.
      allowDeviceCredential: true,
      androidTitle: "Remedy Pills Pharmacy",
      androidSubtitle: reason,
      androidConfirmationRequired: false,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Turn the lock on: verify once so the user proves biometrics work right
 * now before we start gating the app on them. Returns false (and stays off)
 * if verification is cancelled or unavailable.
 */
export async function enableBiometricLock(): Promise<boolean> {
  if (!(await isBiometryAvailable())) return false;
  const ok = await authenticateBiometric("Enable biometric lock");
  if (ok) setPref(true);
  return ok;
}

/** Turn the lock off. No verification needed to disable from within a session. */
export function disableBiometricLock(): void {
  setPref(false);
}

/**
 * Fire `listener` each time the app returns to the foreground (native only).
 * Used by the lock screen to re-lock on resume. Returns a handle to remove
 * the listener, or null when unsupported.
 */
export async function onAppResume(
  listener: () => void,
): Promise<{ remove: () => void } | null> {
  if (!isBiometricSupported()) return null;
  try {
    const { BiometricAuth } = await plugin();
    // The plugin requires checkBiometry() to be called at least once before
    // addResumeListener(); do it here so callers don't have to.
    await BiometricAuth.checkBiometry();
    const handle = await BiometricAuth.addResumeListener(() => listener());
    return handle;
  } catch {
    return null;
  }
}
