/* ── CONFIG ── */
const KODE = 'STCGM';
firebase.initializeApp({
  apiKey:"AIzaSyDVr-gnYVuSBY0UQ4D-Sf-_pHN-HodBIk8",
  authDomain:"ydtc-5d55a.firebaseapp.com",
  databaseURL:"https://ydtc-5d55a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"ydtc-5d55a"
});
const db = firebase.database();

let allCoaches = {}, unsubFn = null, currentCoachId = null;
let meetDetailCtx = null;
let unitIconModalCtx = null;
let profileEditCtx = null;
const guideSearchState = {};
const programSearchState = {};
let appTheme = localStorage.getItem('yd_aspel_theme') || 'dark';
let appLang  = localStorage.getItem('yd_aspel_lang')  || 'id';
let activeSection = 'dashboard';

/* per-unit state */
const unitState = {}; /* [coachId][uKey] = {showForm, showAbs, editId, searchQ} */

/* ── I18N ── */
const LANGS = ['id','en','ko','ja','zh','ar'];
const I18N = {
  id:{portal:'Portal Asisten Pelatih',assistant:'Asisten Pelatih',loadData:'Memuat data...',loginDesc:'Masukkan nama Anda dan kode akses dari koordinator',fullName:'Nama Lengkap Anda',namePh:'Ketik nama lengkap...',accessCode:'Kode Akses',login:'MASUK',loginErr:'Nama tidak ditemukan atau kode akses salah.',noCoach:'Belum ada data pelatih',info:'Info',notes:'Catatan',program:'Program',guidebook:'Guidebook',athletesUnit:'Atlet Unit',programUnit:'program',guideItem:'item',athleteUnit:'atlet',noProgram:'Belum ada program latihan',noGuide:'Belum ada guidebook',noNotes:'Belum ada catatan',active:'● AKTIF',inactive:'○ NON-AKTIF',cert:'Sertifikat',detail:'Detail',close:'Tutup',addAthlete:'+ Tambah Atlet',hideForm:'Tutup Form',weeklyAttendance:'Absensi',hideAttendance:'Tutup Absensi',save:'Simpan',delete:'Hapus',edit:'Edit',cancel:'Batal',dob:'Tgl Lahir',category:'Kategori',belt:'Sabuk',height:'Tinggi (cm)',weight:'Berat (kg)',notes_short:'Catatan',present:'Hadir',permit:'Izin',sick:'Sakit',alpha:'Alfa',searchPlaceholder:'Cari atlet...',meetDetail:'Detail Pertemuan',noData:'Tidak ada data',attNote:'Catatan pertemuan',optional:'opsional',logout:'Keluar',experience:'Pengalaman',contact:'Kontak',email:'Email',address:'Alamat',license:'Lisensi',specialization:'Spesialisasi',unitsHeld:'Unit Dipegang',certifications:'Sertifikasi',openFile:'Buka File',settings:'Pengaturan',theme:'Tema',language:'Bahasa',unitIconTitle:'Ubah Icon Unit',unitIconNote:'Masukkan link gambar icon unit. Kosongkan lalu simpan untuk menghapus icon custom.',unitIconPh:'https://.../icon.png',changeIcon:'Ubah Icon',unitIconClickTitle:'Klik untuk opsi icon unit',unitIconUrlErr:'URL icon unit tidak valid. Gunakan http/https.',unitIconSaveErr:'Gagal menyimpan icon unit. Coba lagi.',unitIconAlt:'Ikon unit',themeLight:'Terang',themeGraphite:'Graphite',themeRPG:'RPG',themeLuxury:'Luxury',profileEditTitle:'Edit profil & kontak',profileEditHint:'Perbarui kontak, email, alamat, dan URL foto profil. Kosongkan foto untuk kembali ke inisial.',profileClickTitle:'Klik untuk mengedit profil',coachProfileIcon:'Foto profil (URL)',profileUpdated:'Profil diperbarui',profileSaveErr:'Gagal menyimpan profil',unitHideDetail:'Sembunyikan'},
  en:{portal:'Assistant Coach Portal',assistant:'Assistant Coach',loadData:'Loading data...',loginDesc:'Enter your name and access code from coordinator',fullName:'Your Full Name',namePh:'Type full name...',accessCode:'Access Code',login:'LOGIN',loginErr:'Name not found or wrong access code.',noCoach:'No coach data',info:'Info',notes:'Notes',program:'Program',guidebook:'Guidebook',athletesUnit:'Unit Athletes',programUnit:'programs',guideItem:'items',athleteUnit:'athletes',noProgram:'No training program',noGuide:'No guidebook',noNotes:'No notes',active:'● ACTIVE',inactive:'○ INACTIVE',cert:'Certificates',detail:'Detail',close:'Close',addAthlete:'+ Add Athlete',hideForm:'Close Form',weeklyAttendance:'Attendance',hideAttendance:'Close Attendance',save:'Save',delete:'Delete',edit:'Edit',cancel:'Cancel',dob:'Date of Birth',category:'Category',belt:'Belt',height:'Height (cm)',weight:'Weight (kg)',notes_short:'Notes',present:'Present',permit:'Permission',sick:'Sick',alpha:'Absent',searchPlaceholder:'Search athletes...',meetDetail:'Meeting Detail',noData:'No data',attNote:'Meeting notes',optional:'optional',logout:'Logout',experience:'Experience',contact:'Contact',email:'Email',address:'Address',license:'License',specialization:'Specialization',unitsHeld:'Handled Units',certifications:'Certifications',openFile:'Open File',settings:'Settings',theme:'Theme',language:'Language',unitIconTitle:'Change unit icon',unitIconNote:'Paste the image URL for this unit icon. Leave empty and save to remove the custom icon.',unitIconPh:'https://.../icon.png',changeIcon:'Change icon',unitIconClickTitle:'Tap for unit icon options',unitIconUrlErr:'Invalid URL. Use http or https.',unitIconSaveErr:'Could not save unit icon. Try again.',unitIconAlt:'Unit icon',themeLight:'Light',themeGraphite:'Graphite',themeRPG:'RPG',themeLuxury:'Luxury',profileEditTitle:'Edit profile & contact',profileEditHint:'Update contact, email, address, and profile photo URL. Clear photo URL to use initials.',profileClickTitle:'Click to edit profile',coachProfileIcon:'Profile photo (URL)',profileUpdated:'Profile updated',profileSaveErr:'Could not save profile',unitHideDetail:'Hide'},
  ko:{portal:'코치 보조 포털',assistant:'코치 보조',loadData:'데이터 불러오는 중...',loginDesc:'코디네이터가 제공한 이름과 코드를 입력하세요',fullName:'전체 이름',namePh:'전체 이름 입력...',accessCode:'접근 코드',login:'로그인',loginErr:'이름 또는 코드가 잘못되었습니다.',noCoach:'데이터 없음',info:'정보',notes:'메모',program:'프로그램',guidebook:'가이드북',athletesUnit:'유닛 선수',programUnit:'개',guideItem:'개',athleteUnit:'명',noProgram:'프로그램 없음',noGuide:'가이드북 없음',noNotes:'메모 없음',active:'● 활동',inactive:'○ 비활동',cert:'자격증',detail:'상세',close:'닫기',addAthlete:'+ 선수 추가',hideForm:'폼 닫기',weeklyAttendance:'출석',hideAttendance:'출석 닫기',save:'저장',delete:'삭제',edit:'수정',cancel:'취소',dob:'생년월일',category:'카테고리',belt:'벨트',height:'키 (cm)',weight:'몸무게 (kg)',notes_short:'메모',present:'출석',permit:'허가',sick:'병결',alpha:'결석',searchPlaceholder:'선수 검색...',meetDetail:'수업 상세',noData:'데이터 없음',attNote:'수업 메모',optional:'선택',logout:'로그아웃',experience:'경력',contact:'연락처',email:'이메일',address:'주소',license:'라이선스',specialization:'전문',unitsHeld:'담당 유닛',certifications:'자격증',openFile:'파일 열기',settings:'설정',theme:'테마',language:'언어',unitIconTitle:'유닛 아이콘 변경',unitIconNote:'유닛 아이콘 이미지 URL을 입력하세요. 비우고 저장하면 사용자 지정 아이콘이 삭제됩니다.',unitIconPh:'https://.../icon.png',changeIcon:'아이콘 변경',unitIconClickTitle:'탭하여 유닛 아이콘 옵션',unitIconUrlErr:'URL이 올바르지 않습니다. http 또는 https를 사용하세요.',unitIconSaveErr:'아이콘을 저장하지 못했습니다. 다시 시도하세요.',unitIconAlt:'유닛 아이콘',themeLight:'라이트',themeGraphite:'그래파이트',themeRPG:'RPG',themeLuxury:'럭셔리',profileEditTitle:'프로필 및 연락처 수정',profileEditHint:'연락처, 이메일, 주소, 프로필 사진 URL을 입력하세요. 사진 URL을 비우면 이니셜이 표시됩니다.',profileClickTitle:'탭하여 프로필 편집',coachProfileIcon:'프로필 사진 (URL)',profileUpdated:'프로필이 업데이트되었습니다',profileSaveErr:'저장에 실패했습니다',unitHideDetail:'접기'},
  ja:{portal:'アシスタントコーチポータル',assistant:'アシスタントコーチ',loadData:'データ読み込み中...',loginDesc:'コーディネーターから提供された名前とコードを入力してください',fullName:'氏名',namePh:'氏名を入力...',accessCode:'アクセスコード',login:'ログイン',loginErr:'名前またはコードが正しくありません。',noCoach:'データなし',info:'情報',notes:'ノート',program:'プログラム',guidebook:'ガイドブック',athletesUnit:'ユニット選手',programUnit:'件',guideItem:'件',athleteUnit:'人',noProgram:'プログラムなし',noGuide:'ガイドブックなし',noNotes:'ノートなし',active:'● アクティブ',inactive:'○ 非アクティブ',cert:'資格',detail:'詳細',close:'閉じる',addAthlete:'+ 選手追加',hideForm:'フォームを閉じる',weeklyAttendance:'出席',hideAttendance:'出席を閉じる',save:'保存',delete:'削除',edit:'編集',cancel:'キャンセル',dob:'生年月日',category:'カテゴリ',belt:'帯',height:'身長 (cm)',weight:'体重 (kg)',notes_short:'メモ',present:'出席',permit:'許可',sick:'病欠',alpha:'欠席',searchPlaceholder:'選手を検索...',meetDetail:'練習詳細',noData:'データなし',attNote:'練習メモ',optional:'任意',logout:'ログアウト',experience:'経験',contact:'連絡先',email:'メール',address:'住所',license:'ライセンス',specialization:'専門',unitsHeld:'担当ユニット',certifications:'認定',openFile:'ファイルを開く',settings:'設定',theme:'テーマ',language:'言語',unitIconTitle:'ユニットアイコンを変更',unitIconNote:'ユニットアイコンの画像URLを入力してください。空のまま保存するとカスタムアイコンを削除します。',unitIconPh:'https://.../icon.png',changeIcon:'アイコンを変更',unitIconClickTitle:'タップでユニットアイコン',unitIconUrlErr:'URLが無効です。httpまたはhttpsを使用してください。',unitIconSaveErr:'保存に失敗しました。再度お試しください。',unitIconAlt:'ユニットアイコン',themeLight:'ライト',themeGraphite:'グラファイト',themeRPG:'RPG',themeLuxury:'ラグジュアリー',profileEditTitle:'プロフィール・連絡先を編集',profileEditHint:'連絡先、メール、住所、プロフィール画像のURLを更新できます。画像URLを空にするとイニシャル表示に戻ります。',profileClickTitle:'タップしてプロフィールを編集',coachProfileIcon:'プロフィール画像 (URL)',profileUpdated:'プロフィールを更新しました',profileSaveErr:'保存に失敗しました',unitHideDetail:'閉じる'},
  zh:{portal:'助理教练门户',assistant:'助理教练',loadData:'加载中...',loginDesc:'请输入协调员提供的姓名和访问码',fullName:'您的全名',namePh:'输入全名...',accessCode:'访问码',login:'登录',loginErr:'姓名或访问码错误。',noCoach:'暂无数据',info:'信息',notes:'笔记',program:'训练计划',guidebook:'指南',athletesUnit:'分组运动员',programUnit:'个',guideItem:'个',athleteUnit:'名',noProgram:'暂无训练计划',noGuide:'暂无指南',noNotes:'暂无笔记',active:'● 在职',inactive:'○ 非在职',cert:'证书',detail:'详情',close:'关闭',addAthlete:'+ 添加运动员',hideForm:'关闭表单',weeklyAttendance:'考勤',hideAttendance:'关闭考勤',save:'保存',delete:'删除',edit:'编辑',cancel:'取消',dob:'出生日期',category:'类别',belt:'腰带',height:'身高 (cm)',weight:'体重 (kg)',notes_short:'备注',present:'出席',permit:'请假',sick:'病假',alpha:'缺席',searchPlaceholder:'搜索运动员...',meetDetail:'课程详情',noData:'暂无数据',attNote:'课程备注',optional:'可选',logout:'退出',experience:'经验',contact:'联系',email:'邮箱',address:'地址',license:'执照',specialization:'专长',unitsHeld:'负责分组',certifications:'证书',openFile:'打开文件',settings:'设置',theme:'主题',language:'语言',unitIconTitle:'更改分组图标',unitIconNote:'输入分组图标的图片链接。留空并保存可移除自定义图标。',unitIconPh:'https://.../icon.png',changeIcon:'更改图标',unitIconClickTitle:'点击查看分组图标选项',unitIconUrlErr:'链接无效，请使用 http 或 https。',unitIconSaveErr:'保存失败，请重试。',unitIconAlt:'分组图标',themeLight:'浅色',themeGraphite:'石墨',themeRPG:'RPG',themeLuxury:'奢华',profileEditTitle:'编辑资料与联系方式',profileEditHint:'更新联系方式、邮箱、地址和头像图片链接。留空头像链接则显示姓名首字母。',profileClickTitle:'点击编辑资料',coachProfileIcon:'头像 (URL)',profileUpdated:'已更新资料',profileSaveErr:'保存失败',unitHideDetail:'收起'},
  ar:{portal:'بوابة مساعد المدرب',assistant:'مساعد المدرب',loadData:'جارٍ التحميل...',loginDesc:'أدخل اسمك ورمز الوصول المقدم من المنسق',fullName:'الاسم الكامل',namePh:'اكتب الاسم الكامل...',accessCode:'رمز الوصول',login:'دخول',loginErr:'الاسم أو الرمز غير صحيح.',noCoach:'لا توجد بيانات',info:'معلومات',notes:'ملاحظات',program:'البرنامج',guidebook:'الدليل',athletesUnit:'رياضيو الوحدة',programUnit:'برنامج',guideItem:'عنصر',athleteUnit:'رياضي',noProgram:'لا يوجد برنامج',noGuide:'لا يوجد دليل',noNotes:'لا توجد ملاحظات',active:'● نشط',inactive:'○ غير نشط',cert:'شهادات',detail:'تفاصيل',close:'إغلاق',addAthlete:'+ إضافة رياضي',hideForm:'إغلاق النموذج',weeklyAttendance:'الحضور',hideAttendance:'إغلاق الحضور',save:'حفظ',delete:'حذف',edit:'تعديل',cancel:'إلغاء',dob:'تاريخ الميلاد',category:'الفئة',belt:'الحزام',height:'الطول (سم)',weight:'الوزن (كغ)',notes_short:'ملاحظة',present:'حاضر',permit:'إذن',sick:'مرض',alpha:'غائب',searchPlaceholder:'ابحث عن الرياضي...',meetDetail:'تفاصيل اللقاء',noData:'لا توجد بيانات',attNote:'ملاحظات اللقاء',optional:'اختياري',logout:'خروج',experience:'خبرة',contact:'التواصل',email:'البريد',address:'العنوان',license:'الرخصة',specialization:'التخصص',unitsHeld:'الوحدات',certifications:'الشهادات',openFile:'فتح الملف',settings:'الإعدادات',theme:'المظهر',language:'اللغة',unitIconTitle:'تغيير أيقونة الوحدة',unitIconNote:'أدخل رابط صورة أيقونة الوحدة. اترك الحقل فارغاً ثم احفظ لإزالة الأيقونة المخصصة.',unitIconPh:'https://.../icon.png',changeIcon:'تغيير الأيقونة',unitIconClickTitle:'اضغط لخيارات أيقونة الوحدة',unitIconUrlErr:'الرابط غير صالح. استخدم http أو https.',unitIconSaveErr:'تعذر حفظ الأيقونة. حاول مرة أخرى.',unitIconAlt:'أيقونة الوحدة',themeLight:'فاتح',themeGraphite:'غرافيت',themeRPG:'RPG',themeLuxury:'فاخر',profileEditTitle:'تعديل الملف والتواصل',profileEditHint:'حدّث جهة الاتصال والبريد والعنوان ورابط صورة الملف. اترك رابط الصورة فارغاً لعرض الأحرف الأولى.',profileClickTitle:'اضغط لتعديل الملف',coachProfileIcon:'صورة الملف (رابط)',profileUpdated:'تم تحديث الملف',profileSaveErr:'تعذر حفظ الملف',unitHideDetail:'إخفاء'}
};
function T(k){ return (I18N[appLang]&&I18N[appLang][k])||I18N.id[k]||k; }

