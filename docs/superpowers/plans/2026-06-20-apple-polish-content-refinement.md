# Apple Polish + Content Refinement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Apple motion/continuity layer (radar mobile-spin, balanced big text, View Transitions, scroll-driven reveals, hero video scroll-zoom, tactile press) AND scrub all budget-proposal residue + professionally refine the copy, on the vanilla `shiny-logic` static site — preserving the Lithographic-Precision brand.

**Architecture:** Two workstreams in one plan. **A (motion/polish)** is append-only CSS in the `apple-fusion v3` section of `styles.css` plus small extensions to existing IIFEs in `script.js` — no content change. **B (content)** edits copy values in `i18n-dict.js` (3 locales) and the matching 繁中 in-HTML fallbacks across 7 pages — removing 不可預見費/預備金/8%/報價基準 2026 Q2/年費/年運維/撥款·超支 framing and refining the rest. Everything degrades gracefully and honors `prefers-reduced-motion`; `© 2026` stays.

**Tech Stack:** Vanilla HTML/CSS/JS (no build/framework). i18n: `i18n-dict.js` (`window.I18N`, locales `zh-Hant`/`en`/`zh-Hans`) + `i18n.js` runtime. Verification: gstack headless browser (`B="$HOME/.claude/skills/gstack/browse/dist/browse"`), `grep`, `node --check` (no unit-test framework — design verification per the spec). Dev server: `python -m http.server 8347` from repo root.

**Spec:** `docs/superpowers/specs/2026-06-20-apple-polish-motion-design.md`

---

## Conventions for every task
- **Append-only** for `styles.css` Workstream-A rules: add inside the existing `/* === apple-fusion v3 === */` region (after the current end). Do **not** redefine `--ease`, `--radius:4px`, or any dark color token (brand-drift must stay 0).
- After any `script.js` / `i18n-dict.js` edit: `node --check script.js` / load-check `i18n-dict.js` must pass.
- After any `i18n-dict.js` value change: keep 3-locale key-set parity, and update the matching in-HTML 繁中 fallback so `fallback == dict[zh-Hant]`.
- Start the dev server once: `cd E:/repo/shiny-logic && python -m http.server 8347` (background). Restart the browse daemon (`$B restart`) before functional re-tests if `script.js` changed (it caches `script.js`).
- Commit after each task.

## File Structure
- `styles.css` — append Workstream-A rules (A1, A2, A3, A4-css, A6) in the v3 region.
- `script.js` — extend IIFE #5 (A5 hero scroll-zoom) + add an `@supports` guard to the reveal observer (A4-js).
- `i18n-dict.js` — Workstream-B value edits/removals across 3 locales.
- `index.html`, `about.html`, `solutions.html`, `technology.html`, `case-studies.html`, `careers.html`, `contact.html` — Workstream-B in-HTML 繁中 fallback edits + the case-studies table-row removals.
- No new files; no new pages; no `@font-face`.

---

## WORKSTREAM A — Apple polish & motion

### Task A1: Radar (wafer scan) spins on mobile

**Files:** Modify `styles.css` (append in v3 region).

- [ ] **Step 1 — Append the cross-browser rotation fix**

```css
/* === apple-fusion v3.1 — A1 radar mobile spin === */
/* About-page wafer sweep: pin rotation to the wafer centre (180,180 in the 360×360
   viewBox) so iOS Safari rotates it like Chrome. transform-origin:center alone is
   ambiguous on Safari for SVG <g>. Reduced-motion still kills it via the existing rule. */
.wafer-scan { transform-box: view-box; transform-origin: 180px 180px; }
```

- [ ] **Step 2 — Verify (Chromium + computed style)**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
"$B" goto "http://localhost:8347/about.html"; "$B" wait --networkidle
"$B" js "var g=document.querySelector('.wafer-scan');var s=getComputedStyle(g);JSON.stringify({box:s.transformBox,origin:s.transformOrigin,anim:s.animationName})"
```
Expected: `transformBox:"view-box"`, `transformOrigin:"180px 180px"`, `animationName:"waferspin"`.
**Manual (reserve):** confirm visible rotation on a real iPhone (Safari). If still static, apply the A1-fallback below instead.

- [ ] **Step 2b — (Only if iOS still fails) SMIL fallback**

Replace the CSS animation: in `styles.css` remove the `animation:waferspin` from `.wafer-scan` (comment it), and in `about.html` inside `<g class="wafer-scan">` add:
```html
<animateTransform attributeName="transform" attributeType="XML" type="rotate"
  from="0 180 180" to="360 180 180" dur="26s" repeatCount="indefinite"/>
