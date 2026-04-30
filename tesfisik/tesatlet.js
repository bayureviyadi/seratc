/* ============================================================
   tesatlet.js  –  Modul Tes Fisik Atlet Pencak Silat
   Berinteraksi dengan Firebase dari dashboardpelatih
   ============================================================ */

'use strict';

// ─── KONFIGURASI TES ─────────────────────────────────────────
const TEST_COMPONENTS = [
  {
    id: 'lari1200',
    name: 'Daya Tahan Aerobik',
    short: 'Lari 1200m',
    icon: 'lucide:timer',
    guide: 'Atlet berlari 1200 meter. Catat waktu tempuh dalam format menit:detik. Makin cepat = daya tahan aerobik makin baik.',
    inputType: 'time_minsec',
    unit: 'menit : detik',
    inputLabel: 'Waktu Tempuh',
    scoreFunc: 'scoreLari1200'
  },
  {
    id: 'pushup',
    name: 'Kekuatan Lengan',
    short: 'Push-up 30 dtk',
    icon: 'lucide:dumbbell',
    guide: 'Atlet melakukan push-up sebanyak mungkin dalam 30 detik, posisi standar. Hitung jumlah ulangan.',
    inputType: 'number',
    unit: 'ulangan',
    inputLabel: 'Jumlah Push-up',
    placeholder: '0',
    scoreFunc: 'scorePushup'
  },
  {
    id: 'wallsit',
    name: 'Daya Tahan Tungkai',
    short: 'Wall Sit',
    icon: 'lucide:activity',
    guide: 'Punggung lurus menempel dinding, lutut 90°, betis tegak lurus tanah. Hitung berapa lama atlet bisa bertahan (dalam detik).',
    inputType: 'number',
    unit: 'detik',
    inputLabel: 'Durasi Bertahan',
    placeholder: '0',
    scoreFunc: 'scoreWallsit'
  },
  {
    id: 'broadjump',
    name: 'Power Tungkai',
    short: 'Standing Broad Jump',
    icon: 'lucide:zap',
    guide: 'Dari sikap jongkok, lompat sejauh mungkin ke depan. Ukur jarak dari bibir kaki ke titik pendaratan (dalam cm).',
    inputType: 'number',
    unit: 'cm',
    inputLabel: 'Jarak Lompatan',
    placeholder: '0',
    scoreFunc: 'scoreBroadJump'
  },
  {
    id: 'sprint30',
    name: 'Kecepatan',
    short: 'Sprint 30m',
    icon: 'lucide:flame',
    guide: 'Dari posisi berdiri, atlet berlari 30 meter secepat mungkin. Catat waktu dengan stopwatch (dalam detik, misal: 4.7).',
    inputType: 'decimal',
    unit: 'detik',
    inputLabel: 'Waktu Sprint',
    placeholder: '0.0',
    scoreFunc: 'scoreSprint30'
  },
  {
    id: 'sidestep',
    name: 'Kelincahan',
    short: 'Side Step 15 dtk',
    icon: 'lucide:shuffle',
    guide: 'Atlet melakukan side step (lompat kiri-kanan melewati garis) sebanyak mungkin dalam 15 detik. Hitung jumlah lintasan.',
    inputType: 'number',
    unit: 'lintasan',
    inputLabel: 'Jumlah Lintasan',
    placeholder: '0',
    scoreFunc: 'scoreSidestep'
  },
  {
    id: 'sitreach',
    name: 'Kelentukan',
    short: 'Sit & Reach',
    icon: 'lucide:move-horizontal',
    guide: 'Atlet duduk di lantai, kaki lurus. Dorong tangan ke depan sejauh mungkin melewati jari kaki. Ukur jarak (cm dari telapak kaki, nilai bisa negatif jika tidak mencapai).',
    inputType: 'decimal_signed',
    unit: 'cm',
    inputLabel: 'Jarak Jangkauan',
    placeholder: '0',
    scoreFunc: 'scoreSitReach'
  },
  {
    id: 'singleleg',
    name: 'Keseimbangan',
    short: 'Single Leg Stand',
    icon: 'lucide:circle-dot',
    guide: 'Atlet berdiri satu kaki selama mungkin dengan mata terbuka. Catat waktu dalam detik.',
    inputType: 'number',
    unit: 'detik',
    inputLabel: 'Durasi Bertahan',
    placeholder: '0',
    scoreFunc: 'scoreSingleLeg'
  },
  {
    id: 'tendangan',
    name: 'Koordinasi & Teknik',
    short: 'Ketepatan Tendangan',
    icon: 'lucide:target',
    guide: 'Atlet melakukan 15 tendangan ke target. Hitung berapa kali tepat sasaran (0–15).',
    inputType: 'number',
    unit: 'tepat (dari 15)',
    inputLabel: 'Jumlah Tepat Sasaran',
    placeholder: '0',
    maxVal: 15,
    scoreFunc: 'scoreTendangan'
  }
];

