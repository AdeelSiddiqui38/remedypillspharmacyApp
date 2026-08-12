/**
 * Google sign-in, which needs a different flow in the app than on the web.
 *
 * Google's OAuth endpoints refuse requests from embedded WebViews and answer
 * with `disallowed_useragent` ("this browser or app may not be secure"), so the
 * server-side redirect flow dead-ends inside the Capacitor shell. The shell
 * instead signs in with Google's native SDK and posts the resulting ID token to
 * `/api/auth/google/native`, which verifies it and issues the session.
 *
 * Any *other* embedded WebView — Facebook's or Instagram's in-app browser, say
 * — has the redirect problem with no native SDK to fall back on, so the button
 * is hidden there rather than left to fail.
 */
import { Capacitor } from "@capacitor/core";

/**
 * Android WebViews put a `wv` token in the platform section of the user agent.
 * Used to spot in-app browsers; the Capacitor shell is identified separately by
 * `isNativePlatform()`, which is more reliable there.
 */
function isEmbeddedWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  return /;\s*wv\)/.test(navigator.userAgent);
}

/**
 * Whether to offer "Continue with Google" at all.
 *
 * The `isPluginAvailable` check is load-bearing, not defensive. This web bundle
 * is served over the network to whatever version of the shell is installed, so
 * a build that predates the SocialLogin plugin will run this exact code. Asking
 * the bridge whether the plugin is really there keeps the button hidden on
 * those older installs instead of showing one that throws on tap.
 */
export function isSocialLoginAvailable(): boolean {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.isPluginAvailable("SocialLogin");
  }
  // Plain browser: the redirect path works. Other WebViews: neither does.
  return !isEmbeddedWebView();
}

/**
 * Starts Google sign-in for the current platform.
 *
 * On the web this navigates away and never returns. On native it resolves once
 * the session cookie is set, and the caller should refetch the current user.
 * Throws with a user-presentable message if sign-in fails; a cancelled native
 * sign-in resolves to `false` so callers can stay silent.
 */
export async function signInWithGoogle(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    window.location.href = "/api/auth/google";
    return true;
  }

  const providers = await fetch("/api/auth/providers", { credentials: "include" })
    .then((r) => r.json())
    .catch(() => null);

  const webClientId: string | null = providers?.googleClientId ?? null;
  if (!webClientId) {
    throw new Error("Google sign-in is not configured on the server.");
  }

  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  await SocialLogin.initialize({ google: { webClientId } });

  let idToken: string | null = null;
  try {
    const { result } = await SocialLogin.login({ provider: "google", options: {} });
    // 'online' mode (the default) is the one that returns an ID token.
    if ("idToken" in result) idToken = result.idToken;
  } catch (err: any) {
    if (err?.code === "USER_CANCELLED") return false;
    // Keep the underlying code and message. Google's native SDK reports real
    // faults as numeric status codes — 10 is a signature/package mismatch
    // against the Android OAuth client, 12501 is a genuine cancel, 7 is a
    // network failure — and collapsing them into one string makes the
    // difference between "misconfigured" and "no signal" impossible to see.
    const detail = [err?.code, err?.message].filter(Boolean).join(": ");
    throw new Error(detail ? `Google sign-in failed — ${detail}` : "Google sign-in failed.");
  }

  if (!idToken) {
    throw new Error("Google did not return a sign-in token. Please try again.");
  }

  const res = await fetch("/api/auth/google/native", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || "Could not sign you in with Google.");
  }

  return true;
}
