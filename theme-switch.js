(function () {
  var KEY = 'aslankaa-theme';
  var THEMES = ['dark', 'light', 'sepia'];

  function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    var btns = document.querySelectorAll('.aslan-stickybar__theme');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute(
        'aria-pressed',
        btns[i].getAttribute('data-set-theme') === theme ? 'true' : 'false'
      );
    }
  }

  var btns = document.querySelectorAll('.aslan-stickybar__theme');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function () {
      applyTheme(this.getAttribute('data-set-theme'));
    });
  }

  applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
})();
