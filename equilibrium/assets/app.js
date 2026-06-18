/* EQuilibrium — клиентский функционал (демо, без отправки ПДн на сервер).
   Всё работает локально в браузере (localStorage). Реальная связь — mailto/Telegram. */
(function(){
  "use strict";
  var EN = (document.documentElement.lang || "ru").toLowerCase().indexOf("en") === 0;

  /* ---------- мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  if (burger){
    burger.addEventListener('click', function(){
      var nav = document.querySelector('header.nav nav');
      if (nav) nav.classList.toggle('open');
    });
  }

  /* ---------- загрузка файлов (демо) ---------- */
  function bytes(n){
    if (n < 1024) return n + ' Б';
    if (n < 1048576) return (n/1024).toFixed(1) + ' КБ';
    return (n/1048576).toFixed(1) + ' МБ';
  }
  document.querySelectorAll('[data-dropzone]').forEach(function(zone){
    var input = zone.querySelector('input[type=file]');
    var list  = zone.parentNode.querySelector('[data-filelist]');
    var store = [];
    function render(){
      list.innerHTML = '';
      store.forEach(function(f, i){
        var li = document.createElement('li');
        li.innerHTML = '<span>📎</span><span class="fn">'+f.name+'</span><span class="muted">'+bytes(f.size)+'</span>';
        var rm = document.createElement('button');
        rm.className = 'rm'; rm.type = 'button'; rm.textContent = '✕';
        rm.addEventListener('click', function(){ store.splice(i,1); render(); });
        li.appendChild(rm);
        list.appendChild(li);
      });
    }
    function add(files){ for (var i=0;i<files.length;i++) store.push(files[i]); render(); }
    zone.addEventListener('click', function(){ input.click(); });
    input.addEventListener('change', function(){ add(input.files); });
    ['dragover','dragenter'].forEach(function(e){ zone.addEventListener(e,function(ev){ev.preventDefault();zone.classList.add('drag');}); });
    ['dragleave','drop'].forEach(function(e){ zone.addEventListener(e,function(ev){ev.preventDefault();zone.classList.remove('drag');}); });
    zone.addEventListener('drop', function(ev){ if(ev.dataTransfer&&ev.dataTransfer.files) add(ev.dataTransfer.files); });
  });

  /* ---------- форма заявки (демо) ---------- */
  document.querySelectorAll('form[data-order]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.checkValidity()){ form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function(v,k){ data[k]=v; });
      data.id = 'EQ-' + Date.now().toString(36).toUpperCase();
      data.created = new Date().toISOString().slice(0,16).replace('T',' ');
      data.status = EN ? 'Order received · G0 (intake)' : 'Заявка принята · G0 (приём заказа)';
      try{
        var q = JSON.parse(localStorage.getItem('eq_orders')||'[]');
        q.push(data); localStorage.setItem('eq_orders', JSON.stringify(q));
        localStorage.setItem('eq_last_order', JSON.stringify(data));
      }catch(err){}
      var ok = form.parentNode.querySelector('[data-ok]');
      if (ok){
        ok.style.display='block';
        ok.innerHTML = EN
          ? '<b>Your request is registered.</b> Number: <span class="mono">'+data.id+'</span>. '+
            'The Lead Designer-Conductor will open gate G0 (intake, feasibility, preliminary term sheet). '+
            'We’ll be in touch via the details provided. Demo mode: data is stored locally in this browser and not sent to a server.'
          : '<b>Заявка зарегистрирована.</b> Номер: <span class="mono">'+data.id+'</span>. '+
            'Дирижёр-конструктор откроет гейт G0 (приём заказа, feasibility, предварительный term sheet). '+
            'Мы свяжемся по указанным контактам. Демо-режим: данные сохранены локально в этом браузере и не передаются на сервер.';
        ok.scrollIntoView({behavior:'smooth',block:'center'});
      }
      form.reset();
      var fl = form.querySelector('[data-filelist]'); if (fl) fl.innerHTML='';
    });
  });

  /* ---------- кабинет клиента (демо) ---------- */
  var cab = document.querySelector('[data-cabinet]');
  if (cab){
    var loginForm = document.querySelector('[data-login]');
    var shell     = document.querySelector('[data-cab-shell]');
    var loginBox  = document.querySelector('[data-login-box]');
    function showShell(name){
      if (loginBox) loginBox.style.display='none';
      if (shell) shell.style.display='grid';
      var who = document.querySelector('[data-who]');
      if (who) who.textContent = name || (EN ? 'Client' : 'Заказчик');
      localStorage.setItem('eq_demo_user', name || (EN ? 'Client' : 'Заказчик'));
    }
    if (loginForm){
      loginForm.addEventListener('submit', function(e){
        e.preventDefault();
        var n = loginForm.querySelector('input[name=name]');
        showShell(n && n.value ? n.value : 'Заказчик');
      });
    }
    var saved = localStorage.getItem('eq_demo_user');
    if (saved) showShell(saved);

    // навигация по вкладкам кабинета
    document.querySelectorAll('[data-tab]').forEach(function(t){
      t.addEventListener('click', function(){
        document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.remove('active');});
        document.querySelectorAll('.cab-pane').forEach(function(p){p.classList.remove('active');});
        t.classList.add('active');
        var pane = document.querySelector('#'+t.getAttribute('data-tab'));
        if (pane) pane.classList.add('active');
      });
    });
    var logout = document.querySelector('[data-logout]');
    if (logout) logout.addEventListener('click', function(){
      localStorage.removeItem('eq_demo_user');
      if (shell) shell.style.display='none';
      if (loginBox) loginBox.style.display='block';
    });
  }

  /* ---------- год в футере ---------- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
