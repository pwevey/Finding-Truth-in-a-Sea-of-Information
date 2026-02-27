/* reader.js — Voice reader using the Web Speech API */

(function () {
  'use strict';

  var synth = window.speechSynthesis;
  if (!synth) return;

  var utterance = null;
  var playing = false;
  var paused = false;
  var bestVoice = null;
  var voicesReady = false;

  /* ---- Voice selection ---- */
  /*
   * Ranked keyword fragments to match against voice names.
   * Prefer natural/neural voices, then enhanced, then standard.
   * Matching is partial and case-insensitive.
   */
  var VOICE_PRIORITY = [
    'online (natural)',       /* Edge neural voices */
    'google us english',      /* Chrome remote voice */
    'google uk english',      /* Chrome remote voice */
    '(enhanced)',             /* macOS enhanced voices */
    '(premium)',              /* some systems label premium */
    'natural',                /* generic neural label */
    'zira',                   /* Windows Zira — decent quality */
    'david',                  /* Windows David */
    'samantha',               /* macOS */
    'daniel',                 /* macOS */
    'alex'                    /* macOS */
  ];

  function selectBestVoice() {
    var voices = synth.getVoices();
    if (!voices.length) return null;

    /* Filter to English voices first */
    var enVoices = [];
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang && voices[i].lang.toLowerCase().indexOf('en') === 0) {
        enVoices.push(voices[i]);
      }
    }
    if (!enVoices.length) enVoices = voices;

    /* Try priority keywords via partial match */
    for (var p = 0; p < VOICE_PRIORITY.length; p++) {
      var keyword = VOICE_PRIORITY[p];
      for (var v = 0; v < enVoices.length; v++) {
        if (enVoices[v].name.toLowerCase().indexOf(keyword) !== -1) {
          return enVoices[v];
        }
      }
    }

    /* Fallback: first English voice */
    return enVoices[0];
  }

  function loadVoices() {
    bestVoice = selectBestVoice();
    voicesReady = true;
  }

  loadVoices();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }
  /* Chrome sometimes needs a delay */
  setTimeout(loadVoices, 100);
  setTimeout(loadVoices, 500);

  /* ---- Build UI ---- */
  var bar = document.createElement('div');
  bar.className = 'reader-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Voice reader controls');

  /* Listen label with speaker icon */
  var listenLabel = document.createElement('span');
  listenLabel.className = 'reader-label';
  listenLabel.textContent = '\uD83D\uDD0A Listen';

  var btnPlay = makeBtn('\u25B6', 'reader-play', 'Play', handlePlay);
  var btnPause = makeBtn('\u23F8', 'reader-pause', 'Pause', handlePause);
  var btnStop = makeBtn('\u23F9', 'reader-stop', 'Stop', handleStop);

  var divider = document.createElement('span');
  divider.className = 'reader-divider';

  var speedLabel = document.createElement('label');
  speedLabel.className = 'reader-speed-label';
  speedLabel.textContent = 'Speed ';
  var speedSelect = document.createElement('select');
  speedSelect.className = 'reader-speed';
  speedSelect.setAttribute('aria-label', 'Reading speed');
  [
    { value: '0.8',  text: '0.8\u00D7' },
    { value: '1',    text: '1\u00D7' },
    { value: '1.2',  text: '1.2\u00D7' },
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

  var status = document.createElement('span');
  status.className = 'reader-status';
  status.textContent = '';

  btnPause.style.display = 'none';
  btnStop.style.display = 'none';

  bar.appendChild(listenLabel);
  bar.appendChild(btnPlay);
  bar.appendChild(btnPause);
  bar.appendChild(btnStop);
  bar.appendChild(divider);
  bar.appendChild(speedLabel);
  bar.appendChild(status);

  /* Insert after nav (before main) */
  var mainEl = document.querySelector('main');
  if (mainEl) {
    mainEl.parentNode.insertBefore(bar, mainEl);
  }

  /* ---- Helpers ---- */
  function makeBtn(symbol, cls, ariaLabel, handler) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = symbol;
    b.setAttribute('aria-label', ariaLabel);
    b.setAttribute('title', ariaLabel);
    b.addEventListener('click', handler);
    return b;
  }

  function getReadableText() {
    var el = document.querySelector('main');
    if (!el) return '';
    var clone = el.cloneNode(true);
    var skip = clone.querySelectorAll('script, style, .reader-bar');
    for (var i = 0; i < skip.length; i++) {
      skip[i].parentNode.removeChild(skip[i]);
    }
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  /* ---- Handlers ---- */
  function handlePlay() {
    /* Re-check voices if not loaded yet */
    if (!bestVoice) loadVoices();

    if (paused && utterance) {
      synth.resume();
      paused = false;
      playing = true;
      updateUI();
      return;
    }

    synth.cancel();

    var text = getReadableText();
    if (!text) return;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(speedSelect.value);
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = function () {
      playing = false;
      paused = false;
      utterance = null;
      updateUI();
    };

    utterance.onerror = function () {
      playing = false;
      paused = false;
      utterance = null;
      updateUI();
    };

    synth.speak(utterance);
    playing = true;
    paused = false;
    updateUI();
  }

  function handlePause() {
    if (playing && !paused) {
      synth.pause();
      paused = true;
      playing = false;
      updateUI();
    }
  }

  function handleStop() {
    synth.cancel();
    playing = false;
    paused = false;
    utterance = null;
    updateUI();
  }

  function updateUI() {
    if (playing) {
      btnPlay.style.display = 'none';
      btnPause.style.display = '';
      btnStop.style.display = '';
      status.innerHTML = '<span class="reader-dot reader-dot-playing"></span>Reading';
    } else if (paused) {
      btnPlay.style.display = '';
      btnPlay.textContent = '\u25B6';
      btnPlay.setAttribute('aria-label', 'Resume');
      btnPlay.setAttribute('title', 'Resume');
      btnPause.style.display = 'none';
      btnStop.style.display = '';
      status.innerHTML = '<span class="reader-dot reader-dot-paused"></span>Paused';
    } else {
      btnPlay.style.display = '';
      btnPlay.textContent = '\u25B6';
      btnPlay.setAttribute('aria-label', 'Play');
      btnPlay.setAttribute('title', 'Play');
      btnPause.style.display = 'none';
      btnStop.style.display = 'none';
      status.textContent = '';
    }
  }

  /* Speed change while playing */
  speedSelect.addEventListener('change', function () {
    if (playing || paused) {
      synth.cancel();
      playing = false;
      paused = false;
      handlePlay();
    }
  });

  /* Cleanup on page unload */
  window.addEventListener('beforeunload', function () {
    synth.cancel();
  });

})();
