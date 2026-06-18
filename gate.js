/* Access gate — клиентский PIN-overlay (SHA-256, сессия 30 дней). Коды у владельца. */
(function () {
  'use strict';
  var HASHES = [
    '4740d9d678e80535f43fb87da9c791b5b6620a6442125b118d0936029033afc3',
    '0823e418ec5193be489029adbba78b56e3ad57d3c498dd69f1d733dcfe61585e',
    '0d3154477822b760459eb3f8177477d8aab44a04dbc4f5e7d6676660f5c6a272',
    '15ca3abbcbec797ca5ae31f46bdfbfd4a7f562e17f7c5a06cf09e497ed659199',
    '1916849d704765fc4fcd2c46c6be64f9e1175a84f9e550f8d694f1727688449e'
  ];
  var KEY = 'akaa-gate', DAYS = 30;
  function authed() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return s.ok === true && Date.now() < (s.ts + DAYS * 86400000); }
    catch (e) { return false; }
  }
  if (authed()) return;
  var st = document.createElement('style');
  st.id = 'akaa-gate-style';
  st.textContent = 'html{visibility:hidden!important}#akaa-gate,#akaa-gate *{visibility:visible!important}';
  (document.head || document.documentElement).appendChild(st);
  async function sha(t) {
    var b = new TextEncoder().encode(t);
    var h = await crypto.subtle.digest('SHA-256', b);
    return Array.from(new Uint8Array(h)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }
  function build() {
    var ov = document.createElement('div');
    ov.id = 'akaa-gate';
    ov.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;background:#0b1220;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,sans-serif');
    ov.innerHTML = '<div style="background:#fff;padding:40px 32px;border-radius:16px;max-width:340px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.45)">'
      + '<h1 style="font-size:18px;margin:0 0 6px;color:#0b1220;font-weight:700">Доступ по коду</h1>'
      + '<p style="font-size:13px;color:#667085;margin:0 0 20px">Введите 6-значный PIN</p>'
      + '<input id="akaa-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="6" '
      + 'style="width:100%;padding:14px;font-size:20px;text-align:center;letter-spacing:6px;border:1px solid #ccd0dd;border-radius:10px;box-sizing:border-box;outline:none">'
      + '<div id="akaa-msg" style="min-height:16px;color:#c0392b;font-size:12px;margin-top:10px"></div></div>';
    document.body.appendChild(ov);
    var inp = ov.querySelector('#akaa-pin'), msg = ov.querySelector('#akaa-msg');
    try { inp.focus(); } catch (e) {}
    var busy = false;
    async function check() {
      if (busy) return; var v = (inp.value || '').trim();
      if (v.length < 6) return; busy = true;
      var h = await sha(v);
      if (HASHES.indexOf(h) >= 0) {
        try { localStorage.setItem(KEY, JSON.stringify({ ok: true, ts: Date.now() })); } catch (e) {}
        var s = document.getElementById('akaa-gate-style'); if (s) s.parentNode.removeChild(s);
        ov.parentNode.removeChild(ov);
      } else { msg.textContent = 'Неверный код'; inp.value = ''; busy = false; try { inp.focus(); } catch (e) {} }
    }
    inp.addEventListener('input', function () { msg.textContent = ''; if (inp.value.length >= 6) check(); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
