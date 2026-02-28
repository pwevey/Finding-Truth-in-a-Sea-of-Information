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

  /* Determine current page name */
  var path = window.location.pathname;
  var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

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

      /* Insert TOC after .document-meta (article pages) or at top of main */
      var tocAnchor = main.querySelector('.document-meta');
      if (tocAnchor) {
        tocAnchor.parentNode.insertBefore(tocWrapper, tocAnchor.nextSibling);
      } else {
        main.insertBefore(tocWrapper, main.firstChild);
      }
    }

    /* ---- Social Sharing Buttons (article pages only) ---- */
    var ARTICLE_PAGES = [
      'manifesto.html',
      'ai-reflection-on-truth.html',
      'christian-framework-ai.html',
      'accuracy-is-not-truth.html'
    ];

    /* Helper: build a share bar */
    function createShareBar() {
      var pageUrl = encodeURIComponent(window.location.href);
      var pageTitle = encodeURIComponent(document.title);

      var shareBar = document.createElement('div');
      shareBar.className = 'share-bar';
      shareBar.setAttribute('aria-label', 'Share this article');

      var shareLabel = document.createElement('span');
      shareLabel.className = 'share-label';
      shareLabel.textContent = 'Share';
      shareBar.appendChild(shareLabel);

      var shares = [
        { name: 'X', url: 'https://x.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle, icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
        { name: 'Facebook', url: 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl, icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
        { name: 'Copy link', url: '', icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' }
      ];

      shares.forEach(function (s) {
        var btn = document.createElement('a');
        btn.className = 'share-btn';
        btn.setAttribute('aria-label', s.name);
        btn.setAttribute('title', s.name);
        btn.innerHTML = s.icon;

        if (s.name === 'Copy link') {
          btn.href = '#';
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href).then(function () {
              btn.classList.add('copied');
              btn.setAttribute('title', 'Copied!');
              setTimeout(function () {
                btn.classList.remove('copied');
                btn.setAttribute('title', 'Copy link');
              }, 2000);
            });
          });
        } else {
          btn.href = s.url;
          btn.target = '_blank';
          btn.rel = 'noopener noreferrer';
        }

        shareBar.appendChild(btn);
      });

      return shareBar;
    }

    if (ARTICLE_PAGES.indexOf(page) !== -1) {
      /* Top share bar — insert after .document-meta or at top of main */
      var topShare = createShareBar();
      topShare.classList.add('share-bar-top');
      var metaEl = main.querySelector('.document-meta');
      if (metaEl) {
        metaEl.parentNode.insertBefore(topShare, metaEl.nextSibling);
      } else {
        main.insertBefore(topShare, main.firstChild);
      }

      /* Bottom share bar */
      main.appendChild(createShareBar());
    }

    /* ---- Related Articles (article pages only) ---- */
    var ARTICLES = {
      'manifesto.html': {
        title: 'Finding Truth in a Sea of Information',
        desc: 'Human-authored manifesto on AI, truth, and faith.'
      },
      'ai-reflection-on-truth.html': {
        title: 'AI Reflection on the Nature of Truth',
        desc: 'Philosophical overview of truth and how LLMs function.'
      },
      'christian-framework-ai.html': {
        title: 'Summary of a Christian Framework for Understanding AI',
        desc: 'AI as a tool and truth grounded in God.'
      },
      'accuracy-is-not-truth.html': {
        title: 'Accuracy Is Not Truth: AI in a Post-Epistemic World',
        desc: 'Truth-bias, hallucinations, deepfakes, and human oversight.'
      }
    };

    if (ARTICLE_PAGES.indexOf(page) !== -1) {
      var relatedSection = document.createElement('aside');
      relatedSection.className = 'related-articles';
      relatedSection.setAttribute('aria-label', 'Related articles');

      var relTitle = document.createElement('h2');
      relTitle.textContent = 'You May Also Be Interested In';
      relatedSection.appendChild(relTitle);

      var relList = document.createElement('ul');

      Object.keys(ARTICLES).forEach(function (key) {
        if (key === page) return;
        var art = ARTICLES[key];
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = key;
        a.textContent = art.title;
        li.appendChild(a);
        var small = document.createElement('small');
        small.textContent = ' — ' + art.desc;
        li.appendChild(small);
        relList.appendChild(li);
      });

      relatedSection.appendChild(relList);
      main.appendChild(relatedSection);
    }

    /* ---- Utterances Comments (article pages only) ---- */
    if (ARTICLE_PAGES.indexOf(page) !== -1) {
      var commentsSection = document.createElement('div');
      commentsSection.className = 'comments-section';

      var commentsTitle = document.createElement('h2');
      commentsTitle.textContent = 'Comments';
      commentsSection.appendChild(commentsTitle);

      var utterances = document.createElement('script');
      utterances.src = 'https://utteranc.es/client.js';
      utterances.setAttribute('repo', 'pwevey/Finding-Truth-in-a-Sea-of-Information');
      utterances.setAttribute('issue-term', 'pathname');
      utterances.setAttribute('theme', document.documentElement.getAttribute('data-theme') === 'dark' ? 'github-dark' : 'github-light');
      utterances.setAttribute('crossorigin', 'anonymous');
      utterances.async = true;
      commentsSection.appendChild(utterances);

      main.appendChild(commentsSection);
    }
  });

  /* ---- Back to Top Button (all pages) ---- */
  var topBtn = document.createElement('button');
  topBtn.className = 'back-to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.title = 'Back to top';
  topBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(topBtn);

  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var scrollTimeout;
  window.addEventListener('scroll', function () {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(function () {
      scrollTimeout = null;
      if (window.scrollY > 400) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
    }, 100);
  });
})();
