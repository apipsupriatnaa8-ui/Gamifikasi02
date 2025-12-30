/* ------------------------------------------------------------
   PelangiBelajar - app.js
   Game untuk: Membaca, Menulis, Menyimak, Berbicara
------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);
const elHome = $("#screen-home");
const elGame = $("#screen-game");
const elScore = $("#screen-score");
const gameArea = $("#game-area");

const btnInstall = $("#btn-install");
const btnSound = $("#btn-sound");
const btnHelp = $("#btn-help");
const modalHelp = $("#modal-help");
const btnCloseHelp = $("#btn-close-help");

const btnBack = $("#btn-back");
const btnBack2 = $("#btn-back2");
const btnNext = $("#btn-next");
const btnSkip = $("#btn-skip");

const inpNama = $("#nama");
const selKelas = $("#kelas");

const metaPlayer = $("#meta-player");
const metaClass = $("#meta-class");
const metaRound = $("#meta-round");
const gameName = $("#game-name");
const scoreNow = $("#score-now");

const btnLihatSkor = $("#btn-lihat-skor");
const btnReset = $("#btn-reset");
const btnRefresh = $("#btn-refresh");
const btnClearScores = $("#btn-clear-scores");

const toast = $("#toast");
let toastTimer = null;

// ------------ state ------------
const STATE = {
  player: { name: "", kelas: "1" },
  mode: null,         // membaca | menulis | menyimak | berbicara
  round: 1,
  totalRounds: 5,
  score: 0,
  current: null,      // current question
  soundOn: true,
  allowServer: false,  // use PHP API if available
};

const STORAGE_KEY = "pelangibelajar_scores_v1";
const SOUND_KEY = "pelangibelajar_sound_v1";

// ------------ content bank ------------
/**
 * Data disusun per kelas.
 * Tiap item: {word, sentence, choices, correctIndex}
 */
