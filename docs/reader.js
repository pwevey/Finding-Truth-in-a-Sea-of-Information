/* reader.js — Audio player using pre-generated AI voice (Microsoft Neural TTS) */

(function () {
  'use strict';

  /* Map page filenames to audio files */
  var AUDIO_MAP = {
    'index.html':                   'audio/index.mp3',
    'manifesto.html':               'audio/manifesto.mp3',
    'ai-reflection-on-truth.html':  'audio/ai-reflection.mp3',
    'christian-framework-ai.html':  'audio/christian-framework.mp3',
    'accuracy-is-not-truth.html':    'audio/accuracy-is-not-truth.mp3',
    'about.html':                   'audio/about.mp3',
    'glossary.html':                'audio/glossary.mp3'
  };

  /* Also match root path (e.g. "/Finding-Truth-in-a-Sea-of-Information/") */
  var path = window.location.pathname;
  var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  var audioSrc = AUDIO_MAP[page];
  if (!audioSrc) return;

  /* ---- Build audio element ---- */
  var audio = new Audio(audioSrc);
  audio.preload = 'metadata';

  /* ---- Build UI ---- */
  var bar = document.createElement('div');
  bar.className = 'reader-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Audio player');

  /* Listen label */
  var listenLabel = document.createElement('span');
  listenLabel.className = 'reader-label';
  listenLabel.textContent = '\uD83D\uDD0A Listen';

  var btnPlay = makeBtn('\u25B6', 'reader-play', 'Play');
  var btnPause = makeBtn('\u23F8', 'reader-pause', 'Pause');
  var btnStop = makeBtn('\u25A0', 'reader-stop', 'Stop');
  btnStop.style.display = 'none';

  /* Progress bar */
  var progressWrap = document.createElement('div');
  progressWrap.className = 'reader-progress-wrap';
  var progressBar = document.createElement('div');
  progressBar.className = 'reader-progress-bar';
  var progressFill = document.createElement('div');
  progressFill.className = 'reader-progress-fill';
  progressBar.appendChild(progressFill);
  progressWrap.appendChild(progressBar);

  /* Time display */
  var timeDisplay = document.createElement('span');
  timeDisplay.className = 'reader-time';
  timeDisplay.textContent = '0:00 / 0:00';

  /* Speed control */
  var speedLabel = document.createElement('label');
  speedLabel.className = 'reader-speed-label';
  speedLabel.textContent = 'Speed ';
  var speedSelect = document.createElement('select');
  speedSelect.className = 'reader-speed';
  speedSelect.setAttribute('aria-label', 'Playback speed');
  [
    { value: '0.75', text: '0.75\u00D7' },
    { value: '1',    text: '1\u00D7' },
    { value: '1.25', text: '1.25\u00D7' },
    { value: '1.5',  text: '1.5\u00D7' },
    { value: '2',    text: '2\u00D7' }
  ].forEach(function (opt) {
    var o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.text;
    if (opt.value === '1') o.selected = true;
    speedSelect.appendChild(o);
  });
  speedLabel.appendChild(speedSelect);

  btnPause.style.display = 'none';

  bar.appendChild(listenLabel);
  bar.appendChild(btnPlay);
  bar.appendChild(btnPause);
  bar.appendChild(btnStop);
  bar.appendChild(progressWrap);
  bar.appendChild(timeDisplay);
  bar.appendChild(speedLabel);

  /* Insert before main */
  var mainEl = document.getElementById('main-content') || document.querySelector('main');
  if (mainEl) {
    mainEl.parentNode.insertBefore(bar, mainEl);
  }

  /* ---- Helpers ---- */
  function makeBtn(symbol, cls, ariaLabel) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = symbol;
    b.setAttribute('aria-label', ariaLabel);
    b.setAttribute('title', ariaLabel);
    return b;
  }

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ---- Event handlers ---- */
  btnPlay.addEventListener('click', function () {
    audio.play();
  });

  btnPause.addEventListener('click', function () {
    audio.pause();
  });

  btnStop.addEventListener('click', function () {
    audio.pause();
    audio.currentTime = 0;
    btnPlay.style.display = '';
    btnPause.style.display = 'none';
    btnStop.style.display = 'none';
    btnPlay.setAttribute('aria-label', 'Play');
    progressFill.style.width = '0%';
    timeDisplay.textContent = '0:00 / ' + formatTime(audio.duration);
  });

  audio.addEventListener('play', function () {
    btnPlay.style.display = 'none';
    btnPause.style.display = '';
    btnStop.style.display = '';
  });

  audio.addEventListener('pause', function () {
    btnPlay.style.display = '';
    btnPlay.textContent = audio.currentTime > 0 ? '\u25B6' : '\u25B6';
    btnPlay.setAttribute('aria-label', audio.currentTime > 0 ? 'Resume' : 'Play');
    btnPause.style.display = 'none';
  });

  audio.addEventListener('ended', function () {
    btnPlay.style.display = '';
    btnPlay.setAttribute('aria-label', 'Play');
    btnPause.style.display = 'none';
    btnStop.style.display = 'none';
    progressFill.style.width = '0%';
  });

  audio.addEventListener('timeupdate', function () {
    if (audio.duration) {
      var pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      timeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    }
  });

  audio.addEventListener('loadedmetadata', function () {
    timeDisplay.textContent = '0:00 / ' + formatTime(audio.duration);
  });

  /* Click-to-seek on progress bar */
  progressBar.addEventListener('click', function (e) {
    if (!audio.duration) return;
    var rect = progressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  /* Speed change */
  speedSelect.addEventListener('change', function () {
    audio.playbackRate = parseFloat(speedSelect.value);
  });

})();