// ─── SCORING FUNCTIONS ────────────────────────────────────────
// Semua return 0–100

function scoreLari1200(menit, detik, gender) {
  // Konversi ke total detik
  const total = (parseInt(menit) || 0) * 60 + (parseInt(detik) || 0);
  if (total <= 0) return 0;
  // Putra: sangat baik ≤ 299s (4:59), baik ≤ 329s, cukup ≤ 359s, kurang ≤ 390s
  // Putri: sangat baik ≤ 329s (5:29), baik ≤ 359s, cukup ≤ 389s, kurang ≤ 420s
  const best = gender === 'putri' ? 300 : 270; // 5:00 putri, 4:30 putra = 100
  const worst = gender === 'putri' ? 420 : 390;
  if (total <= best) return 100;
  if (total >= worst) return Math.max(5, 100 - Math.round((total - worst) / 3));
  return Math.round(100 - ((total - best) / (worst - best)) * 60);
}

function scorePushup(val, gender) {
  const v = parseInt(val) || 0;
  const max = gender === 'putri' ? 26 : 31;
  if (v <= 0) return 0;
  if (v >= max) return 100;
  return Math.round((v / max) * 100);
}

function scoreWallsit(val) {
  const v = parseInt(val) || 0;
  if (v <= 0) return 0;
  if (v >= 91) return 100;
  if (v >= 61) return Math.round(80 + ((v - 61) / 30) * 20);
  if (v >= 45) return Math.round(60 + ((v - 45) / 16) * 20);
  if (v >= 30) return Math.round(40 + ((v - 30) / 15) * 20);
  return Math.round((v / 30) * 40);
}

function scoreBroadJump(val, gender) {
  const v = parseFloat(val) || 0;
  if (v <= 0) return 0;
  // input dalam cm, standar dalam meter
  const cm = v;
  const best = gender === 'putri' ? 211 : 261;
  const worst = gender === 'putri' ? 160 : 200;
  if (cm >= best) return 100;
  if (cm <= worst) return Math.max(5, Math.round((cm / worst) * 20));
  return Math.round(((cm - worst) / (best - worst)) * 80 + 20);
}

function scoreSprint30(val, gender) {
  const v = parseFloat(val) || 0;
  if (v <= 0) return 0;
  const best = gender === 'putri' ? 4.4 : 4.0;
  const worst = gender === 'putri' ? 6.0 : 5.5;
  if (v <= best) return 100;
  if (v >= worst) return Math.max(5, Math.round(100 - ((v - worst) * 15)));
  return Math.round(100 - ((v - best) / (worst - best)) * 80);
}

function scoreSidestep(val) {
  const v = parseInt(val) || 0;
  if (v <= 0) return 0;
  if (v >= 16) return 100;
  if (v >= 13) return Math.round(80 + ((v - 13) / 3) * 20);
  if (v >= 10) return Math.round(60 + ((v - 10) / 3) * 20);
  if (v >= 7)  return Math.round(40 + ((v - 7) / 3) * 20);
  return Math.round((v / 7) * 40);
}