const BANK = {
  "1": {
    membaca: [
      { word:"BOLA", sentence:"Aku bermain ____.", choices:["BOLA","BUKU","IKAN","MEJA"], correctIndex:0 },
      { word:"SUSU", sentence:"Aku minum ____.", choices:["SAPI","SUSU","SABUN","SENDOK"], correctIndex:1 },
      { word:"KUCING", sentence:"____ suka mengeong.", choices:["KUCING","KAPAL","JERUK","KURSI"], correctIndex:0 },
      { word:"MATA", sentence:"Aku melihat dengan ____.", choices:["MATA","TANGAN","KAKI","TOPI"], correctIndex:0 },
      { word:"ROTI", sentence:"Ibu membeli ____.", choices:["ROTI","BEBEK","KACA","KERTAS"], correctIndex:0 },
      { word:"HUJAN", sentence:"Hari ini ____.", choices:["HUJAN","MUSIM","PENSIL","LAMPU"], correctIndex:0 },
      { word:"BUKU", sentence:"Aku membaca ____.", choices:["RUMAH","BUKU","AIR","TIKAR"], correctIndex:1 },
    ],
    menulis: [
      { target:"sapu", clue:"Alat untuk membersihkan lantai." },
      { target:"padi", clue:"Tanaman yang jadi nasi." },
      { target:"mata", clue:"Untuk melihat." },
      { target:"ikan", clue:"Hewan yang hidup di air." },
      { target:"buku", clue:"Untuk membaca." },
      { target:"roti", clue:"Makanan dari tepung." },
      { target:"susu", clue:"Minuman bergizi." },
    ],
    menyimak: [
      { say:"kucing", choices:["kucing","kursi","kunci","kupu-kupu"], correctIndex:0 },
      { say:"bola", choices:["bulu","bola","boba","bora"], correctIndex:1 },
      { say:"pagi", choices:["pagi","bagi","pergi","paku"], correctIndex:0 },
      { say:"rumah", choices:["rumah","rubah","ramah","rumput"], correctIndex:0 },
      { say:"sapu", choices:["sapi","sapu","saku","satu"], correctIndex:1 },
    ],
    berbicara: [
      { say:"halo" },
      { say:"selamat pagi" },
      { say:"aku bisa" },
      { say:"terima kasih" },
      { say:"ayo belajar" },
    ],
  },
  "2": {
    membaca: [
      { word:"MENANAM", sentence:"Ayah ____ pohon.", choices:["MENANAM","MENYALAM","MENYANYI","MENANGIS"], correctIndex:0 },
      { word:"SEPEDA", sentence:"Aku pergi naik ____.", choices:["SEPEDA","SEMPUT","SEMPIL","SEPELE"], correctIndex:0 },
      { word:"BERSIH", sentence:"Kamar harus ____.", choices:["BERANI","BERSIH","BERBISA","BERARAH"], correctIndex:1 },
      { word:"PANTAI", sentence:"Kami bermain di ____.", choices:["PANTAI","PINTAR","PANTUN","PANTUN"], correctIndex:0 },
      { word:"KERAJINAN", sentence:"Aku membuat ____ dari kertas.", choices:["KERAJINAN","KERANJING","KERANJANG","KERANJINGAN"], correctIndex:0 },
    ],
    menulis: [
      { target:"pelangi", clue:"Muncul setelah hujan, warnanya banyak." },
      { target:"bermain", clue:"Kegiatan menyenangkan bersama teman." },
      { target:"sehat", clue:"Keadaan tubuh yang baik." },
      { target:"membaca", clue:"Kegiatan melihat dan memahami tulisan." },
      { target:"menulis", clue:"Kegiatan membuat huruf atau kata." },
    ],
    menyimak: [
      { say:"sekolah", choices:["sekola","sekolah","sekulah","sekolab"], correctIndex:1 },
      { say:"pintar", choices:["pintar","pintur","pintet","pinter"], correctIndex:0 },
      { say:"cerita", choices:["cari","cerita","cinta","cermin"], correctIndex:1 },
      { say:"belajar", choices:["belajar","belanja","belajarh","belajar"], correctIndex:0 },
      { say:"teman", choices:["taman","teman","toman","timan"], correctIndex:1 },
    ],
    berbicara: [
      { say:"nama saya" },
      { say:"saya suka membaca" },
      { say:"tolong bantu saya" },
      { say:"maaf ya" },
      { say:"sampai jumpa" },
    ],
  },
  "3": {
    membaca: [
      { word:"MENGHEMAT", sentence:"Kita harus ____ listrik.", choices:["MENGHEMAT","MENGHILANG","MENGHITUNG","MENGHIBUR"], correctIndex:0 },
      { word:"PERPUSTAKAAN", sentence:"Aku meminjam buku di ____.", choices:["PERPUSTAKAAN","PERISTIWA","PERATURAN","PERWALIAN"], correctIndex:0 },
      { word:"KEJUJURAN", sentence:"Sikap baik itu ____.", choices:["KEJUJURAN","KEJURUSAN","KEJURUTAN","KEJULUSAN"], correctIndex:0 },
      { word:"MENJAGA", sentence:"Kita harus ____ kebersihan.", choices:["MENJAGA","MENJAGAAN","MENJAGAK","MENJAGAI"], correctIndex:0 },
      { word:"KREATIF", sentence:"Anak ____ punya banyak ide.", choices:["KREATIF","KRELATIF","KREASIF","KRESITIF"], correctIndex:0 },
    ],
    menulis: [
      { target:"lingkungan", clue:"Tempat di sekitar kita, harus dijaga." },
      { target:"kebersihan", clue:"Keadaan yang rapi dan tidak kotor." },
      { target:"percaya diri", clue:"Berani tampil tanpa takut." },
      { target:"bertanggung jawab", clue:"Melakukan tugas dengan sungguh-sungguh." },
      { target:"membantu", clue:"Menolong orang lain." },
    ],
    menyimak: [
      { say:"perpustakaan", choices:["perpustakaan","perpustakan","perpusatakaan","perpustakaa"], correctIndex:0 },
      { say:"kebersihan", choices:["kebersihan","kebersihan", "kebersian","kebersihan"], correctIndex:0 },
      { say:"percaya diri", choices:["percaya diri","percaya diri","percaya diri", "percaya diri"], correctIndex:0 },
      { say:"tanggung jawab", choices:["tanggung jawab","tangung jawab","tanggung jawap","tanggug jawab"], correctIndex:0 },
      { say:"kreatif", choices:["kreatif","kreatip","kreatif", "kreafit"], correctIndex:0 },
    ],
    berbicara: [
      { say:"saya bisa membaca dengan lancar" },
      { say:"saya akan menjaga kebersihan" },
      { say:"saya ingin menjadi anak jujur" },
      { say:"tolong, saya butuh bantuan" },
      { say:"hari ini saya belajar dengan semangat" },
    ],
  }
};

