/* SUNTHESIS cabinet — demo logic (client-side, localStorage). */

const GATES = [
  ["G0","Приём, feasibility, term sheet","Бриф полон и требования измеримы · реализуемость подтверждена · нет блокирующих FTO-флагов · рынок понятен · term sheet (доля) зафиксирован"],
  ["G1","Концепция, trade-study","≥3 концепции · весовая матрица выбора · обоснование · грубая оценка ключевых параметров"],
  ["G2","ТЗ и ТУ","ТЗ (ГОСТ 15.016/2.114) · ТУ · матрица измеримых требований · трассировка к методам приёмки"],
  ["G3","Расчёты, КД, 3D","Каскад чертежей ЕСКД · спецификации, BOM · CAE по критичным узлам · tolerance stack-up · нормоконтроль"],
  ["G4","Технология, техпроцесс","Маршрутные/операционные карты · CAM, оснастка · план контроля · DFM/DFA"],
  ["G5","IP, патентование, FTO","Заявки на изобретение/ПМ · FTO до прототипа · стратегия защиты"],
  ["G6","Прототип, испытания V&V","Прототип · протоколы испытаний · цифровой двойник · трассировка требований закрыта"],
  ["G7","Финансирование","Финмодель · оценка · пич-дек · data room · структура раунда"],
  ["G8","Пилот, МВП-производство","Пилотная партия · FAT/SAT · подтверждённая себестоимость"],
  ["G9","Производство, продажи","Серийный запуск · GTM, каналы · договоры"],
  ["G10","Партнёрство, развитие","Оформление доли · roadmap, версии 2.0 · сопровождение"]
];

const DOCS = [
  ["—","Бриф приёма заказа (G0)","G0","new"],
  ["—","Term sheet","G0","new"],
  ["СИ-001","Trade-study концепций","G1","wait"],
  ["ТЗ-001","Техническое задание","G2","wait"],
  ["СБ-001","Сборочный чертёж","G3","wait"],
  ["СП-001","Спецификация (ГОСТ 2.106)","G3","wait"],
  ["РР-001","Расчёт прочности/ресурса","G3","wait"],
  ["ТП-001","Маршрутная карта техпроцесса","G4","wait"],
  ["IP-001","Заявка на изобретение + FTO","G5","wait"],
  ["VV-001","Протокол испытаний прототипа","G6","wait"],
  ["ФМ-001","Финмодель и пич-дек","G7","wait"]
];

const STATUS_LABEL = {ok:"закрыт",wait:"ожидает",new:"новый"};

let state = load();

