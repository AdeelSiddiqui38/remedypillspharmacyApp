/**
 * Whether to offer "Continue with Google" on the auth screens.
 *
 * Google's OAuth endpoints refuse requests from embedded WebViews and answer
 * with `disallowed_useragent` ("this browser or app may not be secure"). The
 * native shell is a Capacitor WebView pointed at the deployed site, so the
 * OAuth redirect that works fine in a normal browser dead-ends inside the app.
 *
 * A visibly broken sign-in path is also what the Play Store rejects under its
 * Broken Functionality policy, so the button is hidden in any WebView rather
 * than left to fail. Username/password sign-in works everywhere and is
 * unaffected.
 *
 * Same web bundle runs in both places: browser gets Google, WebView does not.
 *
 * To restore Google sign-in in the native apps, the server-side redirect flow
 * has to be replaced with a native one — @codetrix-studio/capacitor-google-auth
 * or an in-app browser tab that hands the session back — and then this can
 * simply return true.
 */
import { Capacitor } from "@capacitor/core";

/**
 * Android WebViews put a `wv` token in the platform section of the user agent.
 * Checked in addition to the Capacitor bridge for two reasons: the bridge is
 * injected by the native layer and we load the site over `server.url` rather
 * than from bundled assets, and Google blocks OAuth in *every* embedded
 * WebView — so this also covers in-app browsers like Facebook's or Instagram's.
 */
function isEmbeddedWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  return /;\s*wv\)/.test(navigator.userAgent);
}

/** True in a normal browser; false inside the native shell or any WebView. */
export function isSocialLoginAvailable(): boolean {
  return !Capacitor.isNativePlatform() && !isEmbeddedWebView();
}