/* ── UTILS ── */
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function safeUrl(u){ try{const url=new URL(u);if(['http:','https:'].includes(url.protocol))return esc(u);}catch(e){}return ''; }
function pickSafeUrl(obj, keys){ for(const k of keys){const s=safeUrl(obj?.[k]);if(s)return s;}return ''; }
function isPreviewVideoUrl(u){
  if(!u) return false;
  try{
    const path = new URL(u).pathname.toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v)$/i.test(path);
  }catch(e){
    return false;
  }
}
function extractYouTubeId(u){
  if(!u) return '';
  try{
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./,'');
    if(host==='youtu.be') return url.pathname.slice(1);
    if(host.includes('youtube.com')){
      if(url.searchParams.get('v')) return url.searchParams.get('v');
      const parts = url.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if(embedIdx>=0 && parts[embedIdx+1]) return parts[embedIdx+1];
      const shortsIdx = parts.indexOf('shorts');
      if(shortsIdx>=0 && parts[shortsIdx+1]) return parts[shortsIdx+1];
    }
  }catch(e){}
  return '';
}
function getVideoThumbUrl(videoUrl, item){
  const custom = pickSafeUrl(item, ['vidThumbUrl','vidThumbnailUrl','videoThumbUrl','videoThumbnailUrl','thumbUrl','thumbnailUrl']);
  if(custom) return custom;
  const ytId = extractYouTubeId(videoUrl);
  if(ytId) return `https://i.ytimg.com/vi/${encodeURIComponent(ytId)}/hqdefault.jpg`;
  return '';
}
function initials(n){ return(n||'').split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()||'').join(''); }
function diffYears(dob){ if(!dob)return null;const y=new Date().getFullYear()-new Date(dob).getFullYear();return isNaN(y)||y<0?null:y; }
function fmtDate(s){ if(!s||s==='–')return'–';try{return new Date(s).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});}catch(e){return s;} }
function progCount(d){ return Object.keys(d?.program||{}).length; }
function guideCount(d){ return Object.keys(d?.guidebook||{}).length; }
function athleteCount(d){ return Object.values(d?.atletPerUnit||{}).reduce((s,u)=>s+Object.keys(u||{}).length,0); }
function unitKey(u){ return encodeURIComponent(String(u||'Tanpa Unit').trim()); }
function unitLabel(k){ try{return decodeURIComponent(k);}catch(e){return k;} }
function getState(cId,uKey){
  if(!unitState[cId])unitState[cId]={};
  if(!unitState[cId][uKey])unitState[cId][uKey]={showForm:false,showAbs:false,editId:null,searchQ:'',showUnitIconAction:false,showUnitDetail:false};
  const st=unitState[cId][uKey];
  if(st.showUnitDetail===undefined)st.showUnitDetail=false;
  return st;
}
function presStatus(rec){ if(rec?.status)return rec.status;if(rec?.hadir===true)return 'hadir';return 'alfa'; }
function showToast(m){ const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000); }