function load(){
  const u = JSON.parse(localStorage.getItem('snt_user')||'null');
  if(!u){ location.href='login.html'; return; }
  let s = JSON.parse(localStorage.getItem('snt_state')||'null');
  if(!s){
    s = { user:u, project:null, gate:0, files:[], brief:null, share:null,
      feed:[{t:nowStr(),m:"Аккаунт создан. Добро пожаловать в SUNTHESIS."}],
      chat:[{who:'them',m:'Здравствуйте! Я Дирижёр вашего проекта. Заполните бриф приёма заказа (G0) — и мы начнём с оценки реализуемости.',t:nowStr()}] };
    save(s);
  }
  s.user = u;
  return s;
}
function save(s){ localStorage.setItem('snt_state', JSON.stringify(s||state)); }
function nowStr(){ const d=new Date(); return d.toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
function toast(m){ const t=document.getElementById('toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }

/* ---------- nav ---------- */
const TITLES = {dash:"Дашборд",intake:"Приём заказа (G0)",files:"Загрузка файлов",docs:"Документы и КД",gates:"Гейты G0→G10",msg:"Сообщения",deal:"Партнёрство"};
function nav(v){
  document.querySelectorAll('.side a[data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view===v));
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  document.getElementById('ptitle').textContent = TITLES[v];
  document.getElementById('side').classList.remove('open');
  if(v==='gates') renderGatesFull();
}
document.querySelectorAll('.side a[data-view]').forEach(a=>a.addEventListener('click',()=>nav(a.dataset.view)));

function logout(){ localStorage.removeItem('snt_user'); location.href='login.html'; }

/* ---------- header ---------- */
function renderHeader(){
  const u=state.user;
  document.getElementById('whoText').textContent = u.name+' · '+u.role;
  document.getElementById('avatar').textContent = (u.name[0]||'?').toUpperCase();
}

/* ---------- dashboard ---------- */
function renderDash(){
  document.getElementById('dProj').textContent = state.project || 'Не заведён';
  document.getElementById('dGate').textContent = GATES[state.gate][0];
  const prog = Math.round(state.gate/(GATES.length-1)*100);
  document.getElementById('dProg').textContent = prog+'%';
  document.getElementById('dShare').textContent = state.share || '—';
  document.getElementById('dbar').style.width = prog+'%';
  // track
  const tr=document.getElementById('dtrack'); tr.innerHTML='';
  GATES.forEach((g,i)=>{
    const cls = i<state.gate?'done':(i===state.gate?'active':'');
    tr.innerHTML += `<div class="gstep ${cls}"><div class="gg">${g[0]}</div><div class="gt">${g[1]}</div></div>`;
  });
  // feed
  const f=document.getElementById('feed'); f.innerHTML='';
  state.feed.slice().reverse().forEach(e=>{
    f.innerHTML += `<div style="padding:10px 0;border-bottom:1px dashed #e3e9f0;font-size:14px"><span class="muted" style="font-size:12px">${e.t}</span><br>${e.m}</div>`;
  });
  document.getElementById('nextStep').textContent = state.brief
    ? `Дирижёр оценивает бриф «${state.project}». Ожидайте предложения по term sheet и решения гейта G0.`
    : 'Заполните бриф приёма заказа (G0), чтобы запустить проект.';
}

/* ---------- intake ---------- */
document.getElementById('briefForm').addEventListener('submit',e=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const b = Object.fromEntries(fd.entries());
  state.brief = b;
  state.project = b.title;
  state.share = '10–30% (обсуждается)';
  state.feed.push({t:nowStr(),m:`Бриф «${b.title}» отправлен Дирижёру. Запущена предварительная оценка (G0).`});
  state.chat.push({who:'them',m:`Принял бриф по проекту «${b.title}». Провожу экспресс-оценку реализуемости, патентного ландшафта и рынка. Предложу term sheet и вынесу решение по гейту G0. Уточняющие вопросы пришлю отдельно.`,t:nowStr()});
  document.getElementById('tsShare').textContent = state.share;
  save();
  renderDash(); renderChat();
  toast('Бриф отправлен Дирижёру');
  nav('dash');
});

/* ---------- files ---------- */
const drop=document.getElementById('drop'), fileInput=document.getElementById('fileInput');
drop.addEventListener('click',()=>fileInput.click());
['dragover','dragenter'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');}));
['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('over');}));
drop.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
fileInput.addEventListener('change',e=>addFiles(e.target.files));
function addFiles(list){
  [...list].forEach(f=>{
    state.files.push({name:f.name,size:(f.size/1024).toFixed(0)+' КБ',t:nowStr()});
    state.feed.push({t:nowStr(),m:`Загружен файл: ${f.name}`});
  });
  save(); renderFiles(); renderDash();
  toast(list.length+' файл(ов) загружено');
}
function rmFile(i){ state.files.splice(i,1); save(); renderFiles(); }
function renderFiles(){
  const el=document.getElementById('filelist'); el.innerHTML='';
  if(!state.files.length){ el.innerHTML='<div class="muted" style="padding:8px;font-size:14px">Файлов пока нет.</div>'; return; }
  state.files.forEach((f,i)=>{
    const ext=(f.name.split('.').pop()||'').toUpperCase().slice(0,4);
    el.innerHTML += `<div class="fileitem"><div class="fi">${ext}</div><div><b>${f.name}</b><br><span class="muted" style="font-size:12px">${f.size} · ${f.t}</span></div><span class="rm" onclick="rmFile(${i})">удалить</span></div>`;
  });
}

/* ---------- docs ---------- */
function renderDocs(){
  const tb=document.getElementById('docsBody'); tb.innerHTML='';
  DOCS.forEach(d=>{
    let st=d[3];
    const gi=parseInt(d[2].slice(1));
    if(gi<state.gate) st='ok'; else if(gi===state.gate) st='wait';
    tb.innerHTML += `<tr><td class="mono">${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td><span class="tag ${st}">${STATUS_LABEL[st]}</span></td></tr>`;
  });
}

/* ---------- gates full ---------- */
function renderGatesFull(){
  const tr=document.getElementById('gtrackFull'); tr.innerHTML='';
  GATES.forEach((g,i)=>{
    const cls = i<state.gate?'done':(i===state.gate?'active':'');
    tr.innerHTML += `<div class="gstep ${cls}" onclick="gateDetail(${i})" style="cursor:pointer"><div class="gg">${g[0]}</div><div class="gt">${g[1]}</div></div>`;
  });
  gateDetail(state.gate);
}
function gateDetail(i){
  const g=GATES[i];
  const st = i<state.gate?'закрыт ✓':(i===state.gate?'в работе':'не открыт');
  document.getElementById('gateDetail').innerHTML =
    `<h2>${g[0]} — ${g[1]} <span class="tag ${i<state.gate?'ok':(i===state.gate?'wait':'new')}" style="margin-left:8px">${st}</span></h2>
     <div class="sub" style="margin-top:8px"><b>Критерии go/no-go:</b></div>
     <p style="font-size:14.5px;color:#3a4a5c;margin-top:6px">${g[2]}</p>`;
}

/* ---------- chat ---------- */
function renderChat(){
  const c=document.getElementById('chat'); c.innerHTML='';
  state.chat.forEach(m=>{
    c.innerHTML += `<div class="msg ${m.who}">${m.m}<span class="meta">${m.t}</span></div>`;
  });
  c.scrollTop=c.scrollHeight;
}
function sendMsg(){
  const inp=document.getElementById('msgInput'); const v=inp.value.trim(); if(!v)return;
  state.chat.push({who:'me',m:v,t:nowStr()}); inp.value='';
  save(); renderChat();
  setTimeout(()=>{
    state.chat.push({who:'them',m:'Принял. Дирижёр обработает запрос и вернётся с ответом по существу в рамках текущего гейта.',t:nowStr()});
    save(); renderChat();
  },900);
}
document.getElementById('msgInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg();});

/* ---------- init ---------- */
renderHeader(); renderDash(); renderFiles(); renderDocs(); renderChat();
if(state.share) document.getElementById('tsShare').textContent = state.share;
