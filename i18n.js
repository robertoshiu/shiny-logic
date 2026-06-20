/* =========================================================================
   顯藝科技 ShinyLogic — i18n runtime (vanilla, defer-loaded)
   Loads AFTER i18n-dict.js (which defines window.I18N) and is defer-safe.

   Contract (§14.4):
   - On DOM ready: read localStorage['sl-lang'] (default 'zh-Hant'); apply the
     active dictionary to every [data-i18n] / [data-i18n-html] / [data-i18n-attr].
   - Set document.documentElement.lang to the active locale.
   - Wire every [data-lang] switcher button: set + persist + re-apply, no reload,
     update aria-pressed, keep all switchers in sync.
   - Missing key -> fall back to zh-Hant -> existing in-HTML text (never blank).
   - Guard if window.I18N is absent (page still readable with in-HTML 繁中).
   ========================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "sl-lang";
  var DEFAULT_LANG = "zh-Hant";
  var SUPPORTED = ["zh-Hant", "en", "zh-Hans"];

  var DICT = (typeof window !== "undefined" && window.I18N) ? window.I18N : null;

  /* ---- locale helpers -------------------------------------------------- */
  function normalizeLang(lang) {
    return SUPPORTED.indexOf(lang) !== -1 ? lang : DEFAULT_LANG;
  }

  function readLang() {
    var stored = null;
    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return normalizeLang(stored);
  }

  function persistLang(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  /* ---- dictionary lookup with fallback chain --------------------------- */
  /* Returns the resolved string for a key, or null if no locale defines it
     (caller then keeps the element's existing in-HTML text). */
  function lookup(key, lang) {
    if (!DICT) return null;
    var primary = DICT[lang];
    if (primary && Object.prototype.hasOwnProperty.call(primary, key)) {
      return primary[key];
    }
    var fallback = DICT[DEFAULT_LANG];
    if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) {
      return fallback[key];
    }
    return null; /* never blank — leave existing DOM text in place */
  }

  /* ---- apply dictionary to the document -------------------------------- */
  function applyText(lang) {
    var els = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(els, function (el) {
      var val = lookup(el.getAttribute("data-i18n"), lang);
      if (val !== null) el.textContent = val;
    });
  }

  function applyHtml(lang) {
    var els = document.querySelectorAll("[data-i18n-html]");
    Array.prototype.forEach.call(els, function (el) {
      var val = lookup(el.getAttribute("data-i18n-html"), lang);
      if (val !== null) el.innerHTML = val;
    });
  }

  /* data-i18n-attr="aria-label:ns.key;placeholder:ns.key2" */
  function applyAttrs(lang) {
    var els = document.querySelectorAll("[data-i18n-attr]");
    Array.prototype.forEach.call(els, function (el) {
      var spec = el.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec.split(";").forEach(function (pair) {
        pair = pair.trim();
        if (!pair) return;
        var ci = pair.indexOf(":");
        if (ci === -1) return;
        var attr = pair.slice(0, ci).trim();
        var key = pair.slice(ci + 1).trim();
        if (!attr || !key) return;
        var val = lookup(key, lang);
        if (val !== null) el.setAttribute(attr, val);
      });
    });
  }

  function applyAll(lang) {
    applyText(lang);
    applyHtml(lang);
    applyAttrs(lang);
    document.documentElement.lang = lang;
  }

  /* ---- switcher buttons ------------------------------------------------ */
  function syncSwitchers(lang) {
    var btns = document.querySelectorAll("[data-lang]");
    Array.prototype.forEach.call(btns, function (btn) {
      var isActive = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.classList.toggle("is-active", isActive);
    });
  }

  function setLang(lang) {
    lang = normalizeLang(lang);
    persistLang(lang);
    applyAll(lang);
    syncSwitchers(lang);
  }

  function wireSwitchers() {
    var btns = document.querySelectorAll("[data-lang]");
    Array.prototype.forEach.call(btns, function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
  }

  /* ---- boot ------------------------------------------------------------ */
  function init() {
    var lang = readLang();
    /* Even if DICT is absent, set lang + sync switchers so the UI is honest.
       lookup() returns null without DICT, so in-HTML 繁中 text is preserved. */
    applyAll(lang);
    syncSwitchers(lang);
    wireSwitchers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