// ------------ helpers ------------
function showToast(msg){
  toast.hidden = false;
  toast.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ toast.hidden = true; }, 2400);
}

function normalizeText(s){
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ""); // keep letters/numbers/spaces/-/'
}

function getPlayer(){
  const name = (inpNama.value || "").trim();
  const kelas = selKelas.value;
  return {
    name: name.length ? name : "Pemain",
    kelas
  };
}

function randPick(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function canUseServer(){ return false; }

// ------------ sound (TTS) ------------
function speak(text){
  if(!STATE.soundOn) return;
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 0.95;
    u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(e){
    // ignore
  }
}

function loadSoundSetting(){
  const v = localStorage.getItem(SOUND_KEY);
  if(v === "off"){
    STATE.soundOn = false;
    btnSound.textContent = "🔇 Suara";
  }else{
    STATE.soundOn = true;
    btnSound.textContent = "🔊 Suara";
  }
}
function toggleSound(){
  STATE.soundOn = !STATE.soundOn;
  localStorage.setItem(SOUND_KEY, STATE.soundOn ? "on":"off");
  btnSound.textContent = STATE.soundOn ? "🔊 Suara" : "🔇 Suara";
  showToast(STATE.soundOn ? "Suara ON" : "Suara OFF");
}

// ------------ navigation ------------
function gotoHome(){
  elHome.hidden = false;
  elGame.hidden = true;
  elScore.hidden = true;
}

function gotoGame(){
  elHome.hidden = true;
  elGame.hidden = false;
  elScore.hidden = true;
}

function gotoScore(){
  elHome.hidden = true;
  elGame.hidden = true;
  elScore.hidden = false;
}

function updateMeta(){
  metaPlayer.textContent = `Pemain: ${STATE.player.name}`;
  metaClass.textContent = `Kelas: ${STATE.player.kelas}`;
  metaRound.textContent = `Ronde: ${STATE.round}/${STATE.totalRounds}`;
  scoreNow.textContent = `${STATE.score}`;
}

// ------------ confetti ------------
function confettiBoom(){
  const c = document.createElement("canvas");
  c.className = "confetti";
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  function resize(){
    c.width = Math.floor(window.innerWidth*dpr);
    c.height = Math.floor(window.innerHeight*dpr);
    c.style.width = window.innerWidth+"px";
    c.style.height = window.innerHeight+"px";
  }
  resize();
  window.addEventListener("resize", resize, {once:true});

  const pieces = Array.from({length: 120}, (_,i)=>({
    x: Math.random()*c.width,
    y: -Math.random()*c.height*0.4,
    r: 4 + Math.random()*8,
    vy: 2 + Math.random()*4,
    vx: -2 + Math.random()*4,
    a: Math.random()*Math.PI*2,
    va: -0.08 + Math.random()*0.16,
    life: 240 + Math.random()*120
  }));

  let t=0;
  function draw(){
    t++;
    ctx.clearRect(0,0,c.width,c.height);
    for(const p of pieces){
      p.x += p.vx*dpr;
      p.y += p.vy*dpr;
      p.a += p.va;
      p.vy += 0.02*dpr;

      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = Math.max(0, (p.life - t)/p.life);
      ctx.fillStyle = `hsla(${(t*2 + p.x)%360}, 90%, 60%, 0.95)`;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.6);
      ctx.restore();
    }
    if(t < 260){
      requestAnimationFrame(draw);
    }else{
      c.remove();
    }
  }
  draw();
}

