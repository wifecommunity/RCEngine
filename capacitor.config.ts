import { CapacitorConfig } from '@capacitor/cli';

// PENTING: ganti URL di bawah dengan alamat GitHub Pages kamu sendiri,
// formatnya: https://USERNAME.github.io/NAMA-REPO/
const LIVE_URL = 'https://USERNAME.github.io/NAMA-REPO/';

const config: CapacitorConfig = {
  appId: 'com.rcengine.goldterminal',
  appName: 'RC ENGINE',
  webDir: 'www',
  server: {
    url: LIVE_URL,
    androidScheme: 'https'
  }
};

export default config;