function scoreSitReach(val) {
  const v = parseFloat(val) || 0;
  if (v >= 21) return 100;
  if (v >= 16) return Math.round(80 + ((v - 16) / 5) * 20);
  if (v >= 11) return Math.round(60 + ((v - 11) / 5) * 20);
  if (v >= 5)  return Math.round(40 + ((v - 5) / 6) * 20);
  if (v >= 0)  return Math.round(20 + (v / 5) * 20);
  return Math.max(5, Math.round(20 + (v / 10) * 15));
}

function scoreSingleLeg(val) {
  const v = parseInt(val) || 0;
  if (v <= 0) return 0;
  if (v >= 46) return 100;
  if (v >= 31) return Math.round(80 + ((v - 31) / 15) * 20);
  if (v >= 21) return Math.round(60 + ((v - 21) / 10) * 20);
  if (v >= 11) return Math.round(40 + ((v - 11) / 10) * 20);
  return Math.round((v / 11) * 40);
}

function scoreTendangan(val) {
  const v = parseInt(val) || 0;
  if (v <= 0) return 0;
  if (v >= 15) return 100;
  return Math.round((v / 15) * 100);
}

function getGrade(score) {
  if (score >= 90) return { label: 'Sangat Baik', cls: 'score-sangat-baik' };
  if (score >= 80) return { label: 'Baik', cls: 'score-baik' };
  if (score >= 70) return { label: 'Cukup', cls: 'score-cukup' };
  if (score >= 60) return { label: 'Kurang', cls: 'score-kurang' };
  return { label: 'Sangat Kurang', cls: 'score-sangat-kurang' };
}

function calcScore(comp, rawValues, gender) {
  const v = rawValues[comp.id];
  const fn = window[comp.scoreFunc];
  if (!fn) return 0;
  if (comp.id === 'lari1200') {
    return fn(v?.menit || 0, v?.detik || 0, gender);
  }
  return fn(v, gender);
}

// ─── STATE ────────────────────────────────────────────────────
let STATE = {
  coachId: null,
  coachName: null,
  unitId: null,
  unitName: null,
  athletes: [],       // raw from firebase
  filteredAthletes: [],
  selectedAthlete: null,
  testDate: '',
  selectedComponents: new Set(TEST_COMPONENTS.map(c => c.id)),
  activeTests: [],    // TEST_COMPONENTS filtered
  currentTestIdx: 0,
  gender: 'putra',
  rawValues: {},      // {compId: value}
  currentStep: 'selectAthlete'
};

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Read params from sessionStorage (set by dashboardpelatih)
  try {
    const data = JSON.parse(sessionStorage.getItem('tesatlet_ctx') || 'null');
    if (data) {
      STATE.coachId   = data.coachId;
      STATE.coachName = data.coachName;
      STATE.unitId    = data.unitId;
      STATE.unitName  = data.unitName;
    }
  } catch(e) {}

  // Also read from URL params as fallback
  const params = new URLSearchParams(location.search);
  if (params.get('coachId'))   STATE.coachId   = params.get('coachId');
  if (params.get('coachName')) STATE.coachName = decodeURIComponent(params.get('coachName'));
  if (params.get('unitId'))    STATE.unitId    = params.get('unitId');
  if (params.get('unitName'))  STATE.unitName  = decodeURIComponent(params.get('unitName') || '');

  // Apply theme from parent
  const theme = sessionStorage.getItem('athlete_theme') || localStorage.getItem('athlete_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  // Set today's date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');
  STATE.testDate = `${yyyy}-${mm}-${dd}`;
  const dateEl = document.getElementById('testDate');
  if (dateEl) dateEl.value = STATE.testDate;

  // UI updates
  document.getElementById('coachLabel').textContent = STATE.coachName || '—';
  document.getElementById('unitNameTxt').textContent = STATE.unitName || 'Unit tidak diketahui';

  // Animate loading
  setTimeout(() => {
    document.getElementById('ls').classList.add('hidden');
    document.getElementById('app').style.display = '';
    setTimeout(() => document.getElementById('ls').remove(), 500);
  }, 900);

  // Load athletes
  loadAthletes();
  renderComponents();
});

