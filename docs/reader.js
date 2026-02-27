/* reader.js — Voice reader using the Web Speech API */

(function () {
  'use strict';

  var synth = window.speechSynthesis;
  if (!synth) return;

  var utterance = null;
  var playing = false;
  var paused = false;

  /* ---- Build UI ---- */
  var bar = document.createElement('div');
  bar.className = 'reader-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Voice reader controls');

  var btnPlay = btn('Play', 'reader-play', handlePlay);
  var btnPause = btn('Pause', 'reader-pause', handlePause);
  var btnStop = btn('Stop', 'reader-stop', handleStop);

  var speedLabel = document.createElement('label');
  speedLabel.className = 'reader-speed-label';
  speedLabel.textContent = 'Speed ';
  var speedSelect = document.createElement('select');
  speedSelect.className = 'reader-speed';
  speedSelect.setAttribute('aria-label', 'Reading speed');
  [
    { value: '0.75', text: '0.75x' },
    { value: '1',    text: '1x' },
    { value: '1.25', text: '1.25x' },
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

  bar.appendChild(btnPlay);
  bar.appendChild(btnPause);
  bar.appendChild(btnStop);
  bar.appendChild(speedLabel);
  bar.appendChild(status);

  /* Insert after nav (before main) */
  var main = document.querySelector('main');
  if (main) {
    main.parentNode.insertBefore(bar, main);
  }

  /* ---- Helpers ---- */
  function btn(label, cls, handler) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    b.addEventListener('click', handler);
    return b;
  }

  function getReadableText() {
    var el = document.querySelector('main');
    if (!el) return '';
    /* Clone to strip hidden elements and controls */
    var clone = el.cloneNode(true);
    /* Remove elements that shouldn't be read */
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

    /* Cancel any prior speech */
    synth.cancel();

    var text = getReadableText();
    if (!text) return;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(speedSelect.value);
    utterance.lang = 'en-US';

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
      status.textContent = 'Reading...';
    } else if (paused) {
      btnPlay.style.display = '';
      btnPlay.textContent = 'Resume';
      btnPause.style.display = 'none';
      btnStop.style.display = '';
      status.textContent = 'Paused';
    } else {
      btnPlay.style.display = '';
      btnPlay.textContent = 'Play';
      btnPause.style.display = 'none';
      btnStop.style.display = 'none';
      status.textContent = '';
    }
  }

  /* Speed change while playing */
  speedSelect.addEventListener('change', function () {
    if (playing || paused) {
      /* Restart with new rate — Speech API doesn't allow rate change mid-stream */
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
