const KODE_AKSES = 'SERAGM';
const FB_CFG = {
  apiKey:"AIzaSyDVr-gnYVuSBY0UQ4D-Sf-_pHN-HodBIk8",
  authDomain:"ydtc-5d55a.firebaseapp.com",
  databaseURL:"https://ydtc-5d55a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"ydtc-5d55a"
};
firebase.initializeApp(FB_CFG);
const db = firebase.database();

let currentAtletId = null;
let currentAtletData = null;
let calState = {year: new Date().getFullYear(), month: new Date().getMonth()};
let chartInst = {};
let unsubFn = null;

// ── HELPERS ──────────────────────────────────────────────
function toast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + type + ' show';
  setTimeout(()=>t.classList.remove('show'), 2400);
}

function getWeightClass(kg) {
  const w = Number(kg);
  if (w<=45) return '≤45 KG'; if (w<=50) return '≤50 KG'; if (w<=52) return '≤52 KG';
  if (w<=55) return '≤55 KG'; if (w<=60) return '≤60 KG'; if (w<=67) return '≤67 KG';
  if (w<=75) return '≤75 KG'; if (w<=84) return '≤84 KG'; return '+84 KG';
}

function calcAge(dob) {
  if (!dob) return '—';
  return new Date().getFullYear() - new Date(dob).getFullYear() + ' thn';
}

function calcOverall(d) {
  if (!d) return 0;
  const f = d.fisik||{}, p = d.pasif||{}, s = d.skill||{};
  const fKeys = ['dayaTahan','stamina','kecepatan','kelincahan','keseimbangan','powerTungkai','kekuatanLengan','fleksibilitas'];
  // tanding pasif
  const p1Keys = ['fightIq','reflek','mental','taktik'];
  // seni pasif
  const p2Keys = ['hafalan','penghayatan','irama','koordinasi','manajemenWaktu'];
  const pKeys = p2Keys.some(k=>p[k]!==undefined) ? p2Keys : p1Keys;
  const sKeys = s.serang ? (s.teknik ? 
    [...Object.values(s.serang),...Object.values(s.tahan||{}),...Object.values(s.teknik||{})] :
    [...Object.values(s.serang),...Object.values(s.tahan||{}),...Object.values(s.jatuh||{})]) : [];
  const all = [...fKeys.map(k=>Number(f[k]||0)),...pKeys.map(k=>Number(p[k]||0)),...sKeys.map(v=>Number(v||0))];
  if (!all.length) return 0;
  return Math.round(all.reduce((a,b)=>a+b,0)/all.length);
}

function tier(v){const n=Number(v)||0;return n>=85?'S':n>=70?'A':n>=50?'B':'C';}
function tierClass(v){return {S:'tier-s',A:'tier-a',B:'tier-b',C:'tier-c'}[tier(v)];}

// ── LOAD SCREEN ───────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loadScreen').classList.add('out');
    setTimeout(() => {
      document.getElementById('loadScreen').style.display='none';
      const saved = sessionStorage.getItem('yd_atlet_id');
      if (saved) {
        currentAtletId = saved;
        startApp();
      } else {
        document.getElementById('loginScreen').style.display='flex';
      }
    }, 500);
  }, 1500);
});

// ── LOGIN ─────────────────────────────────────────────────
document.getElementById('inputKode').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('inputNama').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inputKode').focus();
});

window.doLogin = async function() {
  const nama = document.getElementById('inputNama').value.trim();
  const kode = document.getElementById('inputKode').value.trim().toUpperCase();
  const errEl = document.getElementById('loginErr');
  errEl.classList.remove('show');
  if (!nama || !kode) { errEl.classList.add('show'); return; }
  if (kode !== KODE_AKSES) { errEl.classList.add('show'); return; }

  // Try both nodes: atlet (tanding) and atlet_seni
  let found = null;
  let foundNode = null;
  for (const node of ['atlet','atlet_seni']) {
    const snap = await db.ref(node).once('value');
    snap.forEach(c => {
      const d = c.val();
      if (d && d.nama && d.nama.trim().toLowerCase() === nama.toLowerCase()) {
        found = c.key;
        foundNode = node;
      }
    });
    if (found) break;
  }
  if (!found) { errEl.classList.add('show'); return; }
  currentAtletId = found;
  sessionStorage.setItem('yd_atlet_id', found);
  sessionStorage.setItem('yd_atlet_node', foundNode);
  document.getElementById('loginScreen').classList.add('out');
  setTimeout(() => { document.getElementById('loginScreen').style.display='none'; startApp(); }, 400);
};