// ─── FIREBASE HELPERS ─────────────────────────────────────────
function getDb() {
  if (window.db) return window.db;
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    window.db = firebase.database();
    return window.db;
  }
  return null;
}

// ─── LOAD ATHLETES ───────────────────────────────────────────
function loadAthletes() {
  const db = getDb();
  if (!db) {
    renderAthleteGrid([]);
    return;
  }
  if (!STATE.unitId) {
    showToast('Unit ID tidak ditemukan. Buka dari Dashboard Pelatih.', 'warn');
    renderAthleteGrid([]);
    return;
  }

  // Try path: units/{unitId}/athletes OR atletUnit/{unitId}
  const paths = [
    `units/${STATE.unitId}/athletes`,
    `atletUnit/${STATE.unitId}`,
    `atlet`
  ];

  let found = false;
  function tryPath(idx) {
    if (idx >= paths.length) {
      if (!found) renderAthleteGrid([]);
      return;
    }
    db.ref(paths[idx]).once('value').then(snap => {
      if (snap.exists()) {
        found = true;
        const raw = snap.val();
        const list = [];
        if (typeof raw === 'object' && raw !== null) {
          Object.entries(raw).forEach(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
              // Filter by unitId if path is 'atlet'
              if (paths[idx] === 'atlet' && v.unitId && v.unitId !== STATE.unitId) return;
              list.push({ id: k, ...v });
            }
          });
        }
        STATE.athletes = list;
        STATE.filteredAthletes = [...list];
        renderAthleteGrid(list);
      } else {
        tryPath(idx + 1);
      }
    }).catch(() => tryPath(idx + 1));
  }
  tryPath(0);
}

