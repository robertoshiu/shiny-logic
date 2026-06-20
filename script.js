/* =========================================================================
   顯藝科技 ShinyLogic — core interactions (vanilla, defer-loaded)
   - IntersectionObserver scroll reveal (+ staggered children via --i)
   - count-up counters for [data-count]
   - nav scrolled state, smooth anchors, mobile menu
   - all motion guarded by prefers-reduced-motion
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     Number formatting helper for counters
  ---------------------------------------------------------------------- */
  function formatNumber(value, decimals) {
    var n = Number(value).toFixed(decimals);
    var parts = n.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // thin grouping
    return parts.join(".");
  }

  function renderCounter(el, value) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = prefix + formatNumber(value, decimals) + suffix;
  }

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";

    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);

    // reserve width to avoid layout shift
    renderCounter(el, target);
    var finalWidth = el.getBoundingClientRect().width;
    if (finalWidth) el.style.minWidth = finalWidth + "px";

    if (reduceMotion) {
      renderCounter(el, target);
      return;
    }

    var duration = 1400;
    var start = null;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var current = target * easeOut(p);
      renderCounter(el, decimals > 0 ? current : Math.round(current));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        renderCounter(el, target);
      }
    }
    renderCounter(el, 0);
    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------------------
     Reveal on scroll + counter trigger
  ---------------------------------------------------------------------- */
  function applyStagger(root) {
    // assign incremental --i to direct reveal children that don't have one
    var kids = root.querySelectorAll("[data-stagger] > *");
    Array.prototype.forEach.call(kids, function (child, i) {
      if (!child.style.getPropertyValue("--i")) {
        child.style.setProperty("--i", i);
      }
    });
  }

  function fireCounters(scope) {
    var counters = scope.querySelectorAll("[data-count]");
    Array.prototype.forEach.call(counters, function (c) { animateCounter(c); });
  }

  function initReveal() {
    var revealEls = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(revealEls, function (el) {
        el.classList.add("is-in");
        fireCounters(el);
      });
      return;
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        applyStagger(el);
        el.classList.add("is-in");
        fireCounters(el);
        obs.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });

    // counters that aren't inside a .reveal (defensive)
    var loose = document.querySelectorAll("[data-count]");
    Array.prototype.forEach.call(loose, function (c) {
      if (!c.closest(".reveal")) {
        var io2 = new IntersectionObserver(function (es, o) {
          es.forEach(function (e) {
            if (e.isIntersecting) { animateCounter(e.target); o.unobserve(e.target); }
          });
        }, { threshold: 0.4 });
        io2.observe(c);
      }
    });
  }

  /* ----------------------------------------------------------------------
     Nav: scrolled state + mobile toggle + smooth anchors
  ---------------------------------------------------------------------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.getElementById("navToggle");
    var mobile = document.getElementById("navMobile");

    if (nav) {
      var onScroll = function () {
        if (window.scrollY > 24) nav.classList.add("is-scrolled");
        else nav.classList.remove("is-scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    function closeMenu() {
      if (!toggle || !mobile) return;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟選單");
      mobile.classList.remove("is-open");
    }

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        toggle.setAttribute("aria-label", open ? "開啟選單" : "關閉選單");
        mobile.classList.toggle("is-open", !open);
      });
      Array.prototype.forEach.call(mobile.querySelectorAll("a"), function (a) {
        a.addEventListener("click", closeMenu);
      });
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
    }

    // smooth anchor scrolling (respect reduced motion)
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history.pushState) history.pushState(null, "", id);
      });
    });
  }

  /* ----------------------------------------------------------------------
     Boot
  ---------------------------------------------------------------------- */
  function init() {
    initReveal();
    initNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* === architecture === */
/* =========================================================================
   #architecture — 03 / ARCHITECTURE
   Accordion + keyboard navigation for the six-layer decision pipeline stack.

   Contract:
   - Runs after core script.js (DOM ready, IntersectionObserver hooks set).
   - Scoped to #architecture only; all queries are contained within the section.
   - Idempotent: early-return if already initialized.
   - Respects prefers-reduced-motion for body transitions.
   - Keyboard: Enter/Space (native button), ArrowUp/ArrowDown move focus.
   ========================================================================= */

(function () {
  'use strict';

  /* ── guard against double-init ─────────────────────────────────────────── */
  const INIT_KEY = 'data-arch-init';
  const section  = document.getElementById('architecture');
  if (!section || section.hasAttribute(INIT_KEY)) return;
  section.setAttribute(INIT_KEY, '1');

  /* ── query all layer headers ────────────────────────────────────────────── */
  const buttons = Array.from(
    section.querySelectorAll('.s-arch__header')
  );

  if (buttons.length === 0) return;

  /* ── helpers ────────────────────────────────────────────────────────────── */

  /**
   * Returns the body panel controlled by a button.
   * @param {HTMLButtonElement} btn
   * @returns {HTMLElement|null}
   */
  function getBody(btn) {
    const id = btn.getAttribute('aria-controls');
    return id ? section.querySelector('#' + id) : null;
  }

  /**
   * Returns the layer wrapper element for a button.
   * @param {HTMLButtonElement} btn
   * @returns {HTMLElement|null}
   */
  function getLayer(btn) {
    return btn.closest('.s-arch__layer');
  }

  /**
   * Open one layer; close all others (single-open accordion).
   * @param {HTMLButtonElement} targetBtn
   */
  function openLayer(targetBtn) {
    buttons.forEach(function (btn) {
      const body  = getBody(btn);
      const layer = getLayer(btn);
      const isTarget = btn === targetBtn;

      btn.setAttribute('aria-expanded', isTarget ? 'true' : 'false');

      if (body) {
        if (isTarget) {
          /* open: remove hidden attr first so CSS transition can animate */
          body.removeAttribute('hidden');
          /* rAF pair: one frame to let display kick in, then class for transition */
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              body.classList.add('is-open');
            });
          });
        } else {
          /* close: remove class, wait for transition, then re-add hidden */
          body.classList.remove('is-open');
          body.addEventListener(
            'transitionend',
            function onEnd(e) {
              /* only act on the max-height transition to avoid early trigger */
              if (e.propertyName !== 'max-height') return;
              body.removeEventListener('transitionend', onEnd);
              /* only hide if it's still supposed to be closed */
              if (btn.getAttribute('aria-expanded') !== 'true') {
                body.setAttribute('hidden', '');
              }
            }
          );
        }
      }

      if (layer) {
        layer.setAttribute('data-active', isTarget ? 'true' : 'false');
      }
    });
  }

  /* ── initialise from current DOM state ─────────────────────────────────── */
  buttons.forEach(function (btn) {
    const body     = getBody(btn);
    const layer    = getLayer(btn);
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    if (body) {
      if (expanded) {
        body.removeAttribute('hidden');
        /* open immediately, no transition on init */
        body.classList.add('is-open');
      } else {
        body.setAttribute('hidden', '');
        body.classList.remove('is-open');
      }
    }

    if (layer) {
      layer.setAttribute('data-active', expanded ? 'true' : 'false');
    }
  });

  /* ── click handler ──────────────────────────────────────────────────────── */
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* toggle: clicking an open layer keeps it open (spec: single-open) */
      if (btn.getAttribute('aria-expanded') === 'true') return;
      openLayer(btn);
    });
  });

  /* ── keyboard: ArrowUp / ArrowDown move focus between headers ──────────── */
  section.addEventListener('keydown', function (e) {
    if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;

    const active = document.activeElement;
    const idx    = buttons.indexOf(active);
    if (idx === -1) return;

    e.preventDefault(); /* prevent page scroll */

    if (e.key === 'ArrowDown') {
      const next = buttons[idx + 1];
      if (next) next.focus();
    } else {
      const prev = buttons[idx - 1];
      if (prev) prev.focus();
    }
  });

  /* ── Home / End keys ────────────────────────────────────────────────────── */
  section.addEventListener('keydown', function (e) {
    if (e.key === 'Home' && buttons.includes(document.activeElement)) {
      e.preventDefault();
      buttons[0].focus();
    }
    if (e.key === 'End' && buttons.includes(document.activeElement)) {
      e.preventDefault();
      buttons[buttons.length - 1].focus();
    }
  });

  /* ── reduced-motion: instant open/close (no CSS transition) ────────────── */
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  if (prefersReduced.matches) {
    /* Override openLayer to skip requestAnimationFrame double-tap */
    const originalOpenLayer = openLayer;
    openLayer = function (targetBtn) { // eslint-disable-line no-func-assign
      buttons.forEach(function (btn) {
        const body  = getBody(btn);
        const layer = getLayer(btn);
        const isTarget = btn === targetBtn;
        btn.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
        if (body) {
          if (isTarget) {
            body.removeAttribute('hidden');
            body.classList.add('is-open');
          } else {
            body.classList.remove('is-open');
            body.setAttribute('hidden', '');
          }
        }
        if (layer) layer.setAttribute('data-active', isTarget ? 'true' : 'false');
      });
    };
    void originalOpenLayer; /* suppress unused-var warning */

    /* re-wire click handlers with the synchronous version */
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-expanded') === 'true') return;
        openLayer(btn);
      });
    });
  }

}());

