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
    var input = document.getElementById('theme-checkbox');
    if (!input) return;
    input.checked = (theme === 'dark');
    var wrapper = document.getElementById('theme-switch');
    if (wrapper) {
      wrapper.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      wrapper.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
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

  /* Build toggle switch once DOM is ready */
  document.addEventListener('DOMContentLoaded', function () {
    var wrapper = document.createElement('div');
    wrapper.id = 'theme-switch';
    wrapper.className = 'theme-switch';
    wrapper.setAttribute('role', 'switch');
    wrapper.setAttribute('tabindex', '0');

    /* Sun icon (light) */
    var sunSvg = '<svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<circle cx="12" cy="12" r="5"/>'
      + '<line x1="12" y1="1" x2="12" y2="3"/>'
      + '<line x1="12" y1="21" x2="12" y2="23"/>'
      + '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>'
      + '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>'
      + '<line x1="1" y1="12" x2="3" y2="12"/>'
      + '<line x1="21" y1="12" x2="23" y2="12"/>'
      + '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>'
      + '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      + '</svg>';

    /* Track + knob */
    var track = '<div class="theme-track"><div class="theme-knob"></div></div>';

    /* Moon icon (dark) */
    var moonSvg = '<svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
      + '</svg>';

    /* Hidden checkbox for state */
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'theme-checkbox';
    checkbox.className = 'theme-checkbox';
    checkbox.checked = (getPreferred() === 'dark');

    wrapper.innerHTML = sunSvg + track + moonSvg;
    wrapper.insertBefore(checkbox, wrapper.firstChild);

    var current = getPreferred();
    updateToggle(current);

    /* Click handler */
    wrapper.addEventListener('click', function () {
      var now = document.documentElement.getAttribute('data-theme');
      var next = now === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
    });

    /* Keyboard handler */
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        wrapper.click();
      }
    });

    /* Insert into header (top-right) */
    var header = document.querySelector('header');
    if (header) {
      header.appendChild(wrapper);
    }
  });
})();