// ─── RENDER ATHLETE GRID ──────────────────────────────────────
function renderAthleteGrid(list) {
  const grid = document.getElementById('athleteGrid');
  if (!list || list.length === 0) {
    grid.innerHTML = `
      <div class="page-empty">
        <div class="pe-icon"><iconify-icon icon="lucide:users"></iconify-icon></div>
        <div class="pe-txt">Tidak ada atlet ditemukan di unit ini</div>
      </div>`;
    return;
  }
  grid.innerHTML = list.map(a => {
    const initials = (a.nama || a.name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
    const avatarHtml = (a.fotoUrl || a.iconUrl || a.photo)
      ? `<img src="${a.fotoUrl || a.iconUrl || a.photo}" alt="" onerror="this.style.display='none';this.parentElement.textContent='${initials}'">`
      : initials;
    const name = a.nama || a.name || '—';
    const gender = a.jenisKelamin || a.gender || '';
    const pos = a.posisi || a.position || '';
    const badge = gender || pos;
    return `
      <div class="athlete-card" onclick="selectAthlete('${a.id}')">
        <div class="ac-avatar">${avatarHtml}</div>
        <div class="ac-name">${name}</div>
        ${badge ? `<div class="ac-badge">${badge}</div>` : ''}
      </div>`;
  }).join('');
}

function filterAthletes() {
  const q = (document.getElementById('athleteSearch').value || '').toLowerCase();
  const filtered = q
    ? STATE.athletes.filter(a => (a.nama || a.name || '').toLowerCase().includes(q))
    : [...STATE.athletes];
  STATE.filteredAthletes = filtered;
  renderAthleteGrid(filtered);
}

// ─── SELECT ATHLETE ───────────────────────────────────────────
function selectAthlete(id) {
  const athlete = STATE.athletes.find(a => a.id === id);
  if (!athlete) return;
  STATE.selectedAthlete = athlete;

  // Detect gender from athlete data
  const g = (athlete.jenisKelamin || athlete.gender || '').toLowerCase();
  if (g.includes('putri') || g.includes('perempuan') || g.includes('female') || g === 'p') {
    STATE.gender = 'putri';
  } else {
    STATE.gender = 'putra';
  }

  // Update selected card
  const name = athlete.nama || athlete.name || '—';
  const initials = name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const avatarEl = document.getElementById('sacAvatar');
  if (athlete.fotoUrl || athlete.iconUrl || athlete.photo) {
    avatarEl.innerHTML = `<img src="${athlete.fotoUrl || athlete.iconUrl || athlete.photo}" 
      onerror="this.style.display='none';this.parentElement.textContent='${initials}'" alt="">`;
  } else {
    avatarEl.textContent = initials;
  }
  document.getElementById('sacName').textContent = name;
  const g2 = athlete.jenisKelamin || athlete.gender || '';
  const pos = athlete.posisi || athlete.position || '';
  document.getElementById('sacMeta').textContent = [g2, pos].filter(Boolean).join(' • ') || '—';

  navigateStep('testSetup');
}

function changeAthlete() {
  navigateStep('selectAthlete');
}

// ─── RENDER COMPONENTS ────────────────────────────────────────
function renderComponents() {
  const el = document.getElementById('testComponentsList');
  el.innerHTML = TEST_COMPONENTS.map(c => `
    <div class="comp-item ${STATE.selectedComponents.has(c.id) ? 'checked' : ''}"
         onclick="toggleComponent('${c.id}', this)">
      <div class="comp-check">${STATE.selectedComponents.has(c.id) ? '✓' : ''}</div>
      <div>
        <div class="comp-label">${c.short}</div>
        <div class="comp-sub">${c.name}</div>
      </div>
    </div>
  `).join('');
}

function toggleComponent(id, el) {
  if (STATE.selectedComponents.has(id)) {
    STATE.selectedComponents.delete(id);
    el.classList.remove('checked');
    el.querySelector('.comp-check').textContent = '';
  } else {
    STATE.selectedComponents.add(id);
    el.classList.add('checked');
    el.querySelector('.comp-check').textContent = '✓';
  }
}

function selectAllComponents() {
  STATE.selectedComponents = new Set(TEST_COMPONENTS.map(c => c.id));
  renderComponents();
}

function deselectAllComponents() {
  STATE.selectedComponents.clear();
  renderComponents();
}

// ─── START TEST ───────────────────────────────────────────────
function startTest() {
  if (!STATE.selectedAthlete) {
    showToast('Pilih atlet terlebih dahulu!', 'warn');
    return;
  }
  if (STATE.selectedComponents.size === 0) {
    showToast('Pilih minimal 1 komponen tes!', 'warn');
    return;
  }

  // Read date
  STATE.testDate = document.getElementById('testDate').value || STATE.testDate;

  // Build active tests list
  STATE.activeTests = TEST_COMPONENTS.filter(c => STATE.selectedComponents.has(c.id));
  STATE.currentTestIdx = 0;
  STATE.rawValues = {};

  // Update desc
  const name = STATE.selectedAthlete.nama || STATE.selectedAthlete.name;
  document.getElementById('testInputDesc').textContent =
    `${name} · ${STATE.activeTests.length} komponen`;

  navigateStep('testInput');
  renderCurrentTest();
}

// ─── RENDER CURRENT TEST ─────────────────────────────────────
function renderCurrentTest() {
  const comp = STATE.activeTests[STATE.currentTestIdx];
  if (!comp) return;

  const total = STATE.activeTests.length;
  const idx = STATE.currentTestIdx;

  // Progress
  const pct = Math.round(((idx) / total) * 100);
  document.getElementById('tpFill').style.width = pct + '%';
  document.getElementById('tpLabel').textContent = `${idx + 1} / ${total}`;

  // Nav buttons
  document.getElementById('btnPrev').style.display = idx === 0 ? 'none' : '';
  const isLast = idx === total - 1;
  document.getElementById('btnNext').style.display = isLast ? 'none' : '';
  document.getElementById('btnFinish').style.display = isLast ? '' : 'none';

  // Build input HTML
  let inputHtml = '';
  if (comp.inputType === 'time_minsec') {
    const val = STATE.rawValues[comp.id] || {};
    inputHtml = `
      <div class="tc-input-label">${comp.inputLabel}</div>
      <div class="time-inputs">
        <div>
          <div class="tc-unit" style="margin-bottom:4px">Menit</div>
          <input class="tc-input" id="inputMin" type="number" min="0" max="30"
            placeholder="0" value="${val.menit || ''}"
            oninput="saveTimeMinsec()">
        </div>
        <div>
          <div class="tc-unit" style="margin-bottom:4px">Detik</div>
          <input class="tc-input" id="inputSec" type="number" min="0" max="59"
            placeholder="0" value="${val.detik || ''}"
            oninput="saveTimeMinsec()">
        </div>
      </div>
      <div class="tc-unit">${comp.unit}</div>`;
  } else {
    const val = STATE.rawValues[comp.id] || '';
    const step = comp.inputType === 'decimal' || comp.inputType === 'decimal_signed' ? '0.1' : '1';
    const min  = comp.inputType === 'decimal_signed' ? '-100' : '0';
    const max  = comp.maxVal || '';
    inputHtml = `
      <div class="tc-input-label">${comp.inputLabel}</div>
      <input class="tc-input" id="inputMain" type="number"
        min="${min}" max="${max}" step="${step}"
        placeholder="${comp.placeholder || '0'}" value="${val}"
        oninput="saveValue(this.value)">
      <div class="tc-unit">${comp.unit}</div>`;
  }

  // Gender toggle (for gender-dependent tests)
  const genderTests = ['lari1200','pushup','broadjump','sprint30'];
  const genderHtml = genderTests.includes(comp.id) ? `
    <div class="gender-toggle">
      <button class="gender-btn ${STATE.gender==='putra'?'active':''}" onclick="setGender('putra')">♂ Putra</button>
      <button class="gender-btn ${STATE.gender==='putri'?'active':''}" onclick="setGender('putri')">♀ Putri</button>
    </div>` : '';

  document.getElementById('testCard').innerHTML = `
    <div class="tc-header">
      <div>
        <div class="tc-num">TES ${String(idx+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</div>
        <div class="tc-title">${comp.name}</div>
        <div class="tc-sub">${comp.short}</div>
      </div>
      <iconify-icon icon="${comp.icon}" style="font-size:28px;color:var(--accent);opacity:.6"></iconify-icon>
    </div>
    <div class="tc-guide">
      <div class="tc-guide-title"><iconify-icon icon="lucide:info"></iconify-icon> Cara Tes</div>
      <div class="tc-guide-text">${comp.guide}</div>
    </div>
    ${genderHtml}
    <div class="tc-input-wrap">
      ${inputHtml}
    </div>
    <div class="tc-score-preview" id="scorePreview">
      <div class="tsp-label">Skor Sementara</div>
      <div class="tsp-score" id="tspScore">—</div>
      <div class="tsp-grade" id="tspGrade">Masukkan nilai</div>
    </div>`;

  updateScorePreview();
}

function setGender(g) {
  STATE.gender = g;
  renderCurrentTest();
}

function saveValue(v) {
  const comp = STATE.activeTests[STATE.currentTestIdx];
  STATE.rawValues[comp.id] = v;
  updateScorePreview();
}

function saveTimeMinsec() {
  const comp = STATE.activeTests[STATE.currentTestIdx];
  const menit = parseInt(document.getElementById('inputMin')?.value) || 0;
  const detik = parseInt(document.getElementById('inputSec')?.value) || 0;
  STATE.rawValues[comp.id] = { menit, detik };
  updateScorePreview();
}

function updateScorePreview() {
  const comp = STATE.activeTests[STATE.currentTestIdx];
  const score = calcScore(comp, STATE.rawValues, STATE.gender);
  const previewEl = document.getElementById('scorePreview');
  if (!previewEl) return;

  const hasValue = STATE.rawValues[comp.id] !== undefined && STATE.rawValues[comp.id] !== '';
  if (!hasValue) {
    document.getElementById('tspScore').textContent = '—';
    document.getElementById('tspGrade').textContent = 'Masukkan nilai';
    document.getElementById('tspScore').className = 'tsp-score';
    return;
  }

  const grade = getGrade(score);
  const scoreEl = document.getElementById('tspScore');
  scoreEl.textContent = score;
  scoreEl.className = 'tsp-score ' + grade.cls;
  const gradeEl = document.getElementById('tspGrade');
  gradeEl.textContent = grade.label;
  gradeEl.className = 'tsp-grade ' + grade.cls;
}

// ─── NAV TEST ─────────────────────────────────────────────────
function prevTest() {
  if (STATE.currentTestIdx > 0) {
    STATE.currentTestIdx--;
    renderCurrentTest();
  }
}

function nextTest() {
  const comp = STATE.activeTests[STATE.currentTestIdx];
  const val = STATE.rawValues[comp.id];
  if (val === undefined || val === '' || (typeof val === 'object' && !val.menit && !val.detik)) {
    showToast('Masukkan nilai terlebih dahulu!', 'warn');
    return;
  }
  if (STATE.currentTestIdx < STATE.activeTests.length - 1) {
    STATE.currentTestIdx++;
    renderCurrentTest();
  }
}

// ─── SHOW REVIEW ─────────────────────────────────────────────
function showReview() {
  const comp = STATE.activeTests[STATE.currentTestIdx];
  const val = STATE.rawValues[comp.id];
  if (val === undefined || val === '') {
    showToast('Masukkan nilai terlebih dahulu!', 'warn');
    return;
  }

  const athlete = STATE.selectedAthlete;
  const name = athlete.nama || athlete.name;

  // Calculate all scores
  const scores = STATE.activeTests.map(c => ({
    comp: c,
    score: calcScore(c, STATE.rawValues, STATE.gender),
    rawVal: STATE.rawValues[c.id]
  }));
  const avgScore = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);
  const grade = getGrade(avgScore);

  // Render score summary
  document.getElementById('reviewDesc').textContent = `${name} · ${STATE.testDate}`;
  document.getElementById('scoreSummary').innerHTML = `
    <div class="ss-athlete">Atlet</div>
    <div class="ss-name">${name}</div>
    <div class="ss-score-ring">
      <div class="ss-score-num ${grade.cls}">${avgScore}</div>
      <div class="ss-score-max">/ 100</div>
    </div>
    <div class="ss-grade ${grade.cls}">${grade.label}</div>
    <div class="ss-date">📅 ${formatDate(STATE.testDate)}</div>`;

  // Render results table
  document.getElementById('resultsTable').innerHTML = scores.map(({ comp, score, rawVal }) => {
    const g = getGrade(score);
    let displayVal = '';
    if (comp.inputType === 'time_minsec' && rawVal) {
      displayVal = `${rawVal.menit || 0}:${String(rawVal.detik || 0).padStart(2,'0')}`;
    } else {
      displayVal = rawVal + ' ' + comp.unit;
    }
    return `
      <div class="rt-row">
        <div>
          <div class="rt-name">${comp.short}</div>
          <div class="rt-val">${displayVal}</div>
        </div>
        <div class="rt-score ${g.cls}">${score}</div>
      </div>`;
  }).join('');

  navigateStep('review');
}

