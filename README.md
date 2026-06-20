# RC ENGINE — APK Lokal (offline-capable + auto-update notice)

Setup ini membuat APK yang membundle file `www/index.html` LANGSUNG di
dalamnya. Jadi alurnya beda dari versi "live URL" sebelumnya:

```
www/index.html  ->  dibundle di dalam APK saat build  ->  bisa dibuka OFFLINE
docs/index.html ->  GitHub Pages (URL web biasa)      ->  dipakai APK untuk CEK update
```

- App bisa dibuka **tanpa internet** karena file HTML-nya ada di dalam APK.
- Saat HP **online**, app diam-diam cek `docs/version.json` di GitHub Pages.
  Kalau ada versi lebih baru, muncul banner kecil "Update tersedia" di
  bawah layar — user bisa tap untuk lihat versi terbaru di web (tapi ini
  TIDAK mengganti file di dalam APK, cuma membuka versi web sementara).
- Untuk benar-benar mengupdate isi APK, kamu harus **build APK baru &
  install ulang** di HP (lihat Langkah 5).

## Langkah 1 — Buat repo & push semua file
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/rc-engine-apk.git
git push -u origin main
```

## Langkah 2 — Aktifkan GitHub Pages (untuk auto-update checker)
1. Di repo GitHub -> **Settings** -> **Pages** (menu kiri)
2. Bagian **Source**, pilih branch `main` dan folder `/docs`
3. Klik **Save**, tunggu 1-2 menit sampai GitHub kasih URL Pages-nya

## Langkah 3 — Masukkan URL itu ke index.html
Edit **dua** file ini (isinya harus sama persis): `www/index.html` dan
`docs/index.html`. Cari baris:
```js
const REMOTE_VERSION_URL = "https://USERNAME.github.io/NAMA-REPO/version.json";
const REMOTE_PAGE_URL = "https://USERNAME.github.io/NAMA-REPO/index.html";
```
Ganti `USERNAME` dan `NAMA-REPO` dengan punya kamu.

## Langkah 4 — Build APK pertama kali
1. Commit & push perubahan di atas — ini otomatis memicu GitHub Actions
   (karena `www/` bukan bagian dari `paths-ignore`)
2. Buka tab **Actions** -> tunggu sampai centang hijau selesai
3. Download `rc-engine-debug-apk` dari bagian **Artifacts**
4. Install di HP seperti biasa

## Langkah 5 — Update tampilan/fitur (PENTING, beda dari versi live-URL)
Karena file HTML dibundle DI DALAM APK, setiap kali kamu ubah tampilan:
```bash
# 1. Edit www/index.html sesuai kebutuhan
# 2. Copy perubahan yang sama ke docs/index.html (biar versi web ikut update)
cp www/index.html docs/index.html

# 3. Naikkan versi di DUA tempat:
#    a) docs/version.json -> ganti "version": "1.0.1" (atau angka berikutnya)
#    b) www/index.html DAN docs/index.html -> cari baris:
#       const APP_VERSION = "1.0.0";
#       ganti jadi versi yang sama dengan version.json

git add .
git commit -m "Update tampilan v1.0.1"
git push
```
- Push ini **otomatis trigger build APK baru** (karena `www/` berubah)
- Tunggu di tab **Actions**, lalu download APK baru dari **Artifacts**
- **Install ulang APK ini di HP** (timpa yang lama, data app tetap aman)
- User yang masih pakai APK versi lama akan lihat banner "Update tersedia"
  saat mereka online — ini mengingatkan mereka untuk update, tapi mereka
  TETAP harus instal APK baru secara manual (banner tidak auto-install)

## Kenapa harus install ulang tiap edit? (Trade-off yang disengaja)
Ini konsekuensi dari memilih mode **lokal/offline**:
- App bisa dibuka tanpa internet
- Lebih cepat buka (tidak nunggu load dari server)
- Setiap perubahan konten butuh build APK baru + install ulang
- User butuh effort manual untuk update (tidak otomatis seperti versi live-URL)

Kalau kamu lebih mengutamakan auto-update tanpa install ulang (dan app
selalu online), pertimbangkan kembali ke setup "live URL" sebelumnya —
itu lebih cocok untuk app yang sering diupdate kontennya seperti trading
terminal ini.

## Kapan harus build APK ulang?
- Setiap kali `www/index.html` berubah (lihat Langkah 5), ATAU
- Mengubah hal di luar konten halaman: nama app, ikon, `appId`

Untuk trigger manual, jalankan lewat tab **Actions** -> pilih workflow
"Build Android APK" -> klik **Run workflow**.

## Halaman tambahan: Crypto Terminal
Selain `index.html` (XAUUSD), kalau kamu juga punya `crypto.html` (RC
ENGINE Crypto — Binance data, BTC/ETH/dst), taruh juga di `www/` dan
`docs/` dengan cara yang sama. Keduanya:
- **Berbagi database Firebase yang sama**, tapi pakai path terpisah:
  - XAUUSD: `activeSetups`, `candleCache/*`, `priceCache`
  - Crypto: `crypto/priceCache/{symbol}`, `crypto/candleCache/{symbol}/{tf}`
  - Jadi tidak akan saling menimpa data
- **Berjalan independen** — beda sumber data (Binance vs TwelveData), beda
  STATE, tidak saling mempengaruhi
- **Sama-sama pakai cache-first**: setiap fetch harga/candle, app cek
  Firebase dulu sebelum hit API asli. Manfaatnya: refresh halaman lebih
  cepat, dan hemat rate-limit API karena banyak user berbagi 1 cache
- Data live (harga, candle) tetap **butuh internet** meski app-nya sendiri
  bisa dibuka offline — yang offline cuma tampilan/UI-nya, bukan data pasar
- Icon app & splash screen ada di `resources/icon.png` dan
  `resources/splash.png`. GitHub Actions otomatis generate semua ukuran
  icon Android dari file ini setiap build. Mau ganti logo? Timpa file
  `resources/icon.png` (idealnya persegi, minimal 1024x1024px) lalu push.