window.doLogout = function() {
  sessionStorage.clear();
  if (unsubFn) { unsubFn(); unsubFn = null; }
  location.reload();
};

// ── START APP ─────────────────────────────────────────────
function startApp() {
  const node = sessionStorage.getItem('yd_atlet_node') || 'atlet';
  document.getElementById('app').classList.add('show');
  const ref = db.ref(`${node}/${currentAtletId}`);
  const listener = ref.on('value', snap => {
    currentAtletData = snap.val();
    if (!currentAtletData) return;
    renderAll();
  });
  unsubFn = () => ref.off('value', listener);
}

function renderAll() {
  const d = currentAtletData;
  const overall = calcOverall(d);
  const isSeni = sessionStorage.getItem('yd_atlet_node') === 'atlet_seni';

  // Topbar
  document.getElementById('tbName').textContent = d.nama || '—';
  document.getElementById('tbMeta').textContent = (isSeni ? '🎭 SENI' : '⚔ TANDING') + ' · SERA TRAINING CENTER';
  document.getElementById('topScore').textContent = overall;
  document.getElementById('topRing').style.setProperty('--s', overall);

  renderProfil(d, overall, isSeni);
  renderQuest(d);
  renderGrafik(d, isSeni);
  renderKalender(d);
}

// ── PROFIL ────────────────────────────────────────────────
function renderProfil(d, overall, isSeni) {
  const f = d.fisik||{}, p = d.pasif||{}, s = d.skill||{serang:{},tahan:{}};
  const age = calcAge(d.tglLahir);

  document.getElementById('heroBlock').innerHTML = `
    <div class="hero-name-row">
      <div>
        <div class="hero-name">${d.nama}</div>
        <div class="hero-sub">${d.berat||'—'}kg · ${d.tinggi||'—'}cm · ${age}</div>
      </div>
    </div>
    <div class="hero-badges" style="padding-bottom:18px">
      <span class="hbadge hbadge-blue">${d.gender==='Laki-laki'?'♂ PRIA':'♀ WANITA'}</span>
      <span class="hbadge hbadge-gold">${getWeightClass(d.berat)}</span>
      <span class="hbadge ${isSeni?'hbadge-purple':'hbadge-green'}">${isSeni?'🎭 SENI':'⚔ TANDING'}</span>
    </div>`;

  const hCount = d.history ? Object.keys(d.history).length : 0;
  const qCount = d.program ? Object.keys(d.program).length : 0;
  const trCount = d.training ? Object.keys(d.training).length : 0;
  document.getElementById('overviewGrid').innerHTML = `
    <div class="ov-cell"><div class="ov-val" style="color:var(--blue)">${overall}</div><div class="ov-label">Level</div></div>
    <div class="ov-cell"><div class="ov-val" style="color:var(--gold)">${qCount}</div><div class="ov-label">Program</div></div>
    <div class="ov-cell"><div class="ov-val" style="color:var(--green)">${trCount}</div><div class="ov-label">Sesi Latihan</div></div>`;

  // Fisik bars
  const fisikList = [
    ['Daya Tahan',f.dayaTahan],['Stamina',f.stamina],['Kecepatan',f.kecepatan],
    ['Kelincahan',f.kelincahan],['Keseimbangan',f.keseimbangan],
    ['Power Tungkai',f.powerTungkai],['Kekuatan Lengan',f.kekuatanLengan]
  ];
  if (isSeni) fisikList.push(['Fleksibilitas',f.fleksibilitas]);
  document.getElementById('fisikBars').innerHTML = fisikList.map(([n,v])=>statRow(n,v,false)).join('');

  // Pasif bars
  const pasifList = isSeni ? [
    ['Hafalan',p.hafalan],['Penghayatan',p.penghayatan],
    ['Irama & Tempo',p.irama],['Koordinasi',p.koordinasi],
    ['Manaj. Waktu',p.manajemenWaktu]
  ] : [
    ['Fight IQ',p.fightIq],['Reflek',p.reflek],['Mental',p.mental],['Taktik & Strategi',p.taktik]
  ];
  document.getElementById('pasifBars').innerHTML = pasifList.map(([n,v])=>statRow(n,v,true)).join('');

  // Skill chips
  let skillHtml = '';
  if (isSeni) {
    skillHtml += skillGroup('⚔ Serangan', [['Pukulan',s.serang?.pukulan],['Tendangan',s.serang?.tendangan]]);
    skillHtml += skillGroup('🛡 Bertahan', [['Tangkisan',s.tahan?.tangkisan],['Elakan',s.tahan?.elakan]]);
    skillHtml += skillGroup('🎭 Teknik Seni', [['Pola Langkah',s.teknik?.polaLangkah],['Kuda-kuda',s.teknik?.kudaKuda]]);
  } else {
    skillHtml += skillGroup('⚔ Menyerang', [['Lurus',s.serang?.lurus],['Uppercut',s.serang?.upper],['T.Depan',s.serang?.depan],['T.Sabit',s.serang?.sabit],['Tend.T',s.serang?.t]]);
    skillHtml += skillGroup('🛡 Bertahan', [['Tangkisan',s.tahan?.tangkis],['Elakan',s.tahan?.elak],['Tangkapan',s.tahan?.tangkap]]);
    skillHtml += skillGroup('💥 Jatuhan', [['Bantingan',s.jatuh?.banting],['Ungkitan',s.jatuh?.ungkit],['Sapuan',s.jatuh?.sapu],['Guntingan',s.jatuh?.gunting]]);
  }
  document.getElementById('skillDisplay').innerHTML = skillHtml;
}