function backToInput() {
  STATE.currentTestIdx = STATE.activeTests.length - 1;
  navigateStep('testInput');
  renderCurrentTest();
}

// ─── SAVE RESULTS ─────────────────────────────────────────────
async function saveResults() {
  const db = getDb();
  if (!db) {
    showToast('Tidak terhubung ke Firebase!', 'warn');
    return;
  }

  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  btn.innerHTML = '<iconify-icon icon="lucide:loader-2" class="spin"></iconify-icon> Menyimpan...';

  const athlete = STATE.selectedAthlete;
  const name = athlete.nama || athlete.name;

  const scores = STATE.activeTests.map(c => ({
    id: c.id,
    name: c.name,
    short: c.short,
    score: calcScore(c, STATE.rawValues, STATE.gender),
    rawVal: STATE.rawValues[c.id],
    unit: c.unit
  }));
  const avgScore = Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length);
  const grade = getGrade(avgScore);

  const payload = {
    atletId:     athlete.id,
    atletNama:   name,
    unitId:      STATE.unitId,
    unitNama:    STATE.unitName,
    pelatihId:   STATE.coachId,
    pelatihNama: STATE.coachName,
    tanggal:     STATE.testDate,
    gender:      STATE.gender,
    skorAkhir:   avgScore,
    kategori:    grade.label,
    komponen:    scores,
    rawValues:   STATE.rawValues,
    createdAt:   Date.now()
  };

  try {
    // Save to: tesFisik/{unitId}/{atletId}/{timestamp}
    const ts = Date.now();
    await db.ref(`tesFisik/${STATE.unitId}/${athlete.id}/${ts}`).set(payload);
    // Also update latest in: tesFisikLatest/{atletId}
    await db.ref(`tesFisikLatest/${athlete.id}`).set({ ...payload, key: ts });

    // Show success
    document.getElementById('finalScoreDisplay').textContent = avgScore;
    const g = getGrade(avgScore);
    const gradeEl = document.getElementById('finalGradeDisplay');
    gradeEl.textContent = g.label;
    gradeEl.className = 'success-grade ' + g.cls;
    document.getElementById('successMsg').textContent =
      `Hasil tes ${name} berhasil disimpan ke database.`;

    navigateStep('success');
  } catch(err) {
    showToast('Gagal menyimpan: ' + err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<iconify-icon icon="lucide:save"></iconify-icon> Simpan ke Firebase';
  }
}

