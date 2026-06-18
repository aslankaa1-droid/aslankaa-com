/* SUNTHESIS — приватный доступ. Пароль не хранится в коде, только SHA-256. Сессия 30 дней. */
(function () {
  var HASH = "d563f056e3fae1a73e356b7b0863690df1e3c66af7286d3cc9ee10e7544dbfac";
  var KEY = "snt_gate_v1";
  var TTL = 30 * 24 * 60 * 60 * 1000;

  function ok() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      return s && s.h === HASH && s.t > Date.now();
    } catch (e) { return false; }
  }
  function grant() {
    localStorage.setItem(KEY, JSON.stringify({ h: HASH, t: Date.now() + TTL }));
  }
  async function sha256(str) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  if (ok()) return;

  // блокируем страницу до ввода
  var html = document.documentElement;
  var prevOverflow = html.style.overflow;
  html.style.overflow = "hidden";

  var ov = document.createElement("div");
  ov.id = "snt-gate";
  ov.innerHTML =
    '<div class="snt-gate-card">' +
      '<div class="snt-gate-brand">' +
        '<svg width="34" height="34" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0b2a4a"/><path d="M16 5l9 5.2v10.4L16 27l-9-6.4V10.2z" fill="none" stroke="#c9a227" stroke-width="1.4"/><circle cx="16" cy="16" r="3.2" fill="#c9a227"/></svg>' +
        '<b>SUNTHESIS</b>' +
      '</div>' +
      '<p class="snt-gate-sub">Приватный доступ. Введите пароль.</p>' +
      '<input id="snt-gate-pass" type="password" placeholder="Пароль" autocomplete="off" autofocus>' +
      '<button id="snt-gate-btn">Войти →</button>' +
      '<div id="snt-gate-err"></div>' +
    '</div>';
  var css =
    '#snt-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;' +
    'background:radial-gradient(900px 500px at 50% -10%,#163a63,#0b2a4a 50%,#071d35);font-family:"Segoe UI",Arial,sans-serif;padding:24px}' +
    '#snt-gate .snt-gate-card{background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.4);width:100%;max-width:380px;padding:34px;text-align:center}' +
    '#snt-gate .snt-gate-brand{display:flex;align-items:center;justify-content:center;gap:11px;color:#0b2a4a;font-size:21px;letter-spacing:3px;font-weight:700;margin-bottom:8px}' +
    '#snt-gate .snt-gate-sub{color:#5b6b7d;font-size:14px;margin-bottom:22px}' +
    '#snt-gate input{width:100%;padding:12px 14px;border:1px solid #dfe5ec;border-radius:10px;font-size:15px;margin-bottom:14px;font-family:inherit}' +
    '#snt-gate input:focus{outline:none;border-color:#c9a227;box-shadow:0 0 0 3px rgba(201,162,39,.18)}' +
    '#snt-gate button{width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;' +
    'background:linear-gradient(135deg,#c9a227,#e6c75a);color:#071d35;transition:transform .15s}' +
    '#snt-gate button:hover{transform:translateY(-2px)}' +
    '#snt-gate #snt-gate-err{color:#c0392b;font-size:13px;margin-top:12px;min-height:16px}';
  var st = document.createElement("style"); st.textContent = css;
  document.head.appendChild(st);

  function mount() {
    document.body.appendChild(ov);
    var inp = document.getElementById("snt-gate-pass");
    var btn = document.getElementById("snt-gate-btn");
    var err = document.getElementById("snt-gate-err");
    async function tryit() {
      var h = await sha256(inp.value);
      if (h === HASH) {
        grant();
        html.style.overflow = prevOverflow;
        ov.remove();
      } else {
        err.textContent = "Неверный пароль";
        inp.value = ""; inp.focus();
      }
    }
    btn.addEventListener("click", tryit);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") tryit(); });
    inp.focus();
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