```
Then add a tiny reduced-motion guard in `script.js` IIFE (pause SMIL): `if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('animateTransform').forEach(function(a){a.setAttribute('dur','indefinite')});` — or simpler, leave A1 (CSS) if the device test passes.

- [ ] **Step 3 — Commit**

```bash
git add styles.css
git commit -m "fix(hero): wafer scan rotates on mobile via transform-box (A1)"
```

---

### Task A2: Big CJK text never orphans 1–2 chars

**Files:** Modify `styles.css` (append in v3 region).

- [ ] **Step 1 — Append balance + button nowrap**

```css
/* === apple-fusion v3.1 — A2 text balance === */
.hero__title, .about-hero__title, .case-hero__title, .contact-hero__title,
.tech-hero__title, .page-hero__title, .section-title, .s-cta__title, .s-cta__statement {
  text-wrap: balance;            /* balances wrapped lines → no 1–2 char orphan; ignored where unsupported */
}
.btn { white-space: nowrap; }    /* keep CTA label + arrow on one line (e.g. 預約諮詢 →) */
```

- [ ] **Step 2 — Verify at 390px**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"; "$B" viewport 390x844
for p in index about solutions technology case-studies careers contact; do
  "$B" goto "http://localhost:8347/$p.html?v=a2"; "$B" wait --networkidle
  "$B" js "getComputedStyle(document.querySelector('.btn')).whiteSpace + ' | ' + (getComputedStyle(document.querySelector('.section-title')||document.body).textWrap||'n/a')"
done
```
Expected each: `nowrap | balance`. Visually scan a screenshot per page: no display heading ends with a lone 1–2 char line; no CTA button wraps the arrow off.

- [ ] **Step 3 — Commit**

```bash
git add styles.css
git commit -m "fix(type): text-wrap:balance on display headings + btn nowrap (A2)"
```

---

### Task A3: Cross-page View Transitions

**Files:** Modify `styles.css` (append in v3 region).

- [ ] **Step 1 — Append the transition + reduced-motion guard**

```css
/* === apple-fusion v3.1 — A3 cross-page View Transitions === */
@view-transition { navigation: auto; }      /* same-origin MPA nav morphs; ignored where unsupported */
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: .26s;
  animation-timing-function: var(--ease-decelerate);
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

- [ ] **Step 2 — Verify support + no breakage**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
"$B" goto "http://localhost:8347/index.html"; "$B" wait --networkidle
"$B" js "('startViewTransition' in document) + ' | nav stays functional'"
"$B" js "document.querySelector('a[href=\"about.html\"]').click(); 'clicked'" ; "$B" wait --load
"$B" js "location.pathname.endsWith('about.html')"
```
Expected: support boolean (true on Chromium ≥126); navigation lands on about.html (transition where supported, instant otherwise — no error either way).

- [ ] **Step 3 — Commit**

```bash
git add styles.css
git commit -m "feat(motion): cross-page View Transitions (A3)"
```

---

### Task A4: Scroll-driven reveals (CSS-owned where supported)

**Files:** Modify `styles.css` (append) + `script.js` (guard the observer).

- [ ] **Step 1 — Append scroll-driven CSS (guarded)**

```css
/* === apple-fusion v3.1 — A4 scroll-driven reveals === */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: sd-reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 38%; }
    @keyframes sd-reveal { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  }
}
```

- [ ] **Step 2 — Guard the JS observer to avoid double-fire**

In `script.js`, find the IntersectionObserver that adds `.is-in` to `.reveal`. Wrap the add so it is skipped where CSS owns it:
```javascript
// A4: where CSS scroll-driven timelines are supported, CSS owns .reveal — don't also add .is-in.
var SD_SUPPORTED = (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')
  && matchMedia('(prefers-reduced-motion: no-preference)').matches);
// inside the observer callback, before el.classList.add('is-in'):
if (!SD_SUPPORTED) el.classList.add('is-in');
```
(If `SD_SUPPORTED`, the CSS timeline animates entry; the IO can be skipped entirely or left observing with the gated add. Content is visible in both paths.)

- [ ] **Step 3 — Verify**

