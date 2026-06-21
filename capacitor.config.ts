import type { CapacitorConfig } from '@capacitor/cli';

// The app is a thin native shell that loads the live deployed site (same
// pattern in dev and prod) rather than bundling static assets, since the
// backend (sessions, prescriptions, etc.) has to be a real server either way.
//
// Build with CAPACITOR_ENV=production to point at the real deployed app
// instead of the local dev server. Update productionUrl once the DO App
// Platform custom domain is live (currently assumed to be app.remedypills.ca).
const isProduction = process.env.CAPACITOR_ENV === 'production';
const productionUrl = 'https://app.remedypills.ca';
const devUrl = 'http://10.0.2.2:3000'; // 10.0.2.2 = Android emulator's alias for the host machine's loopback

const config: CapacitorConfig = {
  appId: 'ca.remedypills.app',
  appName: 'RemedyPills Pharmacy',
  webDir: 'dist/public',
  server: isProduction
    ? { url: productionUrl }
    : { url: devUrl, cleartext: true },
};

export default config;
