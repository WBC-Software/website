/* WBC Software — minimal interaction layer. No dependencies. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasObserver = 'IntersectionObserver' in window;

  /* ── Language ───────────────────────────────────────────────────────── *
   * Runs first, before anything else. This script is synchronous and sits
   * at the end of <body>, so the swap happens before the first paint and a
   * Portuguese visitor never sees the English markup flash past.          */

  var DICT = window.WBC_I18N || {};
  var STORE_KEY = 'wbc-lang';
  var lang = 'en';

  function supported(value) {
    return value && Object.prototype.hasOwnProperty.call(DICT, value) ? value : null;
  }

  function preferredLang() {
    // Explicit ?lang= wins, so a link can point at one language.
    var param = null;
    try {
      param = new URLSearchParams(window.location.search).get('lang');
    } catch (e) { /* no URLSearchParams: fall through */ }
    if (supported(param)) return param;

    var stored = null;
    try { stored = window.localStorage.getItem(STORE_KEY); } catch (e) { /* blocked */ }
    if (supported(stored)) return stored;

    var nav = (navigator.language || 'en').toLowerCase();
    return nav.indexOf('pt') === 0 ? 'pt' : 'en';
  }

  function t(key) {
    var table = DICT[lang] || {};
    return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : key;
  }

  function applyLang(next, remember) {
    lang = supported(next) || 'en';

    document.documentElement.setAttribute('lang', t('meta.lang'));
    document.title = t('meta.title');

    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));

    var nodes = document.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(nodes, function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    var labelled = document.querySelectorAll('[data-i18n-aria-label]');
    Array.prototype.forEach.call(labelled, function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });

    // WhatsApp links keep their number but carry a translated opening message.
    var waLinks = document.querySelectorAll('[data-wa]');
    Array.prototype.forEach.call(waLinks, function (el) {
      var base = el.getAttribute('href').split('?')[0];
      el.setAttribute('href', base + '?text=' + encodeURIComponent(t('cta.waMessage')));
    });

    var buttons = document.querySelectorAll('.lang-btn');
    Array.prototype.forEach.call(buttons, function (el) {
      el.setAttribute('aria-pressed', String(el.getAttribute('data-lang') === lang));
    });

    if (remember) {
      try { window.localStorage.setItem(STORE_KEY, lang); } catch (e) { /* blocked */ }
    }
  }

  applyLang(preferredLang(), false);

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.lang-btn');
    if (!button) return;
    applyLang(button.getAttribute('data-lang'), true);
    // applyLang resets the toggle's label from the dictionary, so restore
    // whichever state the menu is actually in.
    if (toggle) {
      toggleLabel.textContent = toggle.getAttribute('aria-expanded') === 'true'
        ? t('a11y.menuClose') : t('a11y.menuOpen');
    }
  });

  /* ── Navigation background ──────────────────────────────────────────── */

  var nav = document.getElementById('nav');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ────────────────────────────────────────────────────── */

  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var toggleLabel = toggle.querySelector('.sr-only');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? t('a11y.menuClose') : t('a11y.menuOpen');
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      menu.removeAttribute('inert');
    } else {
      menu.setAttribute('inert', '');
    }
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  var desktop = window.matchMedia('(min-width: 880px)');
  var closeOnDesktop = function (event) { if (event.matches) setMenu(false); };

  if (desktop.addEventListener) {
    desktop.addEventListener('change', closeOnDesktop);
  } else if (desktop.addListener) {
    desktop.addListener(closeOnDesktop);
  }

  /* ── Reveal on scroll ───────────────────────────────────────────────── */

  var revealables = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !hasObserver) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) {
      reveal.observe(el);
    });
  }

  /* ── Scrollspy: active nav link + active gutter label ───────────────── */

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));

  if (hasObserver && sections.length) {
    var visible = [];

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var index = visible.indexOf(entry.target);
        if (entry.isIntersecting && index === -1) visible.push(entry.target);
        if (!entry.isIntersecting && index !== -1) visible.splice(index, 1);
      });

      // Topmost visible section in document order wins.
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (visible.indexOf(sections[i]) !== -1) { current = sections[i]; break; }
      }

      sections.forEach(function (section) {
        var gutter = section.querySelector('.gutter');
        if (gutter) gutter.classList.toggle('is-active', section === current);
      });

      navLinks.forEach(function (link) {
        if (current && link.getAttribute('href') === '#' + current.id) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px' });

    sections.forEach(function (section) { spy.observe(section); });
  }
})();