/* ── THEME ── */
document.documentElement.setAttribute('data-theme', appTheme);
document.documentElement.setAttribute('dir', appLang==='ar'?'rtl':'ltr');

window.setTheme = function(th){
  appTheme = th;
  document.documentElement.setAttribute('data-theme', th);
  localStorage.setItem('yd_aspel_theme', th);
  document.querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active', b.dataset.themeVal===th));
};
function buildLangRow(){
  const langLabels = {id:'ID',en:'EN',ko:'KO',ja:'JA',zh:'ZH',ar:'AR'};
  const html = LANGS.map(l=>`<button class="lang-btn${appLang===l?' active':''}" onclick="setLang('${l}')">${langLabels[l]}</button>`).join('');
  ['langRow','mbLangRow'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=html;});
}
window.setLang = function(lang){
  appLang = lang;
  localStorage.setItem('yd_aspel_lang', lang);
  document.documentElement.setAttribute('dir', lang==='ar'?'rtl':'ltr');
  buildLangRow();
  applyI18N();
  renderFiltered();
};
function applyI18N(){
  document.title = `YD ATHLETE — ${T('portal')}`;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  const mbTxt=(btnId,v)=>{const b=document.getElementById(btnId);const t=b?.querySelector('.mb-txt');if(t)t.textContent=v;};
  s('lsSub',T('portal'));s('loginRole',T('portal'));s('loginDesc',T('loginDesc'));
  s('lblNama',T('fullName'));s('lblKode',T('accessCode'));s('btnLogin',T('login'));
  s('loginErr',T('loginErr'));s('tbRole',T('assistant'));
  s('navDashboard',T('info'));s('navProgram',T('program'));s('navGuidebook',T('guidebook'));s('navAthletes',T('athletesUnit'));
  mbTxt('mbNavInfo',T('info'));mbTxt('mbNavProgram',T('program'));mbTxt('mbNavGuidebook',T('guidebook'));mbTxt('mbNavAthletes',T('athletesUnit'));mbTxt('mbNavSetting',T('settings'));
  s('loadingDataTxt',T('loadData'));
  const inNama=document.getElementById('inNama');if(inNama)inNama.placeholder=T('namePh');
  s('iconUnitModalTitle',T('unitIconTitle'));s('iconUnitModalNote',T('unitIconNote'));s('iconUnitModalCloseTxt',T('close'));s('iconUnitModalCancel',T('cancel'));s('iconUnitModalSave',T('save'));
  const uuInp=document.getElementById('unitIconUrlInput');if(uuInp)uuInp.placeholder=T('unitIconPh');
  document.querySelectorAll('.tb-menu-lbl[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(k)el.textContent=T(k);});
  const themeLbl={light:'themeLight',dark:'themeGraphite',rpg:'themeRPG',luxury:'themeLuxury'};
  document.querySelectorAll('.theme-btn').forEach(b=>{
    const k=themeLbl[b.dataset.themeVal];
    const span=b.querySelector('.theme-btn-txt');
    if(k&&span)span.textContent=T(k);
  });
  document.querySelectorAll('.logout-txt').forEach(el=>{el.textContent=T('logout');});
  s('profileEditModalTitle',T('profileEditTitle'));s('profileEditModalNote',T('profileEditHint'));s('profileEditModalCloseTxt',T('close'));
  s('profileLblKontak',T('contact'));s('profileLblEmail',T('email'));s('profileLblAlamat',T('address'));s('profileLblIcon',T('coachProfileIcon'));
  s('profileEditCancel',T('cancel'));s('profileEditSave',T('save'));
  const pIconInp=document.getElementById('profileEditIconUrl');if(pIconInp)pIconInp.placeholder=T('unitIconPh');
}

/* ── SETTINGS MENU ── */
window.toggleSettingsMenu = function(ev){ if(ev)ev.stopPropagation();document.getElementById('settingsMenu').classList.toggle('show'); };
window.toggleMbSettings = function(ev){ if(ev)ev.stopPropagation();document.getElementById('mbSettingsPanel').classList.toggle('show'); };
document.addEventListener('click',e=>{
  const sm=document.getElementById('settingsMenu');if(sm&&!sm.closest('.tb-settings').contains(e.target))sm.classList.remove('show');
  const mp=document.getElementById('mbSettingsPanel');if(mp&&!mp.closest('.mb-nav-wrap').contains(e.target))mp.classList.remove('show');
  if(!e.target.closest('.unit-icon') && !e.target.closest('.unit-icon-action')){
    let needRender=false;
    Object.keys(unitState).forEach(cId=>{
      Object.keys(unitState[cId]||{}).forEach(uKey=>{
        const st = unitState[cId][uKey];
        if(st?.showUnitIconAction){ st.showUnitIconAction=false; needRender=true; }
      });
    });
    if(needRender && currentCoachId && allCoaches[currentCoachId]) renderAthletes(currentCoachId, allCoaches[currentCoachId]);
  }
});

/* ── NAVIGATION ── */
window.navigateSection = function(sec){
  activeSection = sec;
  document.querySelectorAll('[data-sec]').forEach(el=>el.classList.toggle('sec-hidden',el.dataset.sec!==sec));
  document.querySelectorAll('.tb-nav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.mb-btn').forEach(b=>b.classList.remove('active'));
  const tbMap={dashboard:'navDashboard',program:'navProgram',guidebook:'navGuidebook',athletes:'navAthletes'};
  const mbMap={dashboard:'mbNavInfo',program:'mbNavProgram',guidebook:'mbNavGuidebook',athletes:'mbNavAthletes'};
  [tbMap[sec],mbMap[sec]].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('active');});
};

/* ── LOADING & SESSION ── */
window.addEventListener('load',()=>{
  applyI18N();buildLangRow();
  document.querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active',b.dataset.themeVal===appTheme));
  setTimeout(()=>{
    document.getElementById('ls').classList.add('out');
    setTimeout(()=>{
      document.getElementById('ls').style.display='none';
      const ok=sessionStorage.getItem('yd_asisten_ok')==='1';
      const id=sessionStorage.getItem('yd_asisten_id');
      if(ok&&id){currentCoachId=id;showApp();}
      else{sessionStorage.clear();document.getElementById('login').classList.add('vis');}
    },500);
  },1500);
});

['inKode'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();}));
document.getElementById('inNama').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('inKode').focus();});

