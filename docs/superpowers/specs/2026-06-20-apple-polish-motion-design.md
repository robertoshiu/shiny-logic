# Design Spec — Apple Polish (Motion/Continuity) + Content Refinement

Date: 2026-06-20
Status: DRAFT (awaiting user review)

> Two workstreams in ONE plan:
> - **Workstream A — Apple polish & motion** (CSS/JS, no content change): radar mobile-spin,
>   big-text balance, View Transitions, scroll-driven reveals, hero video scroll-zoom, tactile press.
> - **Workstream B — Content scrub + professional refinement** (copy/i18n): remove all
>   budget-proposal residue (不可預見費／預備金／8%／11 類別／報價基準 2026 Q2／年費／年運維／撥款·超支
>   framing) across 7 pages × 3 locales, and refine the affected copy + figures into precise,
>   domain-professional language. Keep `© 2026` copyright.
Repo: robertoshiu/shiny-logic
Branch: main

## Context

`shiny-logic` is a vanilla static site (7 pages + `styles.css`, `script.js`, `i18n-dict.js`,
3-locale i18n, dark/light theme). A prior "apple-fusion v3" pass (commit d8f3039) added the
*static* Apple layer: theme toggle, frosted nav, CTA pill, floating cards, spring easing
tokens, whitespace rhythm, mobile bottom sheet, hero parallax, focus/cursor/selection,
print stylesheet. This spec adds two **fixes** plus the **motion + continuity** layer that
makes the site feel like Apple.com, while preserving the "Lithographic Precision" brand
(reticle, blueprint grid, wafer, phosphor cyan).

All work is **vanilla CSS/JS, append-only** to the existing files, **progressive enhancement**
(every feature degrades gracefully), and honors `prefers-reduced-motion`. Brand colors and
the 8 existing brand motifs are untouched.

## Objectives

### Fix A — Radar (wafer scan) spins on mobile, matching desktop
- **Where:** `about.html` only renders `.wafer-scan` (SVG `<g>` inside a `viewBox="0 0 360 360"`
  wafer; rotation center = 180,180). Homepage hero is now the video (no wafer).
- **Root cause:** `.wafer-scan { transform-origin:center; animation:waferspin 26s ... }` has no
  `transform-box`. Desktop Chrome resolves "center" acceptably; **iOS Safari resolves it
  against a different box** → the sweep does not visibly rotate ("no effect on mobile").
- **Approach (A1, recommended, CSS-only, append-only):**
  ```css
  .wafer-scan { transform-box: view-box; transform-origin: 180px 180px; }
  ```
  Pins rotation to the wafer's exact center in its 360×360 coordinate space → identical spin
  on Chrome / Safari / iOS / Firefox. The existing `prefers-reduced-motion` rule
  `.wafer-scan{animation:none}` keeps working.
- **Contingency (A2 fallback):** if a real iOS device still fails, replace the CSS rotation
  with SVG SMIL inside the `<g>`:
  `<animateTransform attributeName="transform" type="rotate" from="0 180 180" to="360 180 180" dur="26s" repeatCount="indefinite"/>`
  (bulletproof on Safari). SMIL ignores `prefers-reduced-motion`, so A2 also needs a small
  JS guard that removes/pauses the animation when reduced-motion is set.

### Fix B — Big CJK text never breaks to 1–2 chars (every page)
- **Root cause:** CJK wraps at any character with no balancing → a heading can drop a lone
  char to the last line; CTA buttons (`預約諮詢 →`) can wrap the label off the arrow.
- **Approach (B1, CSS-only, append-only):**
  1. `text-wrap: balance;` on the display headings: `.hero__title, .about-hero__title,
     .case-hero__title, .contact-hero__title, .tech-hero__title, .page-hero__title,
     .section-title, .s-cta__title, .s-cta__statement`. Balances wrapped lines to ~equal
     length → no 1–2 char orphan. Unsupported browsers ignore it (normal wrap, no harm).
  2. `white-space: nowrap;` on `.btn` so CTA label+arrow stay on one line.