// ─── NAVIGATE STEPS ───────────────────────────────────────────
const STEP_MAP = {
  selectAthlete: 'stepSelectAthlete',
  testSetup:     'stepTestSetup',
  testInput:     'stepTestInput',
  review:        'stepReview',
  success:       'stepSuccess'
};

function navigateStep(step) {
  Object.values(STEP_MAP).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(STEP_MAP[step]);
  if (target) target.classList.add('active');
  STATE.currentStep = step;
  window.scrollTo(0, 0);
}

function goBack() {
  const steps = ['selectAthlete','testSetup','testInput','review','success'];
  const idx = steps.indexOf(STATE.currentStep);
  if (idx <= 0) {
    goToDashboard();
  } else if (STATE.currentStep === 'testInput' && STATE.currentTestIdx > 0) {
    prevTest();
  } else {
    navigateStep(steps[idx - 1]);
    if (steps[idx - 1] === 'testInput') renderCurrentTest();
  }
}

function testAnotherAthlete() {
  STATE.selectedAthlete = null;
  STATE.rawValues = {};
  STATE.currentTestIdx = 0;
  navigateStep('selectAthlete');
}

function goToDashboard() {
  // Go back to parent or use history
  if (window.opener) {
    window.close();
  } else if (history.length > 1) {
    history.back();
  } else {
    location.href = 'dashboardpelatih.html';
  }
}

// ─── CONFIRM MODAL ────────────────────────────────────────────
function showConfirm(title, body, onOk) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmBody').textContent = body;
  document.getElementById('confirmOk').onclick = () => { closeConfirm(); onOk(); };
  document.getElementById('confirmModal').classList.add('open');
}
function closeConfirm() {
  document.getElementById('confirmModal').classList.remove('open');
}

// ─── TOAST ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show';
  if (type === 'error') el.style.borderColor = 'var(--danger)';
  else if (type === 'warn') el.style.borderColor = 'var(--warn)';
  else el.style.borderColor = 'var(--border)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── UTILS ────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return `${parseInt(day)} ${bulan[parseInt(m)-1]} ${y}`;
}
