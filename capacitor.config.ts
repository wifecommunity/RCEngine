import { CapacitorConfig } from '@capacitor/cli';

// MODE: LOKAL (offline-capable, hybrid auto-update)
// App membaca file dari folder `www/` yang dibundle LANGSUNG di dalam APK.
// Jadi bisa dibuka tanpa internet. Script auto-update di dalam index.html
// akan cek ke GitHub Pages saat online, dan menawarkan reload kalau ada
// versi baru — tapi TIDAK otomatis mengganti file lokal di APK.
//
// PENTING: setiap kali kamu ubah www/index.html dan ingin user dapat versi
// baru SECARA OTOMATIS via banner update, kamu juga harus:
//   1. Copy file yang sama ke docs/index.html
//   2. Naikkan versi di docs/version.json DAN di APP_VERSION (dalam index.html)
//   3. Push ke GitHub (GitHub Pages otomatis update docs/)
// User yang sudah install APK akan lihat banner "Update tersedia" saat online,
// tapi APK itu sendiri baru benar-benar berubah isinya kalau kamu build APK
// baru & user install ulang.

const config: CapacitorConfig = {
  appId: 'com.rcengine.goldterminal',
  appName: 'RC ENGINE',
  webDir: 'www'
  // tidak ada "server.url" -> Capacitor load index.html dari folder www/ (lokal)
};

export default config;