- **Note:** `text-wrap: pretty` is more orphan-targeted but narrower support; `balance` is the
  broad-support choice and suffices for these short headings.

### Enhancement 1 — Cross-page View Transitions
- Smooth Apple-like morph/crossfade between the 7 MPA pages. **Pure CSS, ~5 lines:**
  ```css
  @view-transition { navigation: auto; }
  ```
  plus a restrained default crossfade tuned with the existing `--ease-decelerate`/`--t-*`
  tokens. Auto-ignored by unsupported browsers (instant nav, no harm).
- **Reduced-motion:** `@media (prefers-reduced-motion: reduce){ ::view-transition-group(*),
  ::view-transition-old(*), ::view-transition-new(*){ animation: none !important; } }`.
- Keep transitions short (~200–280ms) and content-fade only (no jarring slides), to protect
  the brand's restrained feel.

### Enhancement 2 — Scroll-driven reveals
- Upgrade the existing `.reveal` entrance to scroll-linked motion using CSS scroll-driven
  animations, guarded so it only activates where supported and never breaks the current IO path:
  ```css
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .reveal { animation: reveal-in linear both; animation-timeline: view();
                animation-range: entry 0% entry 40%; }
    }
  }
  ```
  Where unsupported, the existing IntersectionObserver `.reveal.is-in` path remains the
  fallback. `prefers-reduced-motion` disables it. Applies to sections/cards/metrics already
  marked `.reveal`. No new markup.
- **Decision (no ambiguity):** where `animation-timeline: view()` is supported, the **CSS
  timeline is the source of truth**; the JS feature-detects (`CSS.supports('animation-timeline: view()')`)
  and **skips adding `.is-in`** on those browsers, so reveals never double-fire. Where
  unsupported, JS keeps adding `.is-in` exactly as today. Either path leaves content visible.

