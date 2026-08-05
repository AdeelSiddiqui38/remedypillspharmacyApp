import type { CapacitorConfig } from '@capacitor/cli';

// The app is a thin native shell that loads the live deployed site (same
// pattern in dev and prod) rather than bundling static assets, since the
// backend (sessions, prescriptions, etc.) has to be a real server either way.
//
// Build with CAPACITOR_ENV=production to point at the real deployed app
// instead of the local dev server. This must be a URL that actually resolves —
// pointing it at a domain whose DNS hasn't propagated yet ships an app that
// opens to a blank error page (Play Store rejects that as broken functionality).
// Switch to https://app.remedypills.ca once that domain is live and verified.
const isProduction = process.env.CAPACITOR_ENV === 'production';
const productionUrl = 'https://remedypillspharmacyapp-production.up.railway.app';
const devUrl = 'http://10.0.2.2:3000'; // 10.0.2.2 = Android emulator's alias for the host machine's loopback

const config: CapacitorConfig = {
  appId: 'ca.remedypills.app',
  appName: 'Remedy Pills Pharmacy',
  webDir: 'dist/public',
  server: isProduction
    ? { url: productionUrl }
    : { url: devUrl, cleartext: true },
};

export default config;