```bash
node --check script.js && echo "js ok"
B="$HOME/.claude/skills/gstack/browse/dist/browse"; "$B" restart; sleep 2
"$B" goto "http://localhost:8347/solutions.html"; "$B" wait --networkidle
"$B" js "CSS.supports('animation-timeline: view()')"
"$B" js "document.querySelectorAll('.reveal').length>0 && getComputedStyle(document.querySelector('.reveal')).opacity"   # content visible (not stuck at 0)
```
Expected: js ok; supports boolean; reveal opacity resolves to 1 after entering view (not permanently 0). No double animation.

- [ ] **Step 4 — Commit**

```bash
git add styles.css script.js
git commit -m "feat(motion): scroll-driven reveals with IO fallback guard (A4)"
```

---

### Task A5: Hero video scroll-zoom (index only)

**Files:** Modify `script.js` (extend IIFE #5).

- [ ] **Step 1 — Add capped scroll-linked scale to the hero video**

In `script.js` IIFE #5 (hero parallax), inside the existing rAF scroll handler (which already guards `.hero__inner` presence + reduced-motion + IO pause), also scale the video:
```javascript
// A5: subtle scroll-zoom on the hero video (depth). Capped; shares the IIFE's
// reduced-motion + IntersectionObserver pause. No-ops if no .hero__video.
var heroVideo = document.querySelector('.hero__video');
// inside the rAF update(progress) where progress = clamp(scrollY / heroHeight, 0, 1):
if (heroVideo) heroVideo.style.transform = 'scale(' + (1 + Math.min(progress, 1) * 0.06).toFixed(4) + ')';
// on reduced-motion change / pause: heroVideo && (heroVideo.style.transform = '');
```
Ensure `.hero__video` has `will-change: transform` (add to the v3 CSS if not present) and the hero clips overflow (it already does).

- [ ] **Step 2 — Verify**

```bash
node --check script.js && echo "js ok"
B="$HOME/.claude/skills/gstack/browse/dist/browse"; "$B" restart; sleep 2
"$B" viewport 1440x900; "$B" goto "http://localhost:8347/index.html"; "$B" wait --networkidle
"$B" js "getComputedStyle(document.querySelector('.hero__video')).transform"   # ~matrix scale 1
"$B" js "window.scrollTo(0,400); new Promise(r=>setTimeout(()=>r(getComputedStyle(document.querySelector('.hero__video')).transform),300))"  # scale > 1
```
Expected: transform changes from ~scale(1) to a slightly larger scale on scroll; reverts; reduced-motion emulation → no transform.

- [ ] **Step 3 — Commit**

```bash
git add script.js styles.css
git commit -m "feat(hero): subtle scroll-zoom on hero video (A5)"
```

---

### Task A6: Site-wide tactile press

**Files:** Modify `styles.css` (append in v3 region).

- [ ] **Step 1 — Append :active spring (composes with hover lifts)**

```css
/* === apple-fusion v3.1 — A6 tactile press === */
@media (prefers-reduced-motion: no-preference) {
  a, button, .btn, .nav__link, .langswitch__btn, .theme-toggle, .card {
    transition: transform var(--t-fast) var(--ease-spring), /* keep any existing transitions intact via cascade */;
  }
  a:active, button:active, .btn:active, .nav__link:active, .langswitch__btn:active, .theme-toggle:active { transform: scale(0.97); }
  /* cards already lift on hover (translateY(-4px)); compose: press = lift + slight shrink */
  .card:active { transform: translateY(-2px) scale(0.985); }
}
```
NOTE: if appending a second `transition` would clobber an element's existing transition, prefer adding only `transform` to its transition list (verify the element's current transition in `styles.css` first; do not drop `background-color`/`border-color` transitions). Keep it append-only and non-destructive.

