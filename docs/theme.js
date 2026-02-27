/* theme.js — Dark/light mode toggle with system-preference default */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme-preference';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return getSystemTheme();
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggle(theme);
  }

  function updateToggle(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    if (theme === 'dark') {
      btn.textContent = '\u2600\uFE0F';
      btn.setAttribute('aria-label', 'Switch to light mode');
      btn.setAttribute('title', 'Switch to light mode');
    } else {
      btn.textContent = '\uD83C\uDF19';
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.setAttribute('title', 'Switch to dark mode');
    }
  }

  /* Apply immediately to prevent flash */
  apply(getPreferred());

  /* Listen for system changes (if user hasn't manually overridden) */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!localStorage.getItem(STORAGE_KEY)) {
      apply(getSystemTheme());
    }
  });

  /* Build toggle button once DOM is ready */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.type = 'button';
    btn.className = 'theme-toggle';

    var current = getPreferred();
    updateToggle(current);

    btn.addEventListener('click', function () {
      var now = document.documentElement.getAttribute('data-theme');
      var next = now === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
    });

    /* Insert into nav */
    var nav = document.querySelector('nav ul');
    if (nav) {
      var li = document.createElement('li');
      li.appendChild(btn);
      nav.appendChild(li);
    }
  });
})();
