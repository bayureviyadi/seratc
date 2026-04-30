/**
 * ═══════════════════════════════════════════════════════════════
 *  PANDUAN INTEGRASI — testanding.html ke dashboardpelatih
 * ═══════════════════════════════════════════════════════════════
 *
 *  Tambahkan potongan kode berikut ke dalam file
 *  dashboardpelatih.js Anda di lokasi yang sesuai.
 * ───────────────────────────────────────────────────────────────
 */

/* ── 1. SETELAH LOGIN BERHASIL ──────────────────────────────────
   Di dalam fungsi doLogin() atau handler login sukses Anda,
   simpan data pelatih ke sessionStorage agar testanding.html
   dapat membacanya.

   Contoh (sesuaikan dengan struktur data Anda):
*/
// Di dalam doLogin() setelah autentikasi berhasil:
function onLoginSuccess(coachData, coachKey) {
  // Simpan sesi ke sessionStorage
  sessionStorage.setItem('athlete_coach_user', JSON.stringify({
    key: coachKey,
    uid: coachData.uid || coachKey,
    nama: coachData.nama || coachData.name,
    unitId: coachData.unitId || coachData.unit_id || coachData.unit,
  }));
  // ... lanjutkan logika app Anda
}


/* ── 2. TOMBOL TES TANDING DI DASHBOARD ────────────────────────
   Tambahkan tombol ini di bagian dashboard Info / section yang
   sesuai. Tombol ini akan membuka halaman tes tanding.

   HTML:
*/
const tesTandingButtonHTML = `
<a href="testanding.html" class="tes-tanding-btn" id="btnTesTanding">
  <span class="ttb-icon">🥋</span>
  <span class="ttb-text">
    <strong>Tes Tanding</strong>
    <small>Evaluasi teknik atlet</small>
  </span>
  <iconify-icon icon="lucide:arrow-right"></iconify-icon>
</a>`;

/* CSS untuk tombol (tambahkan ke dashboardpelatih.css):
.tes-tanding-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text);
  cursor: pointer;
  transition: all .25s;
  margin-bottom: 12px;
}
.tes-tanding-btn:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--accent-glow);
}
.ttb-icon { font-size: 1.6rem; }
.ttb-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ttb-text strong { font-size: .9rem; font-weight: 700; }
.ttb-text small { font-size: .72rem; color: var(--text2); }
*/


/* ── 3. STRUKTUR FIREBASE YANG DIHARAPKAN ───────────────────────
   testanding.html membaca dari path-path berikut:

   a) Data atlet (dibaca):
      /units/{unitId}/atlet/{atletId}/
        nama: string
        kategori / kelas: string
        foto / iconUrl / photo: string (URL, opsional)
        unit: string

   b) Hasil tes (ditulis):
      /tes_tanding/{atletId}/{autoId}/
        atletId:     string
        atletNama:   string
        coachId:     string
        coachNama:   string
        unitId:      string
        tanggal:     ISO string
        skor_total:  number (0-100)
        catatan:     string
        teknik: {
          kuda_kuda:          { raw, max, score100, detail:{0:v,1:v,2:v} }
          pukulan_lurus:      { raw, max, score100, detail:{0:v,...,3:v} }
          uppercut:           { ... }
          tendangan_depan:    { ... }
          tendangan_sabit:    { ... }
          tendangan_t:        { ... }
          tangkisan:          { ... }
          elakan:             { ... }
          kaitan_kaki:        { ... }
          tangkapan:          { ... }
          bantingan:          { ... }
          lepas_tangkapan:    { ... }
          sapuan:             { ... }
          guntingan:          { ... }
        }

   Firebase Security Rules yang disarankan:
   {
     "rules": {
       "tes_tanding": {
         "$atletId": {
           ".read": "auth != null",
           ".write": "auth != null"
         }
       }
     }
   }
*/


/* ── 4. CARA MEMBACA HASIL TES DI DASHBOARD ────────────────────
   Jika Anda ingin menampilkan riwayat tes atlet di dashboard:
*/
function loadRiwayatTes(atletId) {
  return db.ref(`tes_tanding/${atletId}`)
    .orderByChild('tanggal')
    .limitToLast(10)
    .once('value')
    .then(snap => {
      const data = snap.val() || {};
      return Object.entries(data)
        .map(([k, v]) => ({ key: k, ...v }))
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    });
}