- [ ] **Step 2 — Verify**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"; "$B" goto "http://localhost:8347/index.html"; "$B" wait --networkidle
"$B" js "var b=document.querySelector('.btn'); getComputedStyle(b).transitionProperty.includes('transform')"
```
Expected: true; pressing (`:active`) shrinks elements slightly; reduced-motion emulation disables it; hover lifts on cards still work.

- [ ] **Step 3 — Commit**

```bash
git add styles.css
git commit -m "feat(motion): site-wide tactile :active press (A6)"
```

---

## WORKSTREAM B — Content scrub + professional refinement

> For every B task: edit the named key in ALL 3 locales of `i18n-dict.js`, update the matching
> in-HTML 繁中 fallback so it equals the new `zh-Hant` value, keep key-set parity, and load-check
> the dict. Removing a key = remove its `data-i18n` element/usage too (or repoint it). No client
> commercial numbers reintroduced; NVIDIA-only; direct-to-fab intact; `© 2026` kept.

### Task B1: Remove the case-studies budget rows + reframe the table note

**Files:** Modify `case-studies.html`, `i18n-dict.js`.

- [ ] **Step 1 — Remove the budget rows from the table HTML**

In `case-studies.html`, delete the `<tr class="row-reserve …">` block whose name cell is `data-i18n="case.capexCat11"` ("不可預見費（8% 預備金）") and any row using `case.capexReserve` ("8% 不可預見費預備金") / `case.capexSubtotal` ("小計（不含預備金）"). The table is the six-layer × phase **methodology matrix** — a reserve/subtotal row does not belong.

- [ ] **Step 2 — Reframe the table note (3 locales + fallback)**

`case.capexNote`:
- zh-Hant: `依六層架構對齊 · 交付範疇依合約確認`
- en: `Aligned to the six-layer architecture · delivery scope confirmed by contract`
- zh-Hans: `依六层架构对齐 · 交付范畴依合约确认`

Then delete the now-orphaned keys `case.capexCat11`, `case.capexReserve`, `case.capexSubtotal` from all 3 locales (and confirm no remaining `data-i18n` references them).

- [ ] **Step 3 — Verify**

```bash
cd E:/repo/shiny-logic
grep -nE "不可預見費|預備金|8% |11 類別" case-studies.html || echo "case-studies html clean"
node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;["case.capexCat11","case.capexReserve","case.capexSubtotal"].forEach(k=>console.log(k, I["zh-Hant"][k]===undefined?"removed":"STILL PRESENT"));console.log("parity",["zh-Hant","en","zh-Hans"].map(l=>Object.keys(I[l]).length).join("/"));'
```
Expected: html clean; three keys "removed"; parity equal across locales.

- [ ] **Step 4 — Commit**

```bash
git add case-studies.html i18n-dict.js
git commit -m "refine(case): remove CapEx reserve/subtotal rows; reframe table note (B1)"
```

---

### Task B2: Drop the quote-basis date from footers

**Files:** Modify `i18n-dict.js`, all 7 `*.html` footers.

- [ ] **Step 1 — Reframe `foot.tech` (3 locales)**
- zh-Hant: `交付範疇依合約確認`
- en: `Delivery scope confirmed by contract`
- zh-Hans: `交付范畴依合约确认`

- [ ] **Step 2 — Reframe `home.statsFootRef` (index only, 3 locales)** — drop "報價基準 2026 Q2 ·", keep the rest (`交付範疇依合約確認`).

- [ ] **Step 3 — Update each page's in-HTML 繁中 footer fallback** to match the new `foot.tech` (7 pages) and `home.statsFootRef` (index).

- [ ] **Step 4 — Verify**

```bash
cd E:/repo/shiny-logic
grep -rnoE "報價基準|报价基准|2026 Q2|Quote basis|Basis 2026" --include=*.html . | grep -v docs/ || echo "no quote-basis in html"
grep -c "© 2026" about.html   # copyright retained → expect 1
```
Expected: no quote-basis strings remain in HTML; `© 2026` retained.

- [ ] **Step 5 — Commit**

```bash
git add i18n-dict.js *.html
git commit -m "refine(footer): drop quote-basis date; keep copyright (B2)"
```

---

### Task B3: Reframe phase/timeline footnotes (drop reserve + annual-fee)

**Files:** Modify `i18n-dict.js`, `case-studies.html`, `about.html`, `index.html`.

- [ ] **Step 1 — Remove reserve footnotes** — delete keys `case.timelineFootReserve` ("8% 預備金已按階段分攤") and `home.deliveryFnReserve` ("8% 預備金已按階段分攤") from 3 locales, and remove their footnote elements from `case-studies.html` / `index.html`.

- [ ] **Step 2 — Reframe annual-fee → managed-services (3 locales)**
- `case.timelineFootOpex`: zh-Hant `維運自裝機期起算` · en `Managed services begin at the Installation phase` · zh-Hans `运维自装机期起算`.
- `about.phaseFootnote`: zh-Hant `維運服務自裝機期起算 · DR 於試產期完成首輪演練` (drop "預備金已按階段分攤") · en/zh-Hans matching.

- [ ] **Step 3 — Update in-HTML 繁中 fallbacks** for the changed keys.

- [ ] **Step 4 — Verify**

```bash
cd E:/repo/shiny-logic
grep -rnoE "預備金|预备金|年費|年费" --include=*.html . | grep -v docs/ || echo "footnotes clean"
node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;["case.timelineFootReserve","home.deliveryFnReserve"].forEach(k=>console.log(k,I["zh-Hant"][k]===undefined?"removed":"PRESENT"));'
```
Expected: clean; both reserve keys removed.

- [ ] **Step 5 — Commit**

```bash
git add i18n-dict.js case-studies.html about.html index.html
git commit -m "refine(footnotes): drop reserve + annual-fee framing (B3)"
```

---

### Task B4: Reframe budget-framed governance / risk / delivery copy

**Files:** Modify `i18n-dict.js`, `about.html`, `index.html`, `careers.html`, `case-studies.html`.

Rewrite these keys (3 locales each + 繁中 fallback) to **governance/delivery** language with NO 預算/撥款/釋款/超支/預備金/釋放撥款. Keep the Gate/phase governance value.

- [ ] **Step 1 — `about.govGateDesc`**
- zh-Hant: `交付依八道 Gate 分階段推進；每道 Gate 提交驗收文件，確認後才進入下一階段。進度透明、全程可稽核。`
- en: `Delivery advances through eight Gates; each Gate requires acceptance documents and sign-off before the next phase begins. Fully transparent and auditable end to end.`
- zh-Hans: `交付依八道 Gate 分阶段推进；每道 Gate 提交验收文件，确认后才进入下一阶段。进度透明、全程可审计。`

- [ ] **Step 2 — `home.assuranceGov1Desc`**
- zh-Hant: `建廠 → 裝機 → 試產 → 量產，每階段 Gate 評審通過才進入下一階段，技術與治理雙重把關。`
- en: `Build → Install → Pilot → Ramp — each phase passes a Gate review before the next, with dual technical + governance sign-off.`
- zh-Hans: `建厂 → 装机 → 试产 → 量产，每阶段 Gate 评审通过才进入下一阶段，技术与治理双重把关。`

- [ ] **Step 3 — `careers.cmLabel1`**: zh-Hant `四階段 Gate 審查，逐道把關推進` (drop 釋放撥款) · en `Four-phase Gate reviews, advancing Gate by Gate` · zh-Hans `四阶段 Gate 审查，逐道把关推进`.

- [ ] **Step 4 — `case.risk2Desc`** (FX risk, drop 建置費用/預算/預備金):
- zh-Hant: `高階設備多以美元計價，匯率波動影響採購成本；以遠期合約鎖匯與彈性採購策略緩解。`
- en: `High-end equipment is largely USD-priced; FX movement affects procurement cost, mitigated with forward FX contracts and flexible sourcing.`
- zh-Hans: `高阶设备多以美元计价，汇率波动影响采购成本；以远期合约锁汇与弹性采购策略缓解。`

- [ ] **Step 5 — `case.risk2Mit`**: drop "預備金覆蓋 ±3% 浮動" → zh-Hant `遠期合約鎖匯 · 彈性採購緩衝` · en `Forward FX lock · flexible-sourcing buffer` · zh-Hans `远期合约锁汇 · 弹性采购缓冲`.

- [ ] **Step 6 — `case.timelineLede`** (drop 預算/撥付):
- zh-Hant: `交付依建廠、裝機、試產、量產四階段推進，每階段以里程碑 Gate 把關；裝機期承接 GB300 主交付與 AI Fabric，為最密集的建置區段。`
- en: `Delivery advances through the build, install, pilot and ramp phases, each gated by a milestone review; the Installation phase anchors GB300 delivery and the AI Fabric — the most build-intensive stretch.`
- zh-Hans: `交付依建厂、装机、试产、量产四阶段推进，每阶段以里程碑 Gate 把关；装机期承接 GB300 主交付与 AI Fabric，为最密集的建设区段。`

- [ ] **Step 7 — `home.deliveryLede`** (drop 建置費用/釋放撥款): zh-Hant `交付依建廠、裝機、試產、量產四階段推進，逐道 Gate 把關；裝機期承接 GB300 主交付與 AI Fabric，試產期完成首輪 DR 演練後進入量產。` + en/zh-Hans matching.

- [ ] **Step 8 — `home.statsCapexSub`** ("含預備金 · 依 Gate 逐批釋款"): reframe to a non-budget capability sub-label, e.g. zh-Hant `六層全棧 · 逐道 Gate 把關` · en `Six-layer full stack · gated delivery` · zh-Hans `六层全栈 · 逐道 Gate 把关`. (If this sub-label sat under a removed number, ensure it still reads sensibly.)

- [ ] **Step 9 — Update in-HTML 繁中 fallbacks** for all keys above; load-check the dict.

- [ ] **Step 10 — Verify**

```bash
cd E:/repo/shiny-logic
grep -rnoE "撥款|拨款|釋款|超支|建置預算|建设预算|預算|预算" --include=*.html . | grep -v docs/ || echo "budget-framing clean in html"
node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;var bad=0;["zh-Hant","en","zh-Hans"].forEach(l=>Object.values(I[l]).forEach(v=>{if(typeof v==="string"&&/撥款|拨款|超支|預備金|预备金|不可預見|不可预见/.test(v))bad++;}));console.log("residue values:",bad);'
```
Expected: html clean; `residue values: 0`.

- [ ] **Step 11 — Commit**

```bash
git add i18n-dict.js about.html index.html careers.html case-studies.html
git commit -m "refine(copy): reframe budget governance/risk/delivery copy (B4)"
```

---

### Task B5: Drop "年運維" annual-O&M term

**Files:** Modify `i18n-dict.js`, `solutions.html`, `technology.html`.

- [ ] **Step 1 — Reframe (3 locales + fallback)**: `sol.blkDrSpecOpex` and `tech.drSpec5Key` from `DR 年運維` → zh-Hant `DR 維運` · en `DR operations` · zh-Hans `DR 运维`.

- [ ] **Step 2 — Verify**

```bash
cd E:/repo/shiny-logic
grep -rnoE "年運維|年运维|年費|年费" --include=*.html . | grep -v docs/ || echo "no annual terms in html"
node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;var n=0;["zh-Hant","en","zh-Hans"].forEach(l=>Object.values(I[l]).forEach(v=>{if(typeof v==="string"&&/年運維|年运维|年費|年费/.test(v))n++;}));console.log("annual-term values:",n);'
```
Expected: clean; `annual-term values: 0`.

- [ ] **Step 3 — Commit**

```bash
git add i18n-dict.js solutions.html technology.html
git commit -m "refine(copy): drop annual-O&M term (B5)"
```

---

### Task B6: Professional refinement consistency pass

**Files:** Modify `i18n-dict.js` (+ any matching 繁中 fallbacks) as needed.

**Rule:** read the copy touched in B1–B5 (plus the page-hero ledes, section ledes, and CTA statements on all 7 pages) and tighten to precise, domain-professional language an established systems-integrator would use: remove residual proposal-ese and sales filler; ensure consistent terminology across pages and all 3 locales (EN engineering-grade, no machine-translation artifacts; 简中 Mainland register — 建设 not 建置, 集成 not 整合 where idiomatic); keep genuine specifics (RTO/RPO/SLO, 六層, 100% 歸檔, compliance standards). Do NOT gut capability content, reintroduce numbers, or change positioning.

- [ ] **Step 1 — Sweep the target keys** (the B1–B5 keys + `*.heroLede`, `*.metaDesc`/`ogDesc`, `s-cta` statements) for consistency; apply minimal precise edits in 3 locales. Example exemplars:
  - Vague: "完整六層技術堆疊 100% 歸檔回您" → precise: keep, it is concrete.
  - Proposal-ese leftover like "本案/報價/估算" → remove or reframe to capability.
  - 简中 register: ensure `建设`/`集成` consistency; no Traditional leaks (產→产, 範→范, 數據→数据).

- [ ] **Step 2 — Verify (parity + register + no Traditional leaks in 简中)**

```bash
cd E:/repo/shiny-logic
node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;console.log("parity",["zh-Hant","en","zh-Hans"].map(l=>Object.keys(I[l]).length).join("/"));var leak=Object.entries(I["zh-Hans"]).filter(function(e){return typeof e[1]==="string"&&/產|範|數據|建置|繁體/.test(e[1])});console.log("zh-Hans Traditional leaks:",leak.length, leak.slice(0,6).map(x=>x[0]).join(","));var encjk=Object.entries(I.en).filter(function(e){return typeof e[1]==="string"&&/[一-鿿]/.test(e[1])&&!/顯藝科技|語言/.test(e[1])});console.log("en non-brand CJK:",encjk.length);'
```
Expected: parity equal; `Traditional leaks: 0`; `en non-brand CJK: 0`.

- [ ] **Step 3 — Commit**

```bash
git add i18n-dict.js *.html
git commit -m "refine(copy): professional consistency pass across pages + locales (B6)"
```

---

### Task B7: Residue audit gate (Workstream B done)

**Files:** none (audit only).

- [ ] **Step 1 — Full residue grep (must be zero)**

```bash
cd E:/repo/shiny-logic
echo "HTML:"; grep -rnoE "不可預見費|预备金|預備金|報價基準|报价基准|2026 Q2|年費|年费|年運維|年运维|撥款|拨款|超支|建置預算|建设预算|contingency|reserve fund|Quote basis" --include=*.html . | grep -v docs/ || echo "  clean"
echo "DICT:"; node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;var n=0;Object.keys(I).forEach(l=>Object.values(I[l]).forEach(v=>{if(typeof v==="string"&&/不可預見|不可预见|預備金|预备金|報價基準|报价基准|2026 Q2|年費|年费|年運維|年运维|撥款|拨款|超支|contingency|reserve fund/.test(v))n++;}));console.log("  residue values:",n);'
echo "Copyright kept:"; grep -rc "© 2026" *.html | grep -v ':0' | wc -l
```
Expected: HTML clean; `residue values: 0`; copyright present on all pages.

- [ ] **Step 2 — Commit (if the audit revealed stragglers, fix then)** — otherwise no-op.

---

## FINAL — Full verification (both workstreams)

### Task V1: Re-verify everything + capture evidence

**Files:** none (verification).

- [ ] **Step 1 — Guardrails (grep/node)**

```bash
cd E:/repo/shiny-logic
echo "brand --cyan dark intact:"; grep -c -- "--cyan:#67E8F9" styles.css     # expect 1
echo "--ease intact:"; grep -c "cubic-bezier(.2,.7,.2,1)" styles.css          # unchanged
echo "real @font-face:"; grep -cE "^\s*@font-face" styles.css                 # expect 0
node --check script.js && echo "script ok"
node -e 'global.window={};require("./i18n-dict.js");var I=window.I18N;console.log("i18n parity",["zh-Hant","en","zh-Hans"].map(l=>Object.keys(I[l]).length).join("/"));'
python -c "s=open('styles.css',encoding='utf-8').read();print('css brace balance', s.count('{')-s.count('}'))"
```
Expected: cyan 1, --ease unchanged, font-face 0, script ok, parity equal, brace balance 0.

- [ ] **Step 2 — Browser matrix (dark + light, 1440 + 390)**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"; "$B" restart; sleep 2
for t in dark light; do for vp in 1440x900 390x844; do "$B" viewport $vp
  "$B" js "localStorage.setItem('sl-theme','$t')" >/dev/null
  for p in index about solutions technology case-studies careers contact; do
    "$B" goto "http://localhost:8347/$p.html"; "$B" wait --networkidle
    "$B" js "new Promise(r=>setTimeout(()=>r(1),700))" >/dev/null
    "$B" screenshot ".omo/evidence/final-v2/$t-${vp%x*}-$p.png" >/dev/null
  done; done; done
echo "28 screenshots in .omo/evidence/final-v2/"
```
Check: theme toggle works + persists; no console errors; no overflow at 390; radar present on about; reduced-motion emulation disables new motion; View Transition fires on Chromium nav; scroll-driven reveals visible; hero video scroll-zoom works; no display heading orphans a 1–2 char line.

- [ ] **Step 3 — Final commit (evidence is gitignored under .omo/)** — no code commit; report results.

---

## Self-Review (completed by plan author)
- **Spec coverage:** A1–A6 cover Workstream A (radar, balance, View Transitions, scroll-driven, scroll-zoom, tactile). B1–B7 cover Workstream B (remove 不可預見費/預備金/8%/11類別/報價基準 2026 Q2/年費/年運維/撥款·超支 + refine + audit). V1 covers verification + guardrails. ✓
- **Placeholders:** B6 is rule+exemplar-based (copy refinement is inherently judgment) but names exact target keys and gates on grep-zero + parity + register checks — not a vague "improve copy". A1 fallback (A2b/SMIL) is fully specified. ✓
- **Consistency:** key names match the live dict (verified via `node` dump); `© 2026` retained throughout; append-only + brand-drift-0 reasserted per task. ✓