/* ===== Heading Anchor Links ===== */
(function () {
  'use strict';

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var main = document.querySelector('main');
    if (!main) return;

    var headings = main.querySelectorAll('h2, h3');
    var usedIds = {};

    headings.forEach(function (h) {
      var id = slugify(h.textContent);
      /* Ensure unique IDs */
      if (usedIds[id]) {
        usedIds[id]++;
        id = id + '-' + usedIds[id];
      } else {
        usedIds[id] = 1;
      }

      h.id = id;

      var anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = '#' + id;
      anchor.setAttribute('aria-label', 'Link to this section');
      anchor.textContent = '#';

      h.appendChild(anchor);
    });

    /* ---- Reading Time Estimate ---- */
    var text = main.textContent || '';
    var wordCount = text.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(wordCount / 225));

    var readingTime = document.createElement('p');
    readingTime.className = 'reading-time';
    readingTime.textContent = '\u23F1 ' + minutes + ' min read';

    /* Insert after .document-meta or .notice, or at the top of main */
    var insertAfter = main.querySelector('.document-meta') || main.querySelector('.notice');
    if (insertAfter) {
      insertAfter.parentNode.insertBefore(readingTime, insertAfter.nextSibling);
    } else {
      main.insertBefore(readingTime, main.firstChild);
    }

    /* ---- Table of Contents ---- */
    var h2s = main.querySelectorAll('h2');
    if (h2s.length >= 3) {
      var tocWrapper = document.createElement('nav');
      tocWrapper.className = 'toc';
      tocWrapper.setAttribute('aria-label', 'Table of contents');

      var tocTitle = document.createElement('p');
      tocTitle.className = 'toc-title';
      tocTitle.textContent = 'Contents';
      tocWrapper.appendChild(tocTitle);

      var tocList = document.createElement('ol');

      h2s.forEach(function (h2) {
        if (!h2.id) return;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h2.id;
        /* Get text without the anchor '#' */
        a.textContent = h2.textContent.replace(/\s*#\s*$/, '');
        li.appendChild(a);
        tocList.appendChild(li);
      });

      tocWrapper.appendChild(tocList);

      /* Insert TOC after reading time */
      readingTime.parentNode.insertBefore(tocWrapper, readingTime.nextSibling);
    }
  });
})();
