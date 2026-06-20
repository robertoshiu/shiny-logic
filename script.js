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

  // A4: where CSS scroll-driven timelines are supported (and motion is allowed),
  // CSS owns .reveal entry via animation-timeline:view() — don't also add .is-in,
  // or the reveal animates twice.
  var SD_SUPPORTED = (window.CSS && CSS.supports && CSS.supports("animation-timeline: view()")
    && window.matchMedia("(prefers-reduced-motion: no-preference)").matches);

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
        if (!SD_SUPPORTED) el.classList.add("is-in");
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
 * Layout: decorative compute-fabric field
 *   – cyan dots (decorative)
 *   – accent dots (decorative)
 *
 * The grid columns are calculated from the container's rendered width so the
 * aspect-ratio panel fills naturally at any breakpoint.
 */
(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  var TOTAL_DOTS  = 240;
  var GOLD_COUNT  = 24;  // sparse decorative accent

  // Stagger timing (ms between each dot appearing after section enters view)
  var STAGGER_MS  = 8;   // fast stagger wave across the field
  var BASE_DELAY  = 120; // initial pause after .is-in fires

  // ── Targets ──────────────────────────────────────────────────────────────
  // Both the home (#compute) and Technology (#tech-compute) pages render the
  // same decorative compute-fabric field. They share the layout but use page-scoped
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
    // Spread the accent dots evenly across the grid rather
    // than clustering them at the end — reflects real NVLink topology diversity.
    var goldPositions = new Set();
    var step = TOTAL_DOTS / GOLD_COUNT;
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

/* =========================================================================
   IIFE #4 — Theme manager (light/dark)
   - toggles <html data-theme>, persists sl-theme
   - wires both desktop (#themeToggle) and mobile (#themeToggleMobile)
   - updates aria-pressed / aria-label + <meta name="theme-color">
   - IIFE-wrapped, no window.* global added
   ========================================================================= */
(function () {
  "use strict";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("sl-theme", theme); } catch (e) {}
    updateMetaThemeColor(theme);
    syncToggleAria(theme);
  }

  function updateMetaThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#F5F5F7" : "#07090C");
  }

  function syncToggleAria(theme) {
    // Theme-aware: dark shows "switch to light", light shows "switch to dark".
    var labelKey = theme === "dark" ? "theme.toggleAria" : "theme.toggleAriaToDark";
    var lang = document.documentElement.lang;
    var dict = window.I18N && window.I18N[lang];
    var label = (dict && dict[labelKey]) || (dict && dict["theme.toggleAria"]) || "Switch theme";
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", label);
    });
  }

  function bindToggle(btn) {
    btn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "dark";
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  // Init: 與 no-FOUC script 一致(no-FOUC 已設好 data-theme,這裡只 sync UI)
  function init() {
    var theme = currentTheme();
    updateMetaThemeColor(theme);
    syncToggleAria(theme);
    document.querySelectorAll("#themeToggle, #themeToggleMobile").forEach(bindToggle);
    // i18n owns the toggle's static aria-label via data-i18n-attr and re-applies
    // it on every language switch, clobbering the theme-aware label. Re-assert
    // ownership after each locale change so the wording stays direction-correct.
    document.addEventListener("sl:langchange", function () {
      syncToggleAria(currentTheme());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* =========================================================================
   IIFE #5 — Hero parallax (index.html only) + off-screen video pause
   - parallax moves ONLY .hero__inner (never .reveal), depth 0.3, ≤5% vh
   - matchMedia(prefers-reduced-motion) + change listener kills motion
   - rAF-throttled; IntersectionObserver pauses rAF when hero off-screen
   - no-ops when .hero / .hero__inner absent (safe on other pages)
   - merged IO video pause for init.mp4 (.hero__video)
   ========================================================================= */
(function () {
  "use strict";

  var hero = document.querySelector(".hero");
  var heroInner = document.querySelector(".hero__inner");
  if (!hero || !heroInner) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // A5: hero video scroll-zoom target (index only). Shares this IIFE's
  // reduced-motion guard + IntersectionObserver pause. No-ops if absent.
  var heroVideo = document.querySelector(".hero__video");

  var isActive = false;
  var ticking = false;

  function update() {
    if (!isActive) { ticking = false; return; }
    var rect = hero.getBoundingClientRect();
    var vh = window.innerHeight;
    var scrolled = -rect.top;
    var total = hero.offsetHeight - vh;
    var progress = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
    // depth 0.3, ≤5% vh max
    var yOffset = progress * vh * -0.05 * 0.3;
    heroInner.style.transform = "translate3d(0, " + yOffset.toFixed(2) + "px, 0)";
    // A5: subtle depth — capped scale 1 -> 1.06 across hero scroll.
    if (heroVideo) {
      heroVideo.style.transform = "scale(" + (1 + Math.min(progress, 1) * 0.06).toFixed(4) + ")";
    }
    ticking = false;
  }

  function onScroll() {
    if (!isActive || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function startParallax() {
    if (prefersReducedMotion.matches) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isActive = entry.isIntersecting;
        if (isActive) onScroll();
      });
    }, { rootMargin: "50% 0px" });
    io.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function onMotionChange() {
    if (prefersReducedMotion.matches) {
      heroInner.style.transform = "";
      if (heroVideo) heroVideo.style.transform = "";
      isActive = false;
    }
  }
  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener("change", onMotionChange);
  } else if (prefersReducedMotion.addListener) {
    prefersReducedMotion.addListener(onMotionChange);
  }

  if (!prefersReducedMotion.matches) {
    startParallax();
  }

  // Off-screen video pause for init.mp4 (merged into this module to save resources)
  if (heroVideo) {
    var videoIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = heroVideo.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          heroVideo.pause();
        }
      });
    }, { rootMargin: "20% 0px" });
    videoIO.observe(heroVideo);
  }
})();