function statRow(n, v, isPasif) {
  const val = Number(v)||0;
  return `<div class="stat-row2">
    <div class="sname">${n}</div>
    <div class="strack"><div class="sfill${isPasif?' p':''}" style="width:${val}%"></div></div>
    <div class="sval${isPasif?' p':''}">${val}</div>
  </div>`;
}

function skillGroup(title, skills) {
  return `<div class="skill-group-title">${title}</div>
  <div class="skill-display-grid" style="margin-bottom:16px">
    ${skills.map(([n,v])=>{
      const lv=Number(v)||0;const t=tier(lv);const tc=tierClass(lv);
      return `<div class="sdchip">
        <div class="sdchip-name">${n}</div>
        <div class="sdchip-val ${tc}">${lv}</div>
        <div class="sdchip-tier ${tc}">${t}-TIER</div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── QUEST / PROGRAM ───────────────────────────────────────
function renderQuest(d) {
  const programs = d?.program || {};
  const el = document.getElementById('questPage');
  const entries = Object.entries(programs).sort(([,a],[,b])=>(b.createdAt||0)-(a.createdAt||0));

  if (!entries.length) {
    el.innerHTML = `<div class="qp-empty">⌀ Belum ada program latihan<br><span style="opacity:.5">Pelatih belum membuat program</span></div>`;
    return;
  }

  const today = new Date().toISOString().slice(0,10);
  el.innerHTML = entries.map(([qid, q]) => {
    const status = !q.tglMulai ? 'upcoming'
      : today < q.tglMulai ? 'upcoming'
      : q.tglSelesai && today > q.tglSelesai ? 'done' : 'active';
    const cats = Object.entries(q.kategori||{});
    const total = cats.reduce((s,[,c])=>s+Object.keys(c.poin||{}).length,0);
    const done  = cats.reduce((s,[,c])=>s+Object.values(c.poin||{}).filter(p=>p.selesai).length,0);
    const pct   = total > 0 ? Math.round(done/total*100) : 0;
    const iconClass = status==='active'?'green':status==='upcoming'?'gold':'muted';
    const iconEmoji = status==='active'?'🟢':status==='upcoming'?'🔜':'✅';
    const pbClass = {active:'pb-green',upcoming:'pb-gold',done:'pb-muted'}[status];
    const pbLabel = {active:'● AKTIF',upcoming:'◌ AKAN DATANG',done:'✓ SELESAI'}[status];

    const catsHtml = cats
      .sort(([,a],[,b])=>(a.createdAt||0)-(b.createdAt||0))
      .map(([katId, kat]) => {
        const poinEntries = Object.entries(kat.poin||{}).sort(([,a],[,b])=>(a.createdAt||0)-(b.createdAt||0));
        return `<div class="kat-item">
          <div class="kat-header2" onclick="toggleKat('${katId}')">
            <span class="kat-icon2">${kat.icon||'🔥'}</span>
            <span class="kat-name2">${kat.nama}</span>
            <span class="kat-count2">${poinEntries.length} poin</span>
            <span class="kat-chev" id="kchev-${katId}">▶</span>
          </div>
          <div class="kat-body2" id="kbody-${katId}">
            ${poinEntries.map(([pid, pt]) => renderPoin(qid, katId, pid, pt)).join('')}
          </div>
        </div>`;
      }).join('');

    return `<div class="prog-card ${status}-prog" id="prog-${qid}">
      <div class="prog-header" onclick="toggleProg('${qid}')">
        <div class="prog-icon ${iconClass}">${iconEmoji}</div>
        <div class="prog-info">
          <div class="prog-name">${q.nama}</div>
          <div class="prog-meta">
            ${q.tglMulai?`<span>📅 ${q.tglMulai}${q.tglSelesai?' → '+q.tglSelesai:''}</span>`:''}
            <span>${total} poin · ${done} selesai</span>
          </div>
        </div>
        <div class="prog-right">
          <span class="prog-badge ${pbClass}">${pbLabel}</span>
          <div class="prog-ring-wrap">
            <div class="mini-ring" style="--pr:${pct}"><span class="mini-ring-num">${pct}%</span></div>
            <span>${pct}%</span>
          </div>
          <span class="prog-chevron" id="pchev-${qid}">▶</span>
        </div>
      </div>
      <div class="prog-bar-wrap">
        <div class="prog-bar-bg"><div class="prog-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="prog-body" id="pbody-${qid}">
        ${q.desc?`<div class="prog-desc">${q.desc}</div>`:''}
        ${catsHtml}
      </div>
    </div>`;
  }).join('');
}

function renderPoin(questId, katId, poinId, pt) {
  const node = sessionStorage.getItem('yd_atlet_node')||'atlet';
  const links = [
    pt.imgUrl?`<a class="poin-link img" href="${pt.imgUrl}" target="_blank">🖼 Gambar</a>`:'',
    pt.vidUrl?`<a class="poin-link vid" href="${pt.vidUrl}" target="_blank">▶ Video</a>`:''
  ].filter(Boolean).join('');
  return `<div class="poin-item">
    <div class="poin-check${pt.selesai?' done':''}" onclick="togglePoin('${questId}','${katId}','${poinId}',${!!pt.selesai})"></div>
    <div class="poin-info">
      <div class="poin-title${pt.selesai?' done':''}">${pt.judul}</div>
      ${pt.desc?`<div class="poin-desc">${pt.desc}</div>`:''}
      ${pt.reps?`<div class="poin-reps">◈ ${pt.reps} <span style="opacity:.5;font-size:9px">[${pt.tipe||'repetisi'}]</span></div>`:''}
      ${links?`<div class="poin-links">${links}</div>`:''}
    </div>
  </div>`;
}

window.togglePoin = function(questId, katId, poinId, current) {
  const node = sessionStorage.getItem('yd_atlet_node')||'atlet';
  const newVal = !current;
  db.ref(`${node}/${currentAtletId}/program/${questId}/kategori/${katId}/poin/${poinId}/selesai`).set(newVal)
    .then(()=>toast(newVal ? '✓ Poin selesai!' : '↩ Poin dibatalkan', newVal?'success':'info'))
    .catch(()=>toast('Gagal menyimpan', 'info'));
};

window.toggleProg = function(qid) {
  const body = document.getElementById('pbody-'+qid);
  const chev = document.getElementById('pchev-'+qid);
  const o = body.classList.toggle('open');
  if (chev) chev.classList.toggle('open', o);
  chev && (chev.style.transform = o ? 'rotate(90deg)' : '');
};
window.toggleKat = function(katId) {
  const body = document.getElementById('kbody-'+katId);
  const chev = document.getElementById('kchev-'+katId);
  const o = body.classList.toggle('open');
  chev && (chev.style.transform = o ? 'rotate(90deg)' : '');
};

// ── GRAFIK ────────────────────────────────────────────────
function renderGrafik(d, isSeni) {
  const wrap = document.getElementById('grafikWrap');
  if (!d.history || Object.keys(d.history).length < 2) {
    wrap.innerHTML = `<div class="no-data-txt">⌀ Minimal 2 update data untuk menampilkan grafik perkembangan</div>`;
    return;
  }
  const sorted = Object.values(d.history).sort((a,b)=>a.ts-b.ts);
  const labels = sorted.map(h=>new Date(h.ts).toLocaleDateString('id-ID',{day:'2-digit',month:'short'}));
  const overall = sorted.map(h=>calcOverall({fisik:h.fisik,pasif:h.pasif,skill:h.skill}));

  wrap.innerHTML = `
    <div class="chart-block">
      <div class="chart-block-title">▸ Overall Level</div>
      <div class="chart-wrap"><canvas id="ch-ovr"></canvas></div>
    </div>
    <div class="chart-block">
      <div class="chart-block-title">▸ Statistik Fisik</div>
      <div class="chart-wrap"><canvas id="ch-fisik"></canvas></div>
    </div>
    <div class="chart-block">
      <div class="chart-block-title">▸ Skill Pasif</div>
      <div class="chart-wrap"><canvas id="ch-pasif"></canvas></div>
    </div>`;

  const grid = 'rgba(99,179,237,0.06)', text='#4a6080';
  const opts = (ds) => ({type:'line',data:{labels,datasets:ds},options:{responsive:true,maintainAspectRatio:false,animation:{duration:600},plugins:{legend:{labels:{color:text,font:{family:'JetBrains Mono',size:9},boxWidth:10,padding:10}}},scales:{x:{grid:{color:grid},ticks:{color:text,font:{family:'JetBrains Mono',size:9}}},y:{min:0,max:100,grid:{color:grid},ticks:{color:text,font:{family:'JetBrains Mono',size:9},stepSize:25}}}}});

  ['ch-ovr','ch-fisik','ch-pasif'].forEach(k=>{if(chartInst[k]){chartInst[k].destroy();delete chartInst[k];}});

  chartInst['ch-ovr'] = new Chart(document.getElementById('ch-ovr'), opts([{label:'Overall',data:overall,borderColor:'#63b3ed',backgroundColor:'rgba(99,179,237,.07)',fill:true,tension:.4,pointRadius:4,borderWidth:2,pointBackgroundColor:'#63b3ed'}]));

  const fisikK = ['dayaTahan','stamina','kecepatan','kelincahan','keseimbangan','powerTungkai','kekuatanLengan'];
  const fisikN = ['Daya Tahan','Stamina','Kecepatan','Kelincahan','Keseimbangan','Pow.Tungkai','Kek.Lengan'];
  const fisikC = ['#63b3ed','#48bb78','#f6c90e','#b794f4','#fc5c7d','#4299e1','#ed8936'];
  if (isSeni) { fisikK.push('fleksibilitas'); fisikN.push('Fleksibilitas'); fisikC.push('#34d399'); }
  chartInst['ch-fisik'] = new Chart(document.getElementById('ch-fisik'), opts(fisikK.map((k,i)=>({label:fisikN[i],data:sorted.map(h=>Number((h.fisik||{})[k]||0)),borderColor:fisikC[i],backgroundColor:'transparent',fill:false,tension:.3,pointRadius:3,borderWidth:1.5,pointBackgroundColor:fisikC[i]}))));

  const pasifK = isSeni ? ['hafalan','penghayatan','irama','koordinasi','manajemenWaktu'] : ['fightIq','reflek','mental','taktik'];
  const pasifN = isSeni ? ['Hafalan','Penghayatan','Irama','Koordinasi','Manaj.Waktu'] : ['Fight IQ','Reflek','Mental','Taktik'];
  const pasifC = ['#b794f4','#fc5c7d','#63b3ed','#f6c90e','#48bb78'];
  chartInst['ch-pasif'] = new Chart(document.getElementById('ch-pasif'), opts(pasifK.map((k,i)=>({label:pasifN[i],data:sorted.map(h=>Number((h.pasif||{})[k]||0)),borderColor:pasifC[i],backgroundColor:'transparent',fill:false,tension:.3,pointRadius:3,borderWidth:1.5,pointBackgroundColor:pasifC[i]}))));
}

// ── KALENDER ──────────────────────────────────────────────
function renderKalender(d) {
  const tr = d?.training || {};
  const {year, month} = calState;
  const mN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const dN = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const today = new Date();
  const fd = new Date(year,month,1).getDay();
  const dim = new Date(year,month+1,0).getDate();
  const dip = new Date(year,month,0).getDate();
  let cells = '';
  for (let i=fd-1;i>=0;i--) cells+=`<div class="cal-d other">${dip-i}</div>`;
  for (let d2=1;d2<=dim;d2++) {
    const k=`${year}-${String(month+1).padStart(2,'0')}-${String(d2).padStart(2,'0')}`;
    const isT=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d2;
    const isM=!!tr[k];
    cells+=`<div class="cal-d${isT?' today':''}${isM?' marked':''}" title="${isM?tr[k].note||'Latihan':''}">${d2}</div>`;
  }
  const rem=42-fd-dim;
  for(let i=1;i<=rem;i++) cells+=`<div class="cal-d other">${i}</div>`;

  // Notes list for current month
  const monthKey = `${year}-${String(month+1).padStart(2,'0')}`;
  const notes = Object.entries(tr).filter(([k])=>k.startsWith(monthKey)).sort(([a],[b])=>a.localeCompare(b));
  const notesHtml = notes.length
    ? notes.map(([k,v])=>`<div class="tl-item"><div class="tl-dot"></div><div class="tl-date">${k.slice(8)}</div><div class="tl-note">${v.note||'Latihan'}</div></div>`).join('')
    : `<div class="tl-empty">⌀ Tidak ada catatan latihan bulan ini</div>`;

  document.getElementById('calWrap').innerHTML = `
    <div class="cal-header">
      <button class="cal-arr" onclick="calNav(-1)">‹</button>
      <div class="cal-month-title">${mN[month]} ${year}</div>
      <button class="cal-arr" onclick="calNav(1)">›</button>
    </div>
    <div class="cal-grid2">
      ${dN.map(n=>`<div class="cal-dn">${n}</div>`).join('')}
      ${cells}
    </div>
    <div class="training-list">
      <div class="tl-header">Catatan Latihan — ${mN[month]}</div>
      ${notesHtml}
    </div>`;
}

window.calNav = function(dir) {
  let {year,month} = calState;
  month+=dir;
  if(month>11){month=0;year++;}
  if(month<0){month=11;year--;}
  calState={year,month};
  renderKalender(currentAtletData);
};

// ── PAGE NAVIGATION ───────────────────────────────────────
window.showPage = function(pageId, btn) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+pageId).classList.add('active');
  btn.classList.add('active');
};