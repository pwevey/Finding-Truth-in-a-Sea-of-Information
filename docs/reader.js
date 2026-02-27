/* reader.js — Voice reader using the Web Speech API */

(function () {
  'use strict';

  var synth = window.speechSynthesis;
  if (!synth) return;

  var utterance = null;
  var playing = false;
  var paused = false;
  var bestVoice = null;

  /* ---- SVG Icons ---- */
  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  var ICON_STOP = '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>';
  var ICON_LISTEN = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;margin-right:4px;vertical-align:middle"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

  /* ---- Voice selection ---- */
  /*
   * Prefer high-quality voices available for free in modern browsers:
   * - Chrome: "Google US English" (natural-sounding, remote)
   * - Edge:   "Microsoft ... Online (Natural)" voices
   * - Safari: "Samantha (Enhanced)", "Daniel (Enhanced)"
   * - Firefox: best available en-US voice
   */
  var PREFERRED_VOICES = [
    'google us english',
    'google uk english female',
    'google uk english male',
    'microsoft aria online (natural)',
    'microsoft guy online (natural)',
    'microsoft jenny online (natural)',
    'microsoft ana online (natural)',
    'samantha (enhanced)',
    'daniel (enhanced)',
    'karen (enhanced)',
    'samantha',
    'alex',
    'daniel'
  ];

  function selectBestVoice() {
    var voices = synth.getVoices();
    if (!voices.length) return null;

    /* Try preferred voices in order */
    for (var i = 0; i < PREFERRED_VOICES.length; i++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].name.toLowerCase() === PREFERRED_VOICES[i]) {
          return voices[j];
        }
      }
    }

    /* Fallback: any English voice */
    for (var k = 0; k < voices.length; k++) {
      if (voices[k].lang && voices[k].lang.indexOf('en') === 0) {
        return voices[k];
      }
    }

    return voices[0];
  }

  /* Voices load asynchronously in some browsers */
  function loadVoices() {
    bestVoice = selectBestVoice();
  }

  loadVoices();
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }

  /* ---- Build UI ---- */
  var bar = document.createElement('div');
  bar.className = 'reader-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Voice reader controls');

  var listenLabel = document.createElement('span');
  listenLabel.className = 'reader-label';
  listenLabel.innerHTML = ICON_LISTEN + 'Listen';

  var btnPlay = iconBtn(ICON_PLAY, 'reader-play', 'Play', handlePlay);
  var btnPause = iconBtn(ICON_PAUSE, 'reader-pause', 'Pause', handlePause);
  var btnStop = iconBtn(ICON_STOP, 'reader-stop', 'Stop', handleStop);

  var divider = document.createElement('span');
  divider.className = 'reader-divider';

  var speedLabel = document.createElement('label');
  speedLabel.className = 'reader-speed-label';
  speedLabel.textContent = 'Speed ';
  var speedSelect = document.createElement('select');
  speedSelect.className = 'reader-speed';
  speedSelect.setAttribute('aria-label', 'Reading speed');
  [
    { value: '0.8',  text: '0.8x' },
    { value: '1',    text: '1x' },
    { value: '1.2',  text: '1.2x' },
    { value: '1.5',  text: '1.5x' },
    { value: '2',    text: '2x' }
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
  var main = document.querySelector('main');
  if (main) {
    main.parentNode.insertBefore(bar, main);
  }

  /* ---- Helpers ---- */
  function iconBtn(svgHTML, cls, ariaLabel, handler) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.innerHTML = svgHTML;
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

    /* Use the best voice we found */
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
      btnPlay.innerHTML = ICON_PLAY;
      btnPlay.setAttribute('aria-label', 'Resume');
      btnPlay.setAttribute('title', 'Resume');
      btnPause.style.display = 'none';
      btnStop.style.display = '';
      status.innerHTML = '<span class="reader-dot reader-dot-paused"></span>Paused';
    } else {
      btnPlay.style.display = '';
      btnPlay.innerHTML = ICON_PLAY;
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
