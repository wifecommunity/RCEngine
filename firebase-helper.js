/* ════════════════════════════════════════════════════════════
   FIREBASE REALTIME DATABASE — REST API HELPER
   Diekstrak dari RC ENGINE (docs/index.html)

   Ini BUKAN Firebase SDK resmi — ini cara ringan untuk baca/tulis
   Firebase Realtime Database langsung lewat HTTP fetch(), tanpa
   perlu load firebase-app.js / firebase-database.js sama sekali.
   Cocok untuk app statis / single HTML file seperti RC ENGINE.

   CARA PAKAI di HTML lain:
   1. Copy file ini, atau paste isinya ke dalam <script> di HTML kamu
   2. Ganti FIREBASE_DB_URL di bawah dengan URL database kamu sendiri
   3. Panggil fbGet() / fbSet() / fbPatch() / fbDelete() sesuai kebutuhan

   ⚠️ PERINGATAN KEAMANAN (baca sebelum dipakai di app publik):
   - URL ini menunjuk ke database TANPA AUTENTIKASI. Siapa pun yang
     tahu URL-nya bisa baca DAN tulis data lewat REST API ini.
   - Jangan simpan data sensitif/pribadi pengguna di sini.
   - Untuk app publik, sebaiknya aktifkan Firebase Auth + Security
     Rules di Firebase Console agar hanya request tertentu yang
     diizinkan baca/tulis.
   - Jika kode ini dipakai di banyak HTML/app, semua app itu akan
     berbagi database yang SAMA (itu memang tujuannya di RC ENGINE:
     jadi cache bersama agar hemat panggilan API eksternal).
════════════════════════════════════════════════════════════ */

// GANTI dengan URL Firebase Realtime Database kamu sendiri
const FIREBASE_DB_URL = 'https://xauusd-analyst-default-rtdb.asia-southeast1.firebasedatabase.app';

const FB_OPTS      = { mode: 'cors', cache: 'no-cache' };
const FB_READ_OPTS = { mode: 'cors', cache: 'default' };

// Status koneksi, bisa dibaca dari luar modul ini
const FB_STATE = { connected: false };

/**
 * Baca data dari satu path di Realtime Database.
 * @param {string} path - path tanpa slash di depan, contoh: 'activeSetups' atau 'candleCache/H1'
 * @returns {Promise<any|null>} data, atau null jika gagal/tidak ada
 */
async function fbGet(path) {
  try {
    const r = await fetch(`${FIREBASE_DB_URL}/${path}.json`, FB_READ_OPTS);
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

/**
 * Timpa (overwrite) seluruh data di satu path.
 * @param {string} path
 * @param {any} val - akan otomatis di-JSON.stringify
 */
async function fbSet(path, val) {
  try {
    await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      ...FB_OPTS,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val)
    });
  } catch {}
}

/**
 * Update sebagian field di satu path tanpa menghapus field lain (PATCH).
 * @param {string} path
 * @param {object} val - object berisi field yang ingin diupdate/ditambah
 */
async function fbPatch(path, val) {
  try {
    await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      ...FB_OPTS,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val)
    });
  } catch {}
}

/**
 * Hapus data di satu path.
 * @param {string} path
 */
async function fbDelete(path) {
  try {
    await fetch(`${FIREBASE_DB_URL}/${path}.json`, { ...FB_OPTS, method: 'DELETE' });
  } catch {}
}

/**
 * Cek apakah koneksi ke Firebase berhasil. Update FB_STATE.connected.
 * Panggil ini sekali saat app start, dan bisa diulang berkala (mis. setInterval).
 * @param {string} testPath - path ringan untuk dites, default 'activeSetups'
 * @returns {Promise<boolean>}
 */
async function checkFirebase(testPath = 'activeSetups') {
  try {
    const r = await fetch(`${FIREBASE_DB_URL}/${testPath}.json?shallow=true`, {
      ...FB_OPTS,
      signal: AbortSignal.timeout(5000)
    });
    FB_STATE.connected = r.ok;
  } catch {
    FB_STATE.connected = false;
  }
  return FB_STATE.connected;
}

/* ────────────────────────────────────────────────────────────
   CONTOH PEMAKAIAN (hapus/abaikan bagian ini di project kamu)
   ────────────────────────────────────────────────────────────

   // Saat app dimulai:
   await checkFirebase();
   if (FB_STATE.connected) console.log('Firebase terhubung');

   // Simpan data:
   await fbSet('mySetting', { value: 42, ts: Date.now() });

   // Update sebagian field saja:
   await fbPatch('mySetting', { value: 99 });

   // Baca data:
   const data = await fbGet('mySetting');
   console.log(data); // { value: 99, ts: ... }

   // Hapus data:
   await fbDelete('mySetting');

   ────────────────────────────────────────────────────────────
   CONTOH PATTERN CACHE-DENGAN-TTL (seperti dipakai RC ENGINE)
   ────────────────────────────────────────────────────────────

   const MY_CACHE_TTL = 60000; // 60 detik

   async function saveToCache(key, value) {
     if (!FB_STATE.connected) return;
     await fbSet(`cache/${key}`, { value, ts: Date.now() });
   }

   async function loadFromCache(key) {
     if (!FB_STATE.connected) return null;
     const d = await fbGet(`cache/${key}`);
     if (!d || !d.ts) return null;
     if (Date.now() - d.ts > MY_CACHE_TTL) return null; // expired
     return d.value;
   }
*/