### Enhancement 3 — Hero video scroll-zoom
- The fab hero video gently scales (1 → ~1.06) as the hero scrolls — Apple product-page depth.
  Extend the existing parallax IIFE (#5) in `script.js`: rAF-throttled, scale capped, paused
  via the existing IntersectionObserver, and **off under `prefers-reduced-motion`** (the IIFE
  already has the matchMedia + change listener). Index-only (the IIFE no-ops without `.hero`).

### Enhancement 4 — Site-wide tactile press
- Extend the mobile-only Springboard `:active` feedback to all interactive elements on every
  viewport:
  ```css
  @media (prefers-reduced-motion: no-preference){
    a, button, .btn, .card, .nav__link, .langswitch__btn, .theme-toggle {
      transition: transform var(--t-fast) var(--ease-spring);
    }
    a:active, button:active, .btn:active, .card:active { transform: scale(0.97); }
  }
  ```
  Tune so it doesn't fight existing hover lifts (e.g., cards already `translateY(-4px)` on
  hover — compose, don't override). Reduced-motion disables.

### Workstream B — Content scrub + professional refinement (copy / i18n, all 7 pages × 3 locales)
**Goal:** the site must read like an established systems-integrator's site, not a priced budget
proposal with reserves and a quote date. Remove the residue, refine the rest. Keep `© 2026`.

**Remove / reframe (inventory — exact spots found):**
- **case-studies CapEx table:** delete the budget-reserve row `case.capexCat11` ("不可預見費（8% 預備金）"
  + cell "8% 預備金按階段分攤 · Gate 審查時依實際進度動用"). It is a budget line, not a methodology cell.
- `case.capexNote` "基準 2026 Q2 · 11 類別含 8% 預備金 · 依六層架構對齊" → "依六層架構對齊 · 交付範疇依合約確認"
  (drop date / 8% / 11 類別).
- `case.timelineFootReserve` "8% 預備金已按階段分攤" → remove the footnote item entirely.
- `case.timelineFootOpex` "維運年費自裝機期起算" → "維運自裝機期起" (drop 年費).
- `foot.tech` (every page footer) "報價基準 2026 Q2 · 交付範疇依合約確認" → "交付範疇依合約確認" (drop quote-basis date).
- `about.govGateDesc` "建置預算按八道 Gate…撥款…無超支黑盒" → governance/delivery framing, e.g.
  "交付依八道 Gate 分階段推進；每道 Gate 提交驗收文件，確認後才進入下一階段。進度透明、可稽核。"
- `case.risk2Desc` (FX risk card) drop 建置費用/預算/預備金 → cost/supply-risk framing without proposal jargon.
- `case.timelineLede` "建置預算依四階段…撥付" → "交付依四階段進程推進…".
- Any remaining `年運維` / `年費` / `/年` / `撥款` / `超支` / `報價基準` / `2026 Q2` / standalone budget "預算" → reframe/remove.
- EN locale equivalents: `contingency` / `reserve` / quote-basis / annual-fee wording → matching reframes.

**Professional refinement principles (the broader "文數字精鍊" pass):**
- Replace proposal-ese (預算/報價/撥款/預備金/不可預見費/超支/年費/年運維) with capability /
  methodology / governance language an established firm would use.
- Precise, domain-accurate semiconductor terminology; consistent across all 7 pages AND all 3 locales.
- Tighten verbose / sales-y lines; keep genuine capability specifics (RTO/RPO/SLO, 六層, 100% 歸檔,
  compliance standards, methodology) — refine, do not gut.
- EN = engineering-grade (no machine-translation artifacts); 简中 = Mainland register (建设 not 建置).
- Maintain prior content rules: no client commercial numbers reintroduced, NVIDIA-only brand,
  direct-to-fab positioning, no new pages.

**i18n integrity:** every changed key updated in all 3 locales; 繁中 in-HTML fallback == dict zh-Hant;
key-set parity preserved (removing a key removes it from all 3). `node --check` passes.

## Guardrails (carried from .omo/plans/apple-style-optimization.md)
1. NO build step / framework / animation library — vanilla only.
2. NO `@font-face`; NO i18n-*architecture* change (keys/parity preserved). Workstream A makes NO
   content changes; Workstream B *intentionally* edits copy/i18n **values** per its scrub scope
   (no new pages, no client numbers reintroduced, NVIDIA-only, direct-to-fab, brand intact).
3. NO redefining `--ease` / `--radius:4px` / the dark color tokens; **brand-color drift = 0**.
4. NO removing reticle / blueprint grid / wafer / grain.
5. `styles.css` **append-only** (in the apple-fusion v3 section); `script.js` additions are
   appended/extend existing IIFEs; NO new `window.*` globals.
6. NO nav JS contract change (`#navToggle` / `#navMobile` / `.is-open` / `aria-expanded`).
7. Every new animation killed by `prefers-reduced-motion: reduce`.
8. `-webkit-` prefixes double-written where needed; no transition on `backdrop-filter`.

## Browser support & progressive enhancement
| Feature | Modern | Fallback when unsupported |
|---|---|---|
| Fix A transform-box | all current | n/a (also fixes Safari) |
| Fix B text-wrap:balance | Chrome 114+/Safari 17.5+/FF 121+ | normal wrap (today's behavior) |
| View Transitions (cross-doc) | Chrome 126+/Safari 18.2+ | instant nav (today's behavior) |
| Scroll-driven (animation-timeline) | Chrome 115+/FF 134+/Safari TP | IntersectionObserver `.reveal` (existing) |
| Hero scroll-zoom / tactile press | all current | reduced-motion / older = static |

## Risks & Rollout Buffer
- **iOS Safari verification gap:** the headless browser here is Chromium, so the radar fix
  (A1) and Safari-specific View-Transition/scroll behaviors **cannot be fully proven here**.
  Reserve: a real-iOS-device check after deploy; A2 (SMIL) is the pre-approved fallback for
  the radar; View Transitions / scroll-driven are progressive so a Safari miss = graceful
  no-op, not breakage.
- **Double-animation risk** (Enhancement 2 vs existing IO): reserve a dedicated plan task to
  reconcile the CSS timeline and the JS observer so reveals never fire twice or stick hidden.
- **Brand/restraint risk:** motion could feel un-Apple-like (too much). Reserve a tuning pass
  to keep durations short and motion subtle; cut any enhancement that harms the brand read.
- **QA buffer:** keep a buffer task for full re-verification (28 screenshots × dark/light,
  brand-drift = 0, `--ease` unchanged, reduced-motion off-state, theme toggle still works)
  after all changes land, plus a rollback note (each item is independent and revertible).
- **Scope reserve:** if any enhancement proves risky/low-value during implementation, it may
  be deferred without blocking the two fixes (which are the committed baseline).

## Verification strategy (agent-executable, adapted to local tooling)
- gstack headless browser: 7 pages × dark/light × 1440/390 screenshots; theme toggle still
  functional + persists; reduced-motion emulation shows all new motion disabled.
- grep/node audits: append-only respected; `--ease` value byte-identical; dark tokens
  byte-identical (brand-drift 0); no `@font-face`; `node --check script.js`; CSS braces balanced.
- Functional: View Transition fires on same-origin nav (Chromium); scroll-driven applies under
  `@supports`; hero video scale changes on scroll; `:active` scale on interactive elements.
- **Out of local scope (reserve for real device):** iOS Safari radar spin + Safari View
  Transitions; Lighthouse/axe (tools not installed) — run locally if hard numbers needed.

## Acceptance Criteria
- [ ] Radar (about) visibly rotates on mobile (Chromium verified here; iOS verified on device).
- [ ] No display heading on any page breaks to a 1–2 char last line at 390/768/1440; CTA
      buttons never wrap the label off the arrow.
- [ ] Cross-page nav uses a smooth (≤~280ms) transition where supported; instant elsewhere.
- [ ] `.reveal` elements animate on scroll where supported; IO fallback intact elsewhere; both
      paths never double-fire or leave content hidden.
- [ ] Hero video scales subtly on scroll (index, motion-on only); off under reduced-motion.
- [ ] `:active` tactile scale on interactive elements across viewports; off under reduced-motion.
- [ ] Guardrails hold: brand-drift 0, `--ease`/dark tokens unchanged, no `@font-face`,
      append-only, nav JS contract intact, `prefers-reduced-motion` disables ALL new motion.
- [ ] (B) grep across 7 pages + i18n-dict.js returns ZERO: 不可預見費, 預備金, 8% 預備金, 11 類別,
      報價基準, 「2026 Q2」/Q2 quote-basis, 年費, 年運維, 撥款, 超支, contingency, reserve(-fund).
      (`© 2026` copyright retained.)
- [ ] (B) affected copy reads as professional capability/methodology language (no proposal-ese);
      i18n parity preserved (3 locales same key set), 繁中 fallback == dict zh-Hant, `node --check` clean;
      no client commercial numbers reintroduced; NVIDIA-only; direct-to-fab intact.

## Out of Scope
- New pages/content/copy; i18n architecture; framework/build adoption; the removed Partners
  page; `og-card.html`; Lighthouse/axe installs.

## File touch list
- `styles.css` (append v3.1 block: Fix A rule, Fix B rules, View Transitions, scroll-driven,
  tactile press; one possible in-place note only if unavoidable — prefer append-only).
- `script.js` (extend IIFE #5 for hero scroll-zoom; possibly a tiny `@supports`-gating tweak
  to the reveal observer).
- `about.html` (Workstream A: only if A2 SMIL fallback adopted).
- **Workstream B (content):** `i18n-dict.js` (edit/remove affected keys ×3 locales) and the
  HTML in-HTML 繁中 fallbacks where residue lives — `case-studies.html` (CapEx-row removal +
  notes/footnotes), `about.html` (govGateDesc + footer), `careers.html` + `contact.html` +
  `index.html` + `solutions.html` + `technology.html` (footer `foot.tech` line). No new pages.