// ------------ scoring persistence ------------
function loadLocalScores(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{ return []; }
}
function saveLocalScores(scores){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

async function saveScoreRecord(rec){
  // Try server first
  if(canUseServer()){
    try{
      const res = await fetch("api/save_score.php", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(rec)
      });
      const data = await res.json();
      if(data && data.ok){
        return {where:"server"};
      }
      // If server says no, fallback
    }catch(e){
      // fallback
    }
  }
  // local fallback
  const list = loadLocalScores();
  list.push(rec);
  saveLocalScores(list);
  return {where:"local"};
}

async function fetchScores(){
  // Try server first
  if(canUseServer()){
    try{
      const res = await fetch("api/get_scores.php");
      const data = await res.json();
      if(data && data.ok && Array.isArray(data.scores)){
        return {where:"server", scores:data.scores};
      }
    }catch(e){
      // fallback
    }
  }
  return {where:"local", scores: loadLocalScores()};
}

function renderScores(scores){
  const tbody = $("#tbl-scores tbody");
  tbody.innerHTML = "";
  const sorted = [...scores].sort((a,b)=> (b.score||0) - (a.score||0));
  sorted.slice(0, 50).forEach((s, idx)=>{
    const tr = document.createElement("tr");
    const dt = new Date(s.time || Date.now());
    const timeStr = dt.toLocaleString("id-ID", {dateStyle:"medium", timeStyle:"short"});
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td>${escapeHtml(s.name || "-")}</td>
      <td>${escapeHtml(String(s.kelas || "-"))}</td>
      <td>${escapeHtml(String(s.mode || "-"))}</td>
      <td>${escapeHtml(String(s.score ?? 0))}</td>
      <td>${escapeHtml(timeStr)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

// ------------ game engine ------------
function startMode(mode){
  STATE.player = getPlayer();
  STATE.mode = mode;
  STATE.round = 1;
  STATE.score = 0;
  updateMeta();

  const titleMap = {
    membaca: "📚 Membaca",
    menulis: "✍️ Menulis",
    menyimak: "👂 Menyimak",
    berbicara: "🗣️ Berbicara"
  };
  gameName.textContent = titleMap[mode] || "Game";

  gotoGame();
  buildQuestion();
}

function buildQuestion(){
  updateMeta();
  const kelas = STATE.player.kelas;
  const mode = STATE.mode;

  if(mode === "membaca"){
    const item = randPick(BANK[kelas].membaca);
    const q = {
      type:"choice",
      title:"Baca kalimat ini!",
      sub:"Pilih kata yang tepat untuk mengisi bagian kosong (____).",
      prompt:item.sentence,
      choices:item.choices,
      correctIndex:item.correctIndex,
      speakText: item.sentence.replace("____", item.choices[item.correctIndex])
    };
    STATE.current = q;
    renderChoiceQuestion(q, {showBigWord:false});
    speak("Bacalah kalimat. Pilih jawaban yang benar.");
  }

  if(mode === "menulis"){
    const item = randPick(BANK[kelas].menulis);
    const q = {
      type:"input",
      title:"Tulis kata yang benar!",
      sub:"Ketik jawaban di kotak. Gunakan huruf kecil/kata lengkap.",
      big:item.target,
      clue:item.clue,
      correct: item.target
    };
    STATE.current = q;
    renderInputQuestion(q);
    speak("Ketik jawaban yang benar.");
  }

  if(mode === "menyimak"){
    const item = randPick(BANK[kelas].menyimak);
    const q = {
      type:"listen",
      title:"Dengarkan kata!",
      sub:"Tekan tombol Dengar, lalu pilih kata yang kamu dengar.",
      say:item.say,
      choices:item.choices,
      correctIndex:item.correctIndex
    };
    STATE.current = q;
    renderListenQuestion(q);
    speak("Tekan dengar. Pilih jawaban yang benar.");
  }

  if(mode === "berbicara"){
    const item = randPick(BANK[kelas].berbicara);
    const q = {
      type:"speak",
      title:"Ucapkan kata/kalimat!",
      sub:"Tekan mikrofon lalu ucapkan dengan jelas.",
      say:item.say
    };
    STATE.current = q;
    renderSpeakQuestion(q);
    speak("Ayo ucapkan kalimat.");
  }
}

function addScore(delta){
  STATE.score += delta;
  if(STATE.score < 0) STATE.score = 0;
  scoreNow.textContent = `${STATE.score}`;
}

// ------------ renderers ------------
function renderChoiceQuestion(q){
  gameArea.innerHTML = `
    <div class="q">
      <div>
        <div class="q-title">${escapeHtml(q.title)}</div>
        <div class="q-sub">${escapeHtml(q.sub)}</div>
      </div>

      <div class="prompt">
        <div class="big-word">${escapeHtml(q.prompt)}</div>
        <div class="small">Sentuh jawaban yang benar.</div>
      </div>

      <div class="choices"></div>

      <div class="row gap">
        <span class="pill">⭐ Benar: +20</span>
        <span class="pill">⚡ Salah: -5</span>
      </div>
    </div>
  `;

  const elChoices = gameArea.querySelector(".choices");
  q.choices.forEach((c, idx)=>{
    const b = document.createElement("button");
    b.className = "choice";
    b.innerHTML = `<span>${escapeHtml(c)}</span><span class="badge">Pilih</span>`;
    b.addEventListener("click", ()=>{
      const ok = idx === q.correctIndex;
      markChoice(b, ok);
      if(ok){
        addScore(20);
        speak("Hebat! Jawaban benar.");
        confettiBoom();
        showToast("✅ Benar! +20");
      }else{
        addScore(-5);
        speak("Belum tepat. Coba lagi ya.");
        b.querySelector(".badge").classList.add("wrong");
        b.querySelector(".badge").textContent = "Salah";
        showToast("❌ Salah -5");
      }
    }, {once:true});
    elChoices.appendChild(b);
  });
}

function markChoice(btn, ok){
  const badge = btn.querySelector(".badge");
  if(ok){
    badge.textContent = "Benar!";
    badge.classList.remove("wrong");
  }else{
    badge.textContent = "Salah";
    badge.classList.add("wrong");
  }
}

function renderInputQuestion(q){
  gameArea.innerHTML = `
    <div class="q">
      <div>
        <div class="q-title">${escapeHtml(q.title)}</div>
        <div class="q-sub">${escapeHtml(q.sub)}</div>
      </div>

      <div class="prompt">
        <div class="big-word">🔎 Petunjuk</div>
        <div class="small">${escapeHtml(q.clue)}</div>
      </div>

      <div class="input-row">
        <input id="answer" type="text" placeholder="ketik jawaban di sini..." autocomplete="off" />
        <button class="btn primary" id="btn-check">Cek</button>
      </div>

      <div class="row gap">
        <span class="pill">⭐ Benar: +25</span>
        <span class="pill">⚡ Salah: -5</span>
        <span class="pill">🎯 Target: <b>${escapeHtml(q.correct)}</b></span>
      </div>

      <div id="feedback" class="q-sub" style="font-size:14px;"></div>
    </div>
  `;

  const input = $("#answer");
  const btnCheck = $("#btn-check");
  const fb = $("#feedback");

  btnCheck.addEventListener("click", ()=>{
    const val = normalizeText(input.value);
    const target = normalizeText(q.correct);
    if(!val){
      showToast("Isi dulu ya ✍️");
      input.focus();
      return;
    }
    if(val === target){
      addScore(25);
      fb.innerHTML = `<span class="badge">Benar!</span> Kamu menulis dengan tepat.`;
      speak("Hebat! Tulisanmu benar.");
      confettiBoom();
      showToast("✅ Benar! +25");
    }else{
      addScore(-5);
      fb.innerHTML = `<span class="badge wrong">Belum</span> Coba lagi. Petunjuk: ${escapeHtml(q.clue)}`;
      speak("Belum tepat. Coba lagi ya.");
      showToast("❌ Salah -5");
      input.focus();
    }
  });

  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter") btnCheck.click();
  });
}

function renderListenQuestion(q){
  const choices = q.choices.map((c,i)=>({c,i}));
  const mixed = shuffle(choices);

  gameArea.innerHTML = `
    <div class="q">
      <div>
        <div class="q-title">${escapeHtml(q.title)}</div>
        <div class="q-sub">${escapeHtml(q.sub)}</div>
      </div>

      <div class="row gap" style="align-items:center;">
        <button class="btn primary" id="btn-listen">🔊 Dengar</button>
        <span class="pill">Ulangi boleh 3x</span>
      </div>

      <div class="choices"></div>

      <div class="row gap">
        <span class="pill">⭐ Benar: +20</span>
        <span class="pill">⚡ Salah: -5</span>
      </div>
    </div>
  `;

  let plays = 0;
  $("#btn-listen").addEventListener("click", ()=>{
    plays++;
    speak(q.say);
    showToast(`🔊 "${q.say}"`);
    if(plays >= 3){
      $("#btn-listen").disabled = true;
      $("#btn-listen").textContent = "🔊 Sudah 3x";
    }
  });

  const elChoices = gameArea.querySelector(".choices");
  mixed.forEach(({c,i})=>{
    const b = document.createElement("button");
    b.className = "choice";
    b.innerHTML = `<span>${escapeHtml(c)}</span><span class="badge">Pilih</span>`;
    b.addEventListener("click", ()=>{
      const ok = i === q.correctIndex;
      markChoice(b, ok);
      if(ok){
        addScore(20);
        speak("Mantap! Kamu menyimak dengan baik.");
        confettiBoom();
        showToast("✅ Benar! +20");
      }else{
        addScore(-5);
        speak("Belum tepat. Coba dengar lagi ya.");
        b.querySelector(".badge").classList.add("wrong");
        b.querySelector(".badge").textContent = "Salah";
        showToast("❌ Salah -5");
      }
    }, {once:true});
    elChoices.appendChild(b);
  });
}

function renderSpeakQuestion(q){
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRec;

  gameArea.innerHTML = `
    <div class="q">
      <div>
        <div class="q-title">${escapeHtml(q.title)}</div>
        <div class="q-sub">${escapeHtml(q.sub)}</div>
      </div>

      <div class="prompt">
        <div class="big-word">${escapeHtml(q.say)}</div>
        <div class="small">Tekan mikrofon lalu ucapkan persis seperti di atas.</div>
      </div>

      <div class="row gap" style="align-items:center;">
        <button class="mic ${supported ? "" : "off"}" id="btn-mic" title="Mulai rekam">${supported ? "🎤" : "⛔"}</button>
        <button class="btn" id="btn-hear">🔊 Contoh</button>
        <span class="pill" id="support-pill">${supported ? "Browser mendukung mikrofon" : "Browser belum mendukung"}</span>
      </div>

      <div id="result" class="prompt" style="display:none;">
        <div class="q-sub">Hasil yang ditangkap:</div>
        <div class="big-word" id="heard"></div>
        <div class="small" id="judge"></div>
      </div>

      <div class="row gap">
        <span class="pill">⭐ Tepat: +30</span>
        <span class="pill">⚡ Belum: -5</span>
      </div>
    </div>
  `;

  $("#btn-hear").addEventListener("click", ()=> speak(q.say));

  const resultBox = $("#result");
  const heardEl = $("#heard");
  const judgeEl = $("#judge");
  const btnMic = $("#btn-mic");

  if(!supported){
    btnMic.disabled = true;
    judgeEl.textContent = "Gunakan Chrome Android atau browser yang mendukung Speech Recognition.";
    return;
  }

  const rec = new SpeechRec();
  rec.lang = "id-ID";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  btnMic.addEventListener("click", ()=>{
    try{
      showToast("🎙️ Mendengarkan...");
      speak("Silakan ucapkan sekarang.");
      rec.start();
    }catch(e){
      showToast("Gagal memulai mikrofon. Coba lagi.");
    }
  });

  rec.onresult = (ev)=>{
    const text = ev.results[0][0].transcript || "";
    const heard = normalizeText(text);
    const target = normalizeText(q.say);
    resultBox.style.display = "block";
    heardEl.textContent = text;

    // cocokkan longgar: target harus menjadi substring atau similarity sederhana
    const ok = heard === target || heard.includes(target) || target.includes(heard);

    if(ok){
      addScore(30);
      judgeEl.innerHTML = `<span class="badge">Mantap!</span> Ucapanmu tepat.`;
      confettiBoom();
      showToast("✅ Tepat! +30");
      speak("Mantap! Ucapanmu tepat.");
    }else{
      addScore(-5);
      judgeEl.innerHTML = `<span class="badge wrong">Coba lagi</span> Ucapkan: <b>${escapeHtml(q.say)}</b>`;
      showToast("❌ Belum -5");
      speak("Belum tepat. Coba lagi ya.");
    }
  };

  rec.onerror = (ev)=>{
    showToast("Izin mikrofon ditolak atau error. Coba cek pengaturan.");
  };
}

// ------------ progress ------------
async function finishIfNeeded(){
  if(STATE.round > STATE.totalRounds){
    // Save score
    const rec = {
      name: STATE.player.name,
      kelas: STATE.player.kelas,
      mode: STATE.mode,
      score: STATE.score,
      time: Date.now()
    };
    const saved = await saveScoreRecord(rec);
    showToast(saved.where === "server" ? "Skor tersimpan (server) ✅" : "Skor tersimpan (lokal) ✅");
    confettiBoom();
    speak("Selamat! Kamu menyelesaikan permainan.");

    gotoHome();
  }
}

function nextRound(){
  STATE.round++;
  if(STATE.round <= STATE.totalRounds){
    buildQuestion();
  }
  updateMeta();
  finishIfNeeded();
}

function skipRound(){
  showToast("⏭️ Oke, lanjut!");
  nextRound();
}

// ------------ PWA install ------------
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.hidden = false;
});
btnInstall?.addEventListener("click", async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  btnInstall.hidden = true;
  if(choice?.outcome === "accepted") showToast("Terpasang di layar utama ✅");
});