window.doLogin = async function(){
  const nama=document.getElementById('inNama').value.trim();
  const kode=document.getElementById('inKode').value.trim().toUpperCase();
  const err=document.getElementById('loginErr');
  err.classList.remove('show');
  if(!nama||!kode){err.classList.add('show');return;}
  if(kode!==KODE){err.classList.add('show');return;}
  try{
    const snap=await db.ref('pelatih').once('value');
    let foundId=null;
    snap.forEach(c=>{if((c.val()?.nama||'').trim().toLowerCase()===nama.toLowerCase())foundId=c.key;});
    if(!foundId){err.classList.add('show');return;}
    currentCoachId=foundId;
    sessionStorage.setItem('yd_asisten_ok','1');
    sessionStorage.setItem('yd_asisten_id',foundId);
    document.getElementById('login').style.opacity='0';
    setTimeout(()=>{document.getElementById('login').classList.remove('vis');document.getElementById('login').style.opacity='';showApp();},400);
  }catch(e){
    err.textContent='Gagal terhubung ke server. Coba lagi.';
    err.classList.add('show');
  }
};

window.doLogout = function(){
  sessionStorage.clear();
  if(unsubFn){unsubFn();unsubFn=null;}
  location.reload();
};

/* ── APP ── */
function showApp(){
  if(!currentCoachId){document.getElementById('login').classList.add('vis');return;}
  document.getElementById('app').classList.add('vis');
  const ref=db.ref(`pelatih/${currentCoachId}`);
  const listener=ref.on('value',snap=>{
    allCoaches={};
    if(snap.exists())allCoaches[currentCoachId]=snap.val();
    renderFiltered();
  });
  unsubFn=()=>ref.off('value',listener);
}

/* ══════════════════════════════════════════════════════
   RENDER PIPELINE
══════════════════════════════════════════════════════ */
function renderFiltered(){
  const grid=document.getElementById('rosterGrid');
  const entries=Object.entries(allCoaches);
  if(!entries.length){
    grid.innerHTML=`<div class="page-empty"><div class="pe-icon"><iconify-icon icon="lucide:diamond"></iconify-icon></div><div class="pe-txt">${T('noCoach')}</div></div>`;
    return;
  }
  grid.innerHTML=entries.map(([id,d],i)=>renderShell(id,d,i)).join('');
  entries.forEach(([id,d])=>{
    renderInfo(id,d);renderProgram(id,d);renderGuide(id,d);renderAthletes(id,d);
  });
  navigateSection(activeSection);
}

function renderShell(id,d,idx){
  const isActive=d.statusAktif!=='nonaktif';
  const ini=esc(initials(d.nama));
  const nm=esc(d.nama||'—');
  const sp=esc(d.spesialisasi||'Pelatih');
  const units=d.unit||[];
  const certs=d.sertifikasi||[];
  const pC=progCount(d),gC=guideCount(d),aC=athleteCount(d),nC=Object.keys(d?.notes||{}).length;
  const ageVal=diffYears(d.tglLahir);
  const age=ageVal!==null?` · ${ageVal} thn`:'';
  const coachIcon=safeUrl(d.iconUrl||'');
  const avInner=coachIcon?`<img class="cp-av-img" src="${coachIcon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="cp-av-ini" style="display:none">${ini}</span>`:`<span class="cp-av-ini">${ini}</span>`;
  return `<div class="coach-panel" data-sec="dashboard" style="animation-delay:${idx*0.05}s">
  <div class="cp-strip ${isActive?'':'inactive'}"></div>
  <div class="cp-header">
    <div class="cp-avatar ${isActive?'':'inactive'}" onclick="openProfileEditModal('${id}')" title="${esc(T('profileClickTitle'))}" role="button" tabindex="0">${avInner}<div class="cp-av-dot ${isActive?'on':'off'}"></div></div>
    <div class="cp-info">
      <div class="cp-name">${nm}</div>
      <div class="cp-spec">${sp}${age}</div>
      <div class="cp-badges">
        <span class="badge ${isActive?'badge-green':'badge-gray'}">${isActive?T('active'):T('inactive')}</span>
        ${certs.length?`<span class="badge badge-accent"><iconify-icon icon="lucide:award"></iconify-icon> ${certs.length} ${T('cert')}</span>`:''}
        ${d.lisensi&&d.lisensi!=='–'?`<span class="badge badge-teal"><iconify-icon icon="lucide:clipboard-list"></iconify-icon> ${esc(d.lisensi)}</span>`:''}
        ${units.slice(0,2).map(u=>`<span class="badge badge-accent">${esc(u)}</span>`).join('')}
        ${units.length>2?`<span class="badge badge-gray">+${units.length-2}</span>`:''}
      </div>
    </div>
  </div>
  <div class="cp-tabs">
    <button class="cp-tab active" onclick="switchTab('${id}','info',this)">Info</button>
    <button class="cp-tab" onclick="switchTab('${id}','notes',this)">${T('notes')}${nC>0?` (${nC})`:''}</button>
  </div>
  <div id="tb-info-${id}" class="cp-tab-body"></div>
  <div id="tb-notes-${id}" class="cp-tab-body hidden"></div>
</div>
<div class="section-panel" data-sec="program" style="animation-delay:${idx*0.05+.06}s">
  <div class="section-panel-hd"><div class="section-panel-title">${T('program')}</div><div class="section-panel-count">${pC} ${T('programUnit')}</div></div>
  <div class="cp-tab-body" id="program-body-${id}"></div>
</div>
<div class="section-panel" data-sec="guidebook" style="animation-delay:${idx*0.05+.08}s">
  <div class="section-panel-hd"><div class="section-panel-title">${T('guidebook')}</div><div class="section-panel-count">${gC} ${T('guideItem')}</div></div>
  <div class="cp-tab-body" id="guide-body-${id}"></div>
</div>
<div class="section-panel" data-sec="athletes" style="animation-delay:${idx*0.05+.1}s">
  <div class="section-panel-hd"><div class="section-panel-title">${T('athletesUnit')}</div><div class="section-panel-count">${aC} ${T('athleteUnit')}</div></div>
  <div id="athletes-body-${id}"></div>
</div>`;
}