/* === compute === */
/**
 * compute.js — #compute section GPU dot grid + staggered reveal
 * Wrapped in an IIFE; runs after core script.js (DOM is ready).
 * Idempotent: checks for existing dots before rendering.
 *
 * Layout: 248 cells total
 *   – 216 cyan  (GB300 NVL72)
 *   – 32  gold  (HGX B300)
 *
 * The grid columns are calculated from the container's rendered width so the
 * aspect-ratio panel fills naturally at any breakpoint.
 */
(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  var TOTAL_DOTS  = 248;
  var GOLD_COUNT  = 32;  // HGX B300 (remainder are GB300 NVL72 cyan)

  // Stagger timing (ms between each dot appearing after section enters view)
  var STAGGER_MS  = 8;   // fast wave — 248 × 8ms ≈ 2s total sweep
  var BASE_DELAY  = 120; // initial pause after .is-in fires

  // ── Targets ──────────────────────────────────────────────────────────────
  // Both the home (#compute) and Technology (#tech-compute) pages render the
  // same 216 + 32 = 248 GPU grid. They share the layout but use page-scoped
  // BEM class names, so each target carries its own class scheme.
  //   home : .s-compute__dot.is-cyan / .is-gold  + staggered .is-visible wave
  //   tech : .s-tech-compute__dot--cyan / --gold (no wave; CSS shows on render)
  var TARGETS = [
    {
      containerId: 'compute-dots',
      sectionId:   'compute',
      dotClass:    's-compute__dot',
      cyanClass:   'is-cyan',
      goldClass:   'is-gold',
      wave:        true
    },
    {
      containerId: 'tech-compute-dots',
      sectionId:   'tech-compute',
      dotClass:    's-tech-compute__dot',
      cyanClass:   's-tech-compute__dot--cyan',
      goldClass:   's-tech-compute__dot--gold',
      wave:        false
    }
  ];

  for (var t = 0; t < TARGETS.length; t++) {
    initGrid(TARGETS[t]);
  }

  function initGrid(cfg) {
    // ── Guard — idempotent ──────────────────────────────────────────────────
    var container = document.getElementById(cfg.containerId);
    if (!container) return;
    if (container.dataset.rendered === 'true') return;
    container.dataset.rendered = 'true';

    // ── Build ordered dot sequence ──────────────────────────────────────────
    // Spread the 32 gold dots evenly across the grid (248/32 ≈ 7.75) rather
    // than clustering them at the end — reflects real NVLink topology diversity.
    var goldPositions = new Set();
    var step = TOTAL_DOTS / GOLD_COUNT; // 7.75
    for (var g = 0; g < GOLD_COUNT; g++) {
      goldPositions.add(Math.round(g * step + step / 2));
    }
    var ordered = [];
    for (var k = 0; k < TOTAL_DOTS; k++) {
      ordered.push(goldPositions.has(k) ? 'gold' : 'cyan');
    }

    // ── Render dots into DOM ────────────────────────────────────────────────
    var fragment = document.createDocumentFragment();
    var dots = [];

    for (var d = 0; d < TOTAL_DOTS; d++) {
      var isGold = ordered[d] === 'gold';
      var el = document.createElement('span');
      el.className = cfg.dotClass + ' ' + (isGold ? cfg.goldClass : cfg.cyanClass);
      el.setAttribute('title',
        isGold ? 'HGX B300 — Inference' : 'GB300 NVL72 — AI Training/Inference'
      );
      fragment.appendChild(el);
      dots.push(el);
    }

    container.appendChild(fragment);

    // Targets that don't use the wave render their dots immediately.
    if (!cfg.wave) return;

    // ── Staggered fade-in (triggered when section reveals) ──────────────────
    // Respects prefers-reduced-motion: if reduced, all dots appear instantly.
    function revealDots() {
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        for (var n = 0; n < dots.length; n++) {
          dots[n].classList.add('is-visible');
        }
        return;
      }

      for (var m = 0; m < dots.length; m++) {
        (function (dot, index) {
          setTimeout(function () {
            dot.classList.add('is-visible');
          }, BASE_DELAY + index * STAGGER_MS);
        })(dots[m], m);
      }
    }

    // ── Observe the section entering the viewport ───────────────────────────
    var section = document.getElementById(cfg.sectionId);
    if (!section) {
      // No reveal section — show dots immediately so they never stay hidden.
      revealDots();
      return;
    }

    var dotsFired = false;
    function maybeFire() {
      if (dotsFired) return;
      dotsFired = true;
      revealDots();
    }

    if (section.classList.contains('is-in')) {
      maybeFire();
    } else {
      // Watch for .is-in being added by the core IntersectionObserver.
      var mutObserver = new MutationObserver(function (mutations) {
        for (var mi = 0; mi < mutations.length; mi++) {
          var mu = mutations[mi];
          if (mu.type === 'attributes' && mu.attributeName === 'class') {
            if (section.classList.contains('is-in')) {
              maybeFire();
              mutObserver.disconnect();
            }
          }
        }
      });
      mutObserver.observe(section, { attributes: true, attributeFilter: ['class'] });

      // Fallback IntersectionObserver in case core script hasn't run yet.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            maybeFire();
            io.disconnect();
          }
        }, { threshold: 0.15 });
        io.observe(section);
      }
    }
  }

})();