// ------------ service worker ------------
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  });
}

// ------------ events ------------
document.querySelectorAll("[data-go]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const mode = btn.getAttribute("data-go");
    startMode(mode);
  });
});

btnBack.addEventListener("click", gotoHome);
btnBack2.addEventListener("click", gotoHome);
btnNext.addEventListener("click", nextRound);
btnSkip.addEventListener("click", skipRound);

btnHelp.addEventListener("click", ()=> modalHelp.showModal());
btnCloseHelp.addEventListener("click", ()=> modalHelp.close());

btnSound.addEventListener("click", toggleSound);

btnLihatSkor.addEventListener("click", async ()=>{
  gotoScore();
  const res = await fetchScores();
  renderScores(res.scores);
  showToast(res.where === "server" ? "Menampilkan skor server" : "Menampilkan skor lokal");
});

btnRefresh.addEventListener("click", async ()=>{
  const res = await fetchScores();
  renderScores(res.scores);
  showToast("Skor dimuat ulang ✅");
});

btnClearScores.addEventListener("click", ()=>{
  localStorage.removeItem(STORAGE_KEY);
  showToast("Skor lokal dihapus 🧹");
});

btnReset.addEventListener("click", ()=>{
  inpNama.value = "";
  selKelas.value = "1";
  showToast("Reset selesai 🔄");
});

// initial
loadSoundSetting();
gotoHome();
