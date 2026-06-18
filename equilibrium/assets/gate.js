/* EQuilibrium — private access gate (client-side).
   Only SHA-256 hashes live here; passwords are never stored in the repo.
   Note: this is a deterrent + noindex, not server-grade security. */
(function(){
  "use strict";
  var HASHES = [
    "2494d99ffe1b0d8a82ff450d0a0eb05fda9ca6f5a8f6778245a895410f727cd7",
    "2b6bcd8868df298fe6d42d0892151c4054dd52015c8c338e7d7773111ae812d0"
  ];
  var KEY = "eq_en_gate";
  var MAXAGE = 30 * 24 * 3600 * 1000; // 30 days

  function authed(){
    try{
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      return !!v && HASHES.indexOf(v.h) >= 0 && (Date.now() - v.t) < MAXAGE;
    }catch(e){ return false; }
  }
  if (authed()) return; // already unlocked — show page normally

  // lock the page immediately (script is parser-blocking in <head>)
  document.write(
    '<style id="eq-lock">' +
    'html.eqlk body>*:not(#eqgate){display:none!important}' +
    'html.eqlk{overflow:hidden}' +
    '#eqgate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
    'background:radial-gradient(900px 500px at 75% -10%,#143049 0,transparent 60%),linear-gradient(180deg,#0a1018,#0d1a2b);' +
    'font-family:Manrope,system-ui,-apple-system,Segoe UI,sans-serif;padding:20px}' +
    '#eqgate .box{width:100%;max-width:380px;text-align:center;color:#eef3f9}' +
    '#eqgate h2{font-family:"Space Grotesk",Manrope,sans-serif;font-size:1.5rem;margin:14px 0 6px;color:#fff}' +
    '#eqgate p{color:#9fb0c4;font-size:.92rem;margin:0 0 22px}' +
    '#eqgate input{width:100%;padding:13px 15px;border:1px solid #2a4a66;border-radius:10px;background:#0f1d30;color:#fff;font-size:1rem;text-align:center;letter-spacing:.04em}' +
    '#eqgate input:focus{outline:0;border-color:#22c1c8;box-shadow:0 0 0 4px rgba(34,193,200,.18)}' +
    '#eqgate button{width:100%;margin-top:12px;padding:13px;border:0;border-radius:10px;background:#22c1c8;color:#042426;font-weight:700;font-size:1rem;cursor:pointer;font-family:inherit}' +
    '#eqgate button:hover{background:#33d2d9}' +
    '#eqgate .err{display:none;color:#ff8a8a;font-size:.86rem;margin-top:12px}' +
    '#eqgate .lock{font-size:30px}' +
    '#eqgate .ft{margin-top:24px;font-size:.74rem;color:#5b6e83;line-height:1.6}' +
    '</style>'
  );
  document.documentElement.className += " eqlk";

  function sha(s){
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(x){
        return ("0" + x.toString(16)).slice(-2);
      }).join("");
    });
  }

  function build(){
    var g = document.createElement("div");
    g.id = "eqgate";
    g.innerHTML =
      '<div class="box">' +
        '<div class="lock">🔒</div>' +
        '<h2>EQuilibrium — private access</h2>' +
        '<p>This is a confidential version of the project.<br>Enter the password to continue. / Закрытый доступ — введите пароль.</p>' +
        '<form><input type="password" autocomplete="off" placeholder="Password / Пароль" autofocus>' +
        '<button type="submit">Unlock / Войти</button>' +
        '<div class="err">Wrong password / Неверный пароль</div></form>' +
        '<div class="ft">EQuilibrium · Center Group Company</div>' +
      '</div>';
    document.body.appendChild(g);
    var form = g.querySelector("form"), inp = g.querySelector("input"), err = g.querySelector(".err");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      sha(inp.value).then(function(h){
        if (HASHES.indexOf(h) >= 0){
          try{ localStorage.setItem(KEY, JSON.stringify({h:h, t:Date.now()})); }catch(e){}
          document.documentElement.className = document.documentElement.className.replace(/\s*eqlk/,"");
          g.parentNode.removeChild(g);
        } else {
          err.style.display = "block"; inp.value = ""; inp.focus();
        }
      });
    });
    setTimeout(function(){ inp.focus(); }, 40);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
