/* ===== MCN DIGITAL STUDIO — EFFECTS.JS ===== */
/* Ripple effect en botones, scroll shadow en header */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     1. RIPPLE EFFECT en botones
     ---------------------------------------------------------------- */
  function addRipple(e) {
    const btn = e.currentTarget;
    const existing = btn.querySelector('.ripple');
    if (existing) existing.remove();

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
    `;
    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function initRipple() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.removeEventListener('click', addRipple);
      btn.addEventListener('click', addRipple);
    });
  }

  /* ----------------------------------------------------------------
     2. HEADER SCROLL SHADOW
     ---------------------------------------------------------------- */
  function initScrollShadow() {
    const header = document.querySelector('.top');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 8) {
        header.classList.add('top--scrolled');
      } else {
        header.classList.remove('top--scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------
     3. FADE-IN ANIMADO para cards al cargar
     ---------------------------------------------------------------- */
  function initFadeIn() {
    if (!('IntersectionObserver' in window)) return;

    var STAGGER_DELAY_MS = 40;
    var MAX_DELAY_MS = 300;

    var els = document.querySelectorAll('.card, .section, .kpi-card');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-fade-in-up');
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    els.forEach(function (el, i) {
      el.style.animationDelay = Math.min(i * STAGGER_DELAY_MS, MAX_DELAY_MS) + 'ms';
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------
     4. INICIALIZACIÓN
     ---------------------------------------------------------------- */
  function init() {
    initRipple();
    initScrollShadow();
    initFadeIn();

    // Re-init ripple si se agregan botones dinámicamente (MutationObserver ligero)
    const observer = new MutationObserver(function () {
      initRipple();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
