/* reader.js — Audio player using pre-generated AI voice (Microsoft Neural TTS) */

(function () {
  'use strict';

  /* Map page filenames to audio files */
  var AUDIO_MAP = {
    'index.html':                   'audio/index.mp3',
    'manifesto.html':               'audio/manifesto.mp3',
    'ai-reflection-on-truth.html':  'audio/ai-reflection.mp3',
    'christian-framework-ai.html':  'audio/christian-framework.mp3',
    'about.html':                   'audio/about.mp3'
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
  bar.appendChild(progressWrap);
  bar.appendChild(timeDisplay);
  bar.appendChild(speedLabel);

  /* Insert before main */
  var mainEl = document.querySelector('main');
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

  audio.addEventListener('play', function () {
    btnPlay.style.display = 'none';
    btnPause.style.display = '';
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
