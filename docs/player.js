/* player.js — Podcast-style audio player for Truth & AI */

(function () {
  'use strict';

  var audio = new Audio();
  audio.preload = 'metadata';

  var tracks = document.querySelectorAll('.track');
  var btnPlay = document.getElementById('btn-play');
  var btnPause = document.getElementById('btn-pause');
  var btnStop = document.getElementById('btn-stop');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var progressBar = document.getElementById('progress-bar');
  var progressFill = document.getElementById('progress-fill');
  var timeCurrent = document.getElementById('time-current');
  var timeTotal = document.getElementById('time-total');
  var npTitle = document.getElementById('np-title');
  var npDesc = document.getElementById('np-desc');
  var speedSelect = document.getElementById('speed-select');

  var currentIndex = -1;
  var isPlaying = false;

  /* ---- Helpers ---- */

  function fmt(sec) {
    if (!sec || !isFinite(sec)) return '0:00';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ---- Load track durations ---- */

  function loadDurations() {
    var durationEls = document.querySelectorAll('.track-duration[data-src]');
    durationEls.forEach(function (el) {
      var tmp = new Audio(el.getAttribute('data-src'));
      tmp.preload = 'metadata';
      tmp.addEventListener('loadedmetadata', function () {
        el.textContent = fmt(tmp.duration);
      });
    });
  }
  loadDurations();

  /* ---- Select and play a track ---- */

  function selectTrack(index, autoplay) {
    if (index < 0 || index >= tracks.length) return;

    /* Remove active from all tracks */
    tracks.forEach(function (t) { t.classList.remove('track-active'); });

    currentIndex = index;
    var track = tracks[index];
    track.classList.add('track-active');

    var src = track.getAttribute('data-src');
    var title = track.querySelector('.track-title').textContent;
    var sub = track.querySelector('.track-sub').textContent;

    npTitle.textContent = title;
    npDesc.textContent = sub;

    audio.src = src;
    audio.playbackRate = parseFloat(speedSelect.value);
    progressFill.style.width = '0%';
    timeCurrent.textContent = '0:00';

    if (autoplay) {
      audio.play();
      showPause();
    } else {
      showPlay();
    }

    /* Scroll track into view */
    track.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showPlay() {
    isPlaying = false;
    btnPlay.style.display = '';
    btnPause.style.display = 'none';
    btnStop.style.display = 'none';
  }

  function showPause() {
    isPlaying = true;
    btnPlay.style.display = 'none';
    btnPause.style.display = '';
    btnStop.style.display = '';
  }

  /* ---- Player controls ---- */

  btnPlay.addEventListener('click', function () {
    if (currentIndex < 0) {
      selectTrack(0, true);
      return;
    }
    audio.play();
    showPause();
  });

  btnPause.addEventListener('click', function () {
    audio.pause();
    showPlay();
  });

  btnStop.addEventListener('click', function () {
    audio.pause();
    audio.currentTime = 0;
    showPlay();
    progressFill.style.width = '0%';
    timeCurrent.textContent = '0:00';
    if (currentIndex >= 0) {
      tracks[currentIndex].classList.remove('track-active');
    }
    currentIndex = -1;
    npTitle.textContent = 'Select a track to begin';
    npDesc.textContent = '';
  });

  btnPrev.addEventListener('click', function () {
    /* If more than 3 seconds in, restart. Otherwise go to previous. */
    if (audio.currentTime > 3 && currentIndex >= 0) {
      audio.currentTime = 0;
      return;
    }
    if (currentIndex > 0) {
      selectTrack(currentIndex - 1, isPlaying);
    }
  });

  btnNext.addEventListener('click', function () {
    if (currentIndex < tracks.length - 1) {
      selectTrack(currentIndex + 1, isPlaying);
    }
  });

  /* ---- Track list clicks ---- */

  tracks.forEach(function (track, i) {
    track.addEventListener('click', function (e) {
      /* Don't intercept clicks on the "read article" link */
      if (e.target.closest('.track-link')) return;
      selectTrack(i, true);
    });
  });

  /* ---- Progress bar ---- */

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    timeCurrent.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', function () {
    timeTotal.textContent = fmt(audio.duration);
  });

  progressBar.addEventListener('click', function (e) {
    if (!audio.duration) return;
    var rect = progressBar.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  /* ---- Auto-advance ---- */

  audio.addEventListener('ended', function () {
    if (currentIndex < tracks.length - 1) {
      selectTrack(currentIndex + 1, true);
    } else {
      showPlay();
    }
  });

  /* ---- Speed ---- */

  speedSelect.addEventListener('change', function () {
    audio.playbackRate = parseFloat(speedSelect.value);
  });

  /* ---- Keyboard shortcuts ---- */

  document.addEventListener('keydown', function (e) {
    /* Only when not focused on an input/select */
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (isPlaying) { audio.pause(); showPlay(); }
        else {
          if (currentIndex < 0) selectTrack(0, true);
          else { audio.play(); showPause(); }
        }
        break;
      case 'ArrowLeft':
        if (audio.duration) { audio.currentTime = Math.max(0, audio.currentTime - 10); }
        break;
      case 'ArrowRight':
        if (audio.duration) { audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) selectTrack(currentIndex - 1, isPlaying);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < tracks.length - 1) selectTrack(currentIndex + 1, isPlaying);
        break;
    }
  });

})();
