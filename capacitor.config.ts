import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.remedypills.app',
  appName: 'RemedyPills Pharmacy',
  webDir: 'dist/public',
  // Dev-only: point the native shell at the local Express/Vite dev server so
  // we can test in the emulator without a production build. 10.0.2.2 is the
  // Android emulator's alias for the host machine's loopback interface.
  // Remove the `server` block before shipping a real build.
  server: {
    url: 'http://10.0.2.2:3000',
    cleartext: true,
  },
};

export default config;