/* =========================================================================
   IIFE #6 — Contact form submit lifecycle (contact.html only)
   - <form id="contactForm" novalidate> has no backend; this wires the
     client-side success flow so the styled micro-states are reachable.
   - On submit: preventDefault; validate via checkValidity()/reportValidity()
     (novalidate is on, so we drive native validation ourselves); on pass,
     flip .btn--primary to .is-submitting + disabled, hide the form, then
     reveal #contactConfirm with .is-visible and move focus to it for SR.
   - IIFE-wrapped, no window.* global; no-ops on pages without the form.
   ========================================================================= */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  var confirmEl = document.getElementById("contactConfirm");
  if (!form || !confirmEl) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Drive native constraint validation (form has novalidate).
    if (typeof form.checkValidity === "function" && !form.checkValidity()) {
      if (typeof form.reportValidity === "function") form.reportValidity();
      return;
    }

    var submitBtn = form.querySelector(".btn--primary");
    if (submitBtn) {
      submitBtn.classList.add("is-submitting");
      submitBtn.setAttribute("disabled", "");
    }

    // No backend yet — reveal the styled success panel directly.
    form.hidden = true;
    confirmEl.classList.add("is-visible");
    if (confirmEl.getAttribute("tabindex") === null) {
      confirmEl.setAttribute("tabindex", "-1");
    }
    if (typeof confirmEl.focus === "function") confirmEl.focus();
  });
})();

(function(){ "use strict"; var scan=document.querySelector(".wafer-scan"); if(!scan) return; var svg=scan.ownerSVGElement||scan.closest("svg"); if(!svg||typeof svg.pauseAnimations!=="function") return; var mq=matchMedia("(prefers-reduced-motion: reduce)"); function apply(){ try{ mq.matches?svg.pauseAnimations():svg.unpauseAnimations(); }catch(e){} } apply(); mq.addEventListener?mq.addEventListener("change",apply):mq.addListener(apply); })();