window.switchTab = function(id,tab,btn){
  document.querySelectorAll(`#panel-${id} .cp-tab, [data-panel="${id}"].cp-tab`).forEach(b=>b.classList.remove('active'));
  // find all cp-tabs in same panel
  const tabs = btn.closest('.cp-tabs');
  if(tabs) tabs.querySelectorAll('.cp-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tb-info-${id}`).classList.toggle('hidden',tab!=='info');
  document.getElementById(`tb-notes-${id}`).classList.toggle('hidden',tab!=='notes');
  const d=allCoaches[id];if(!d)return;
  if(tab==='info')renderInfo(id,d);
  if(tab==='notes')renderNotes(id,d);
};

/* ── INFO ── */
function renderInfo(id,d){
  if(!d)return;
  const p=document.getElementById('tb-info-'+id);
  const ageVal=diffYears(d.tglLahir);
  const age=ageVal!==null?`${ageVal} tahun`:'—';
  const expVal=d.tahunMulai?diffYears(`${d.tahunMulai}-01-01`):null;
  const exp=expVal!==null?`${expVal} thn (sejak ${esc(d.tahunMulai)})`:'—';
  const units=d.unit||[],certs=d.sertifikasi||[];
  let html='';
  if(d.bio)html+=`<div class="info-bio">${esc(d.bio)}</div>`;
  html+=`<div class="info-grid">
    <div class="info-cell"><div class="ic-lbl">${T('dob')}</div><div class="ic-val">${esc(d.tglLahir||'—')} <span style="color:var(--t3);font-size:11px">· ${age}</span></div></div>
    <div class="info-cell"><div class="ic-lbl">${T('experience')}</div><div class="ic-val">${exp}</div></div>
    <div class="info-cell"><div class="ic-lbl">${T('contact')}</div><div class="ic-val muted">${esc(d.kontak||'—')}</div></div>
    <div class="info-cell"><div class="ic-lbl">${T('email')}</div><div class="ic-val muted">${esc(d.email||'—')}</div></div>
    <div class="info-cell span2"><div class="ic-lbl">${T('address')}</div><div class="ic-val muted">${esc(d.alamat||'—')}</div></div>
    <div class="info-cell"><div class="ic-lbl">${T('license')}</div><div class="ic-val">${esc(d.lisensi||'—')}</div></div>
    <div class="info-cell"><div class="ic-lbl">${T('specialization')}</div><div class="ic-val">${esc(d.spesialisasi||'—')}</div></div>
  </div>`;
  if(units.length){
    html+=`<div class="sec-lbl">${T('unitsHeld')}</div><div class="unit-chips">${units.map(u=>`<span class="uc">${esc(u)}</span>`).join('')}</div>`;
  }
  if(certs.length){
    html+=`<div class="sec-lbl">${T('certifications')}</div><div class="cert-list">${certs.map(c=>`<div class="cert-item"><span style="font-size:13px"><iconify-icon icon="lucide:award"></iconify-icon></span><span class="cert-nm">${esc(c.nama||'—')}</span>${c.tahun?`<span class="cert-yr">${esc(c.tahun)}</span>`:''}</div>`).join('')}</div>`;
  }
  p.innerHTML=html;
}

/* ── NOTES ── */
function renderNotes(id,d){
  const p=document.getElementById('tb-notes-'+id);
  const entries=Object.entries(d?.notes||{}).sort(([,a],[,b])=>(b.ts||0)-(a.ts||0));
  if(!entries.length){p.innerHTML=`<div class="panel-empty">${T('noNotes')}</div>`;return;}
  p.innerHTML=`<div class="notes-list">${entries.map(([,n])=>`<div class="note-card"><span class="note-date">${fmtDate(new Date(n.ts).toISOString().slice(0,10))}</span><div class="note-body">${esc(n.body||'')}</div></div>`).join('')}</div>`;
}

/* ── PROGRAM ── */
function renderProgram(id,d){
  const p=document.getElementById('program-body-'+id);
  const entries=Object.entries(d?.program||{}).sort(([,a],[,b])=>(b.createdAt||0)-(a.createdAt||0));
  const q=(programSearchState[id]||'').trim().toLowerCase();
  const filtered = entries.filter(([,pr])=>{
    if(!q) return true;
    const nama = String(pr?.nama||'').toLowerCase();
    const desc = String(pr?.desc||'').toLowerCase();
    const target = String(pr?.target||'').toLowerCase();
    const cats = Object.values(pr?.kategori||{}).map(k=>String(k?.nama||'').toLowerCase()).join(' ');
    return nama.includes(q) || desc.includes(q) || target.includes(q) || cats.includes(q);
  });
  if(!entries.length){p.innerHTML=`<div class="panel-empty">${T('noProgram')}</div>`;return;}
  const today=new Date().toISOString().slice(0,10);
  p.innerHTML=`<div class="prog-search-wrap">
      <span class="prog-search-icon"><iconify-icon icon="lucide:search"></iconify-icon></span>
      <input class="prog-search-input" type="text" placeholder="Cari program..." value="${esc(programSearchState[id]||'')}" oninput="onProgramSearch('${id}', this.value)">
    </div>
    <div class="prog-list" style="padding:12px">${filtered.map(([pid,pr])=>{
    const st=!pr.tglMulai?'upcoming':today<pr.tglMulai?'upcoming':pr.tglSelesai&&today>pr.tglSelesai?'done':'active';
    const icClass={active:'pib-active',upcoming:'pib-upcoming',done:'pib-done'}[st];
    const icEmoji={active:'<iconify-icon icon="lucide:circle-check-big"></iconify-icon>',upcoming:'<iconify-icon icon="lucide:clock-3"></iconify-icon>',done:'<iconify-icon icon="lucide:check-check"></iconify-icon>'}[st];
    const spClass={active:'sp-active',upcoming:'sp-upcoming',done:'sp-done'}[st];
    const spLabel={active:'Aktif',upcoming:'Akan Datang',done:'Selesai'}[st];
    const cats=Object.entries(pr.kategori||{});
    const totalPoin=cats.reduce((s,[,c])=>s+Object.keys(c.poin||{}).length,0);
    return `<div class="prog-block">
      <div class="prog-block-hd" onclick="toggleProg('${pid}')">
        <div class="prog-ic ${icClass}">${icEmoji}</div>
        <div class="prog-block-info">
          <div class="prog-name">${esc(pr.nama||'—')}</div>
          <div class="prog-meta">${pr.tglMulai?`<span><iconify-icon icon="lucide:calendar-days"></iconify-icon> ${esc(pr.tglMulai)}${pr.tglSelesai?' → '+esc(pr.tglSelesai):''}</span>`:''}
          <span><iconify-icon icon="lucide:zap"></iconify-icon> ${totalPoin} poin</span></div>
        </div>
        <div class="prog-block-right"><span class="sp ${spClass}">${spLabel}</span><span class="prog-chev" id="pch-${pid}"><iconify-icon icon="lucide:chevron-right"></iconify-icon></span></div>
      </div>
      <div class="prog-block-bd" id="pbd-${pid}">
        ${pr.desc?`<div class="prog-desc">${esc(pr.desc)}</div>`:''}
        ${pr.target?`<div class="prog-target"><iconify-icon icon="lucide:target"></iconify-icon> ${esc(pr.target)}</div>`:''}
        ${cats.map(([kId,kat])=>{
          const poins=Object.entries(kat.poin||{}).sort(([,a],[,b])=>(a.createdAt||0)-(b.createdAt||0));
          return `<div class="kat-blk">
            <div class="kat-blk-hd" onclick="toggleKat('${kId}')">
              <span>${esc(kat.icon||'🔥')}</span>
              <span class="kat-blk-nm">${esc(kat.nama||'—')}</span>
              <span class="kat-blk-ct">${poins.length} poin</span>
              <span class="kat-chev" id="kch-${kId}"><iconify-icon icon="lucide:chevron-right"></iconify-icon></span>
            </div>
            <div class="kat-bd" id="kbd-${kId}">${poins.map(([tid,ti],i)=>{
              const imgU=safeUrl(ti.imgUrl),vidU=safeUrl(ti.vidUrl);
              const canPreviewVideo=isPreviewVideoUrl(vidU);
              const videoThumb=getVideoThumbUrl(vidU, ti);
              const hasVideoThumb=Boolean(videoThumb);
              return `<div class="poin-row">
                <div class="poin-num">${i+1}</div>
                <div class="poin-body">
                  <div class="poin-title">${esc(ti.judul||'—')}</div>
                  ${ti.desc?`<div class="poin-desc">${esc(ti.desc)}</div>`:''}
                  ${ti.reps?`<div class="poin-reps"><iconify-icon icon="lucide:hash"></iconify-icon> ${esc(ti.reps)}</div>`:''}
                  ${imgU||vidU?`<div class="poin-links">${imgU?`<a class="poin-link pl-img" href="${imgU}" target="_blank" rel="noopener"><iconify-icon icon="lucide:image"></iconify-icon> Gambar</a>`:''}${vidU&&!hasVideoThumb?`<a class="poin-link pl-vid" href="${vidU}" target="_blank" rel="noopener"><iconify-icon icon="lucide:play"></iconify-icon> Video</a>`:''}</div>`:''}
                  ${imgU?`<img class="poin-thumb" src="${imgU}" onerror="this.style.display='none'">` :''}
                  ${canPreviewVideo&&!hasVideoThumb?`<video class="poin-video" src="${vidU}" controls preload="metadata"></video>`:''}
                  ${vidU&&hasVideoThumb?`<a class="poin-video-thumb-link" href="${vidU}" target="_blank" rel="noopener"><img class="poin-video-thumb" src="${videoThumb}" alt="Video thumbnail" onerror="this.parentNode.style.display='none'"><span class="poin-video-play"><iconify-icon icon="lucide:play"></iconify-icon> Video</span></a>`:''}
                </div>
              </div>`;
            }).join('')}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('')}</div>
  ${filtered.length?'':`<div class="panel-empty" style="padding-top:0">Tidak ada hasil</div>`}`;
}
window.onProgramSearch=function(id,val){
  programSearchState[id]=val||'';
  const d=allCoaches[id];
  if(d) renderProgram(id,d);
};
window.toggleProg=function(pid){const bd=document.getElementById('pbd-'+pid),ch=document.getElementById('pch-'+pid);const o=bd.classList.toggle('open');if(ch)ch.classList.toggle('open',o);};
window.toggleKat=function(kId){const bd=document.getElementById('kbd-'+kId),ch=document.getElementById('kch-'+kId);const o=bd.classList.toggle('open');if(ch)ch.classList.toggle('open',o);};

/* ── GUIDEBOOK ── */
const CAT_LBL={teknik:'<iconify-icon icon="lucide:swords"></iconify-icon> Teknik',fisik:'<iconify-icon icon="lucide:dumbbell"></iconify-icon> Fisik',mental:'<iconify-icon icon="lucide:brain"></iconify-icon> Mental',taktik:'<iconify-icon icon="lucide:target"></iconify-icon> Taktik',nutrisi:'<iconify-icon icon="lucide:apple"></iconify-icon> Nutrisi',peraturan:'<iconify-icon icon="lucide:scroll-text"></iconify-icon> Peraturan',lainnya:'<iconify-icon icon="lucide:folder"></iconify-icon> Lainnya'};
function renderGuide(id,d){
  const p=document.getElementById('guide-body-'+id);
  const entries=Object.entries(d?.guidebook||{}).sort(([,a],[,b])=>(b.createdAt||0)-(a.createdAt||0));
  const q=(guideSearchState[id]||'').trim().toLowerCase();
  const filtered = entries.filter(([,gb])=>{
    if(!q) return true;
    const title = String(gb?.judul||'').toLowerCase();
    const desc = String(gb?.desc||'').toLowerCase();
    const cat = String(gb?.kategori||'').toLowerCase();
    return title.includes(q) || desc.includes(q) || cat.includes(q);
  });
  if(!entries.length){p.innerHTML=`<div class="panel-empty">${T('noGuide')}</div>`;return;}
  p.innerHTML=`<div class="guide-search-wrap">
      <span class="guide-search-icon"><iconify-icon icon="lucide:search"></iconify-icon></span>
      <input class="guide-search-input" type="text" placeholder="Cari guidebook..." value="${esc(guideSearchState[id]||'')}" oninput="onGuideSearch('${id}', this.value)">
    </div>
    <div class="guide-grid" style="padding:10px">${filtered.map(([,gb])=>{
    const imgU=pickSafeUrl(gb,['imgUrl','imgURL','imageUrl','imageURL','imgAddress','imageAddress','thumbnailUrl','thumbnailURL']);
    const drvU=pickSafeUrl(gb,['driveUrl','driveURL','fileUrl','fileURL','url']);
    const catL=CAT_LBL[gb.kategori]||'';
    return `<div class="guide-card">
      <div class="guide-thumb-wrap">
        ${imgU?`<img class="guide-thumb" src="${imgU}" onerror="this.style.display='none'">`:`<div class="guide-thumb-ph">📚</div>`}
        ${catL?`<div class="guide-cat-tag">${catL}</div>`:''}
      </div>
      <div class="guide-info">
        <div class="guide-title">${esc(gb.judul||'—')}</div>
        ${gb.desc?`<div class="guide-desc">${esc(gb.desc)}</div>`:''}
        ${gb.versi?`<div style="font-family:var(--fm);font-size:9px;color:var(--accent);margin-top:2px">v${esc(gb.versi)}</div>`:''}
      </div>
      ${drvU?`<div class="guide-footer"><a class="guide-btn gb-drive" href="${drvU}" target="_blank" rel="noopener"><iconify-icon icon="lucide:folder-open"></iconify-icon> ${T('openFile')}</a></div>`:''}
    </div>`;
  }).join('')}</div>
  ${filtered.length?'':`<div class="panel-empty" style="padding-top:0">Tidak ada hasil</div>`}`;
}
window.onGuideSearch=function(id,val){
  guideSearchState[id]=val||'';
  const d=allCoaches[id];
  if(d) renderGuide(id,d);
};

/* ══════════════════════════════════════════════════════
   ATHLETES — NEW DESIGN
══════════════════════════════════════════════════════ */
function renderAthletes(id,d){
  const pane=document.getElementById('athletes-body-'+id);
  const mapByUnit=d?.atletPerUnit||{};
  const baseUnits=Array.isArray(d.unit)?d.unit:[];
  const dataUnits=Object.keys(mapByUnit).map(unitLabel);
  const units=[...new Set([...baseUnits,...dataUnits])].filter(Boolean);
  if(!units.length){pane.innerHTML=`<div class="ath-wrap"><div class="panel-empty">${T('athletesUnit')} — 0</div></div>`;return;}
  pane.innerHTML=`<div class="ath-wrap">${units.map((u,ui)=>{
    const uKey=unitKey(u);
    const athletes=Object.entries(mapByUnit[uKey]||{}).sort(([,a],[,b])=>(b.createdAt||0)-(a.createdAt||0));
    const st=getState(id,uKey);
    const q=st.searchQ||'';
    const filtered=athletes.filter(([,a])=>!q||String(a?.nama||'').toLowerCase().includes(q.toLowerCase())||String(a?.kategori||'').toLowerCase().includes(q.toLowerCase()));
    const icons=['<iconify-icon icon="lucide:shield"></iconify-icon>','<iconify-icon icon="lucide:swords"></iconify-icon>','<iconify-icon icon="lucide:target"></iconify-icon>','<iconify-icon icon="lucide:award"></iconify-icon>','<iconify-icon icon="lucide:trophy"></iconify-icon>','<iconify-icon icon="lucide:dumbbell"></iconify-icon>','<iconify-icon icon="lucide:star"></iconify-icon>'];
    const icon=icons[ui%icons.length];
    const unitIconUrl=safeUrl(d?.unitMeta?.[uKey]?.iconUrl||'');
    const attendanceByUnit=(d?.absensiUnit||{})[uKey]||{};
    const meetings=Object.entries(attendanceByUnit).sort(([,a],[,b])=>String(b.tanggal||'').localeCompare(String(a.tanggal||''))).slice(0,8);
    const todayDate=new Date().toISOString().slice(0,10);
    const selectedDate=st.absDate||todayDate;
    const selectedMeeting=attendanceByUnit[selectedDate]||{};
    const selectedRecords=selectedMeeting.records||{};
    return `<div class="unit-section">
      <div class="unit-hd">
        <div class="unit-hd-left">
          <div class="unit-icon" title="${esc(T('unitIconClickTitle'))}" onclick="toggleUnitIconAction('${id}','${uKey}')">${unitIconUrl?`<img src="${unitIconUrl}" alt="${esc(T('unitIconAlt'))}" onerror="this.style.display='none';this.parentNode.innerHTML='${icon}'">`:icon}</div>
          <div>
            <div class="unit-name">${esc(u)}</div>
            <div class="unit-count">${athletes.length} ${T('athleteUnit')}</div>
          </div>
        </div>
        <div class="unit-hd-right">
          ${st.showUnitDetail?`${st.showUnitIconAction?`<button class="btn-sm btn-sm-ghost unit-icon-action" onclick="setUnitIconUrl('${id}','${uKey}')"><iconify-icon icon="lucide:image-up"></iconify-icon> ${esc(T('changeIcon'))}</button>`:''}
          <button class="btn-sm ${st.showAbs?'btn-sm-ghost':'btn-sm-teal'}" onclick="toggleAbsUnit('${id}','${uKey}')">${st.showAbs?T('hideAttendance'):T('weeklyAttendance')}</button>
          <button class="btn-sm icon-only ${st.showForm?'btn-sm-ghost':'btn-sm-accent'}" onclick="toggleFormUnit('${id}','${uKey}')" title="${esc(st.showForm&&!st.editId?T('hideForm'):T('addAthlete'))}" aria-label="${esc(st.showForm&&!st.editId?T('hideForm'):T('addAthlete'))}"><iconify-icon icon="${st.showForm&&!st.editId?'lucide:x':'lucide:plus'}"></iconify-icon></button>
          <button type="button" class="btn-sm btn-sm-ghost icon-only" onclick="toggleUnitDetail('${id}','${uKey}')" title="${esc(T('unitHideDetail'))}" aria-label="${esc(T('unitHideDetail'))}"><iconify-icon icon="lucide:chevron-up"></iconify-icon></button>`:`<button type="button" class="btn-sm btn-sm-accent" onclick="toggleUnitDetail('${id}','${uKey}')">${T('detail')}</button>`}
        </div>
      </div>

      ${st.showUnitDetail?`${st.showForm?`<div class="ath-form-wrap">
        <div class="ath-form-title">${st.editId?T('edit'):T('addAthlete')}</div>
        <div class="ath-form-grid">
          <div class="af-group span2">
            <label class="af-lbl">Nama Atlet *</label>
            <input class="af-input" id="af-nm-${id}-${uKey}" type="text" placeholder="Nama lengkap atlet" value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.nama||''):'')}" autocomplete="off">
          </div>
          <div class="af-group">
            <label class="af-lbl">${T('category')} *</label>
            <select class="af-select" id="af-cat-${id}-${uKey}">
              <option value="">— Pilih —</option>
              ${['tanding','jurus','ibing','ganda','regu','solo kreatif'].map(c=>`<option value="${c}" ${(st.editId?(mapByUnit[uKey]?.[st.editId]?.kategori||''):'')===c?'selected':''}>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
            </select>
          </div>
          <div class="af-group">
            <label class="af-lbl">${T('dob')} *</label>
            <input class="af-input" id="af-dob-${id}-${uKey}" type="date" value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.tglLahir||''):'')}" >
          </div>
          <div class="af-group">
            <label class="af-lbl">${T('height')}</label>
            <input class="af-input" id="af-h-${id}-${uKey}" type="number" min="50" max="250" placeholder="170" value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.tinggiBadan||''):'')}" >
          </div>
          <div class="af-group">
            <label class="af-lbl">${T('weight')}</label>
            <input class="af-input" id="af-w-${id}-${uKey}" type="number" min="10" max="300" placeholder="65" value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.beratBadan||''):'')}" >
          </div>
          <div class="af-group">
            <label class="af-lbl">${T('belt')}</label>
            <input class="af-input" id="af-belt-${id}-${uKey}" type="text" placeholder="Merah" value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.sabuk||''):'')}" >
          </div>
          <div class="af-group span2">
            <label class="af-lbl">${T('notes_short')}</label>
            <input class="af-input" id="af-note-${id}-${uKey}" type="text" placeholder="Catatan singkat..." value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.catatan||''):'')}" >
          </div>
          <div class="af-group span2">
            <label class="af-lbl">URL Icon Atlet</label>
            <input class="af-input" id="af-icon-${id}-${uKey}" type="url" placeholder="https://.../foto-atlet.png" value="${esc(st.editId?(mapByUnit[uKey]?.[st.editId]?.iconUrl||''):'')}" >
          </div>
        </div>
        <div class="ath-form-actions">
          ${st.editId?`<button class="btn-sm btn-sm-ghost" onclick="cancelEditUnit('${id}','${uKey}')">${T('cancel')}</button>`:''}
          <button class="btn-sm btn-sm-accent" onclick="saveAthleteUnit('${id}','${uKey}')">${T('save')}</button>
        </div>
      </div>`:''}

      ${st.showAbs?`<div class="abs-section">
        <div class="abs-header">
          <div class="abs-title"><iconify-icon icon="lucide:calendar-check-2"></iconify-icon> ${T('weeklyAttendance')}</div>
        </div>
        <div class="abs-date-picker">
          <span class="abs-date-lbl">Tanggal:</span>
          <input class="abs-date-input" id="absDate-${id}-${uKey}" type="date" value="${esc(selectedDate)}" onchange="updateAbsDate('${id}','${uKey}',this.value)">
          <input class="abs-note-input" id="absNote-${id}-${uKey}" type="text" placeholder="${T('attNote')} (${T('optional')})" value="${esc(st.absNote||(attendanceByUnit[selectedDate]?.catatan||''))}" >
          <button class="btn-sm btn-sm-accent" onclick="saveAbsensi('${id}','${uKey}')">${T('save')}</button>
        </div>
        <div class="abs-list">
          ${athletes.length?athletes.map(([aid,a])=>{
            const st_val=presStatus(selectedRecords[aid]);
            return `<div class="abs-row">
              <div class="abs-row-info">
                <div class="abs-row-nm">${esc(a.nama||'—')}</div>
                <div class="abs-row-meta">${a.kategori?esc(a.kategori):T('category')+' n/a'}${a.sabuk?` · ${T('belt')} ${esc(a.sabuk)}`:''}</div>
              </div>
              <select class="abs-status-sel" id="absSt-${id}-${uKey}-${aid}">
                <option value="hadir" ${st_val==='hadir'?'selected':''}>${T('present')}</option>
                <option value="izin" ${st_val==='izin'?'selected':''}>${T('permit')}</option>
                <option value="sakit" ${st_val==='sakit'?'selected':''}>${T('sick')}</option>
                <option value="alfa" ${st_val==='alfa'?'selected':''}>${T('alpha')}</option>
              </select>
            </div>`;
          }).join(''):`<div class="panel-empty">${T('addAthlete')}</div>`}
        </div>
        ${meetings.length?`<div class="abs-log-title">Riwayat Absensi</div>
        <div class="abs-log-list">${meetings.map(([mKey,m])=>{
          const recs=Object.values(m.records||{});
          const hadir=recs.filter(r=>presStatus(r)==='hadir').length;
          const izinSakit=recs.filter(r=>['izin','sakit'].includes(presStatus(r))).length;
          const alfa=recs.filter(r=>presStatus(r)==='alfa').length;
          return `<div class="abs-log-row">
            <span class="abs-log-date">${esc(m.tanggal||mKey)}</span>
            <div class="abs-log-stats">
              <span class="abs-stat-chip asc-green">H ${hadir}</span>
              <span class="abs-stat-chip asc-amber">I/S ${izinSakit}</span>
              <span class="abs-stat-chip asc-red">A ${alfa}</span>
            </div>
            <button class="abs-det-btn" onclick="openMeetDetail('${id}','${uKey}','${mKey}')">Detail</button>
          </div>`;
        }).join('')}</div>`:''}
      </div>`:''}

      <div class="ath-search-wrap">
        <span class="search-icon"><iconify-icon icon="lucide:search"></iconify-icon></span>
        <input class="ath-search" id="athSearch-${id}-${uKey}" type="text" placeholder="${T('searchPlaceholder')}" value="${esc(q)}" oninput="onSearchUnit('${id}','${uKey}',this.value)">
      </div>

      <div class="unit-body">
        ${filtered.length?`<div class="ath-grid">${filtered.map(([aid,a])=>{
          const ageA=diffYears(a.tglLahir);
          const athIconUrl=safeUrl(a.iconUrl);
          return `<div class="ath-card">
            <div class="ath-card-top">
              <div class="ath-av">${athIconUrl?`<img src="${athIconUrl}" alt="Athlete icon" onerror="this.style.display='none';this.parentNode.textContent='${esc(initials(a.nama)||'?')}'">`:initials(a.nama)||'?'}</div>
              <div class="ath-card-info">
                <div class="ath-nm">${esc(a.nama||'—')}</div>
                <div class="ath-meta-row">
                  ${a.kategori?`<span class="ath-tag ath-tag-cat">${esc(a.kategori)}</span>`:''}
                  ${a.sabuk?`<span class="ath-tag ath-tag-belt"><iconify-icon icon="lucide:shield"></iconify-icon> ${esc(a.sabuk)}</span>`:''}
                  ${ageA!==null?`<span class="ath-tag ath-tag-age">${ageA} thn</span>`:''}
                </div>
              </div>
            </div>
            ${(a.tinggiBadan||a.beratBadan)?`<div class="ath-physical">
              ${a.tinggiBadan?`<div class="ath-phys-item"><span class="ath-phys-lbl">Tinggi</span><span class="ath-phys-val">${esc(a.tinggiBadan)}</span><span class="ath-phys-unit">cm</span></div>`:''}
              ${a.tinggiBadan&&a.beratBadan?`<div class="ath-phys-sep"></div>`:''}
              ${a.beratBadan?`<div class="ath-phys-item"><span class="ath-phys-lbl">Berat</span><span class="ath-phys-val">${esc(a.beratBadan)}</span><span class="ath-phys-unit">kg</span></div>`:''}
            </div>`:''}
            ${a.catatan?`<div class="ath-note">${esc(a.catatan)}</div>`:''}
            <div class="ath-card-actions">
              <button class="btn-sm btn-sm-ghost" onclick="startEditUnit('${id}','${uKey}','${aid}')">${T('edit')}</button>
              <button class="btn-sm btn-sm-danger" onclick="delAthleteUnit('${id}','${uKey}','${aid}')">${T('delete')}</button>
            </div>
          </div>`;
        }).join('')}</div>`:
        `<div class="panel-empty">${q?'Tidak ada hasil':'Belum ada atlet'}</div>`}
      </div>
    `:''}
    </div>`;
  }).join('')}</div>`;
}

/* unit state helpers */
window.toggleUnitDetail=function(cId,uKey){
  const st=getState(cId,uKey);
  st.showUnitDetail=!st.showUnitDetail;
  renderAthletes(cId,allCoaches[cId]);
};
window.toggleFormUnit=function(cId,uKey){
  const st=getState(cId,uKey);
  if(st.showForm&&st.editId){st.editId=null;renderAthletes(cId,allCoaches[cId]);}
  else{
    st.showForm=!st.showForm;
    if(!st.showForm)st.editId=null;
    if(st.showForm)st.showUnitDetail=true;
    renderAthletes(cId,allCoaches[cId]);
  }
};
window.toggleUnitIconAction=function(cId,uKey){
  const st=getState(cId,uKey);
  st.showUnitIconAction=!st.showUnitIconAction;
  if(st.showUnitIconAction)st.showUnitDetail=true;
  renderAthletes(cId,allCoaches[cId]);
};
window.toggleAbsUnit=function(cId,uKey){
  const st=getState(cId,uKey);
  st.showAbs=!st.showAbs;
  if(st.showAbs)st.showUnitDetail=true;
  renderAthletes(cId,allCoaches[cId]);
};
window.onSearchUnit=function(cId,uKey,val){const st=getState(cId,uKey);st.searchQ=val;renderAthletes(cId,allCoaches[cId]);};
window.updateAbsDate=function(cId,uKey,val){const st=getState(cId,uKey);st.absDate=val;renderAthletes(cId,allCoaches[cId]);};
window.startEditUnit=function(cId,uKey,aid){
  const st=getState(cId,uKey);st.showForm=true;st.editId=aid;st.showUnitDetail=true;
  renderAthletes(cId,allCoaches[cId]);
  setTimeout(()=>{const el=document.getElementById(`af-nm-${cId}-${uKey}`);if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}},100);
};
window.cancelEditUnit=function(cId,uKey){const st=getState(cId,uKey);st.editId=null;st.showForm=false;renderAthletes(cId,allCoaches[cId]);};

window.saveAthleteUnit=async function(cId,uKey){
  const st=getState(cId,uKey);
  const g=id=>document.getElementById(id);
  const nama=(g(`af-nm-${cId}-${uKey}`)?.value||'').trim();
  const kat=(g(`af-cat-${cId}-${uKey}`)?.value||'').trim();
  const dob=(g(`af-dob-${cId}-${uKey}`)?.value||'').trim();
  if(!nama){showToast('Nama harus diisi');return;}
  if(!kat){showToast('Kategori harus dipilih');return;}
  if(!dob){showToast('Tanggal lahir harus diisi');return;}
  const iconUrl=(g(`af-icon-${cId}-${uKey}`)?.value||'').trim();
  const payload={nama,kategori:kat,tglLahir:dob,tinggiBadan:(g(`af-h-${cId}-${uKey}`)?.value||'').trim(),beratBadan:(g(`af-w-${cId}-${uKey}`)?.value||'').trim(),sabuk:(g(`af-belt-${cId}-${uKey}`)?.value||'').trim(),catatan:(g(`af-note-${cId}-${uKey}`)?.value||'').trim(),iconUrl:iconUrl?safeUrl(iconUrl):'',createdAt:Date.now()};
  try{
    const isEdit=Boolean(st.editId);
    if(st.editId){
      const cur=allCoaches?.[cId]?.atletPerUnit?.[uKey]?.[st.editId]||{};
      payload.createdAt=cur.createdAt||Date.now();payload.updatedAt=Date.now();
      await db.ref(`pelatih/${cId}/atletPerUnit/${uKey}/${st.editId}`).set(payload);
    }else{
      await db.ref(`pelatih/${cId}/atletPerUnit/${uKey}`).push(payload);
    }
    st.editId=null;st.showForm=false;
    showToast(isEdit?'Data diperbarui':'Atlet ditambahkan');
  }catch(e){showToast('Gagal menyimpan');}
};

window.setUnitIconUrl=async function(cId,uKey){
  const st=getState(cId,uKey);
  st.showUnitIconAction=false;
  unitIconModalCtx={cId,uKey};
  const coach=allCoaches[cId]||{};
  const current=(coach?.unitMeta?.[uKey]?.iconUrl)||'';
  const input=document.getElementById('unitIconUrlInput');
  const err=document.getElementById('unitIconUrlErr');
  if(input) input.value=current;
  if(err) err.textContent='';
  document.getElementById('iconUnitModal').classList.add('show');
};
window.closeUnitIconModal=function(){
  unitIconModalCtx=null;
  const err=document.getElementById('unitIconUrlErr');
  if(err) err.textContent='';
  document.getElementById('iconUnitModal').classList.remove('show');
};
window.saveUnitIconModal=async function(){
  if(!unitIconModalCtx) return;
  const {cId,uKey}=unitIconModalCtx;
  const input=document.getElementById('unitIconUrlInput');
  const err=document.getElementById('unitIconUrlErr');
  const clean=(input?.value||'').trim();
  if(clean && !safeUrl(clean)){
    if(err) err.textContent=T('unitIconUrlErr');
    if(input) input.focus();
    return;
  }
  if(err) err.textContent='';
  try{
    await db.ref(`pelatih/${cId}/unitMeta/${uKey}/iconUrl`).set(clean?safeUrl(clean):'');
    closeUnitIconModal();
    renderAthletes(cId,allCoaches[cId]);
  }catch(e){
    if(err) err.textContent=T('unitIconSaveErr');
  }
};

window.openProfileEditModal=function(cId){
  profileEditCtx=cId;
  const coach=allCoaches[cId]||{};
  const err=document.getElementById('profileEditErr');
  if(err)err.textContent='';
  const g=id=>document.getElementById(id);
  if(g('profileEditKontak'))g('profileEditKontak').value=coach.kontak||'';
  if(g('profileEditEmail'))g('profileEditEmail').value=coach.email||'';
  if(g('profileEditAlamat'))g('profileEditAlamat').value=coach.alamat||'';
  if(g('profileEditIconUrl'))g('profileEditIconUrl').value=String(coach.iconUrl||'').trim();
  document.getElementById('profileEditModal').classList.add('show');
  applyI18N();
};
window.closeProfileEditModal=function(){
  profileEditCtx=null;
  const err=document.getElementById('profileEditErr');
  if(err)err.textContent='';
  document.getElementById('profileEditModal').classList.remove('show');
};
window.saveProfileEditModal=async function(){
  if(!profileEditCtx)return;
  const cId=profileEditCtx;
  const g=id=>document.getElementById(id);
  const kontak=(g('profileEditKontak')?.value||'').trim();
  const email=(g('profileEditEmail')?.value||'').trim();
  const alamat=(g('profileEditAlamat')?.value||'').trim();
  const iconRaw=(g('profileEditIconUrl')?.value||'').trim();
  const err=document.getElementById('profileEditErr');
  let iconForDb='';
  if(iconRaw){
    try{
      const url=new URL(iconRaw);
      if(!['http:','https:'].includes(url.protocol))throw new Error();
      iconForDb=iconRaw.trim();
    }catch(e){
      if(err)err.textContent=T('unitIconUrlErr');
      g('profileEditIconUrl')?.focus();
      return;
    }
  }
  if(err)err.textContent='';
  try{
    await Promise.all([
      db.ref(`pelatih/${cId}/kontak`).set(kontak),
      db.ref(`pelatih/${cId}/email`).set(email),
      db.ref(`pelatih/${cId}/alamat`).set(alamat),
      db.ref(`pelatih/${cId}/iconUrl`).set(iconForDb)
    ]);
    closeProfileEditModal();
    showToast(T('profileUpdated'));
  }catch(e){
    if(err)err.textContent=T('profileSaveErr');
  }
};

window.delAthleteUnit=async function(cId,uKey,aid){
  if(!confirm(`${T('delete')} atlet ini?`))return;
  try{await db.ref(`pelatih/${cId}/atletPerUnit/${uKey}/${aid}`).remove();showToast('Atlet dihapus');}
  catch(e){showToast('Gagal menghapus');}
};

window.saveAbsensi=async function(cId,uKey){
  const coach=allCoaches[cId]||{};
  const athletes=Object.entries((coach.atletPerUnit||{})[uKey]||{});
  if(!athletes.length){showToast('Belum ada atlet');return;}
  const st=getState(cId,uKey);
  const tanggal=(document.getElementById(`absDate-${cId}-${uKey}`)?.value||'').trim();
  const catatan=(document.getElementById(`absNote-${cId}-${uKey}`)?.value||'').trim();
  if(!tanggal){showToast('Pilih tanggal');return;}
  const records={};
  athletes.forEach(([aid,a])=>{
    const sel=document.getElementById(`absSt-${cId}-${uKey}-${aid}`);
    const status=(sel?.value||'alfa').toLowerCase();
    records[aid]={nama:a.nama||'',kategori:a.kategori||'',sabuk:a.sabuk||'',status:['hadir','izin','sakit','alfa'].includes(status)?status:'alfa'};
  });
  try{
    await db.ref(`pelatih/${cId}/absensiUnit/${uKey}/${tanggal}`).set({tanggal,lokasi:'Sekolah',catatan:catatan||'',records,updatedAt:Date.now()});
    st.absDate=tanggal;
    showToast('Absensi disimpan');
  }catch(e){showToast('Gagal menyimpan');}
};

window.openMeetDetail=function(cId,uKey,tanggal){
  meetDetailCtx={cId,uKey,tanggal};
  document.getElementById('meetModal').classList.add('show');
  renderMeetDetail();
};
window.closeMeetDetail=function(){meetDetailCtx=null;document.getElementById('meetModal').classList.remove('show');};

function renderMeetDetail(){
  if(!meetDetailCtx)return;
  const{cId,uKey,tanggal}=meetDetailCtx;
  const coach=allCoaches[cId]||{};
  const unitName=unitLabel(uKey);
  const meeting=(((coach.absensiUnit||{})[uKey]||{})[tanggal])||{};
  const recs=Object.values(meeting.records||{});
  const hadir=recs.filter(r=>presStatus(r)==='hadir');
  const izinSakit=recs.filter(r=>['izin','sakit'].includes(presStatus(r)));
  const alfa=recs.filter(r=>presStatus(r)==='alfa');
  document.getElementById('meetModalTitle').textContent=`${T('meetDetail')} — ${tanggal} · ${unitName}`;
  document.getElementById('meetModalBody').innerHTML=`
    ${meeting.catatan?`<div style="font-size:13px;color:var(--t2);margin-bottom:12px;padding:9px 12px;background:var(--bg-raised);border-radius:8px;border-left:2px solid var(--accent)"><iconify-icon icon="lucide:notebook-pen"></iconify-icon> ${esc(meeting.catatan)}</div>`:''}
    <div class="meet-grid">
      <div class="meet-col">
        <div class="meet-col-hd" style="color:var(--green)">Hadir (${hadir.length})</div>
        <div class="meet-col-list">${hadir.length?hadir.map(r=>`<div class="meet-item">${esc(r.nama||'—')}</div>`).join(''):`<div class="panel-empty">${T('noData')}</div>`}</div>
      </div>
      <div class="meet-col">
        <div class="meet-col-hd" style="color:var(--accent)">Izin / Sakit (${izinSakit.length})</div>
        <div class="meet-col-list">${izinSakit.length?izinSakit.map(r=>`<div class="meet-item">${esc(r.nama||'—')} <span style="color:var(--t3);font-size:10px">(${presStatus(r)==='izin'?T('permit'):T('sick')})</span></div>`).join(''):`<div class="panel-empty">${T('noData')}</div>`}</div>
      </div>
      <div class="meet-col">
        <div class="meet-col-hd" style="color:var(--red)">Alfa (${alfa.length})</div>
        <div class="meet-col-list">${alfa.length?alfa.map(r=>`<div class="meet-item">${esc(r.nama||'—')}</div>`).join(''):`<div class="panel-empty">${T('noData')}</div>`}</div>
      </div>
    </div>
  `;
}