# DESIGN.md — 顯藝科技 ShinyLogic

> Single source of truth for the ShinyLogic company website. Every build/review agent
> MUST read this file before touching markup, style, or copy. Do not deviate without
> explicit user approval. In QA mode, flag any code that contradicts this file.

---

## 1. Brand & Positioning

**顯藝科技 · ShinyLogic** — 智能晶圓廠 IT/OT 全棧系統整合商
(Intelligent wafer-fab IT/OT full-stack systems integrator.)

ShinyLogic 為高量產（HVM）晶圓廠設計並交付**從設備數據、到 AI 決策閉環、再到異地備援**的完整六層技術堆疊。我們不只供應硬體，而是承擔授權、責任與業務連續性。

**Flagship reference build — “FAB300”**：以 Applied SmartFactory FAB300 為 MES 核心、3 × NVIDIA GB300 NVL72（248 顆 AI GPU）為算力底座的全方位智能晶圓廠建置。網站以此案為代表性能力證明（capability proof），而非單純預算文件。

**One-line brand promise:** 把設備數據，鍛造成可決策的智能。
**Descriptor (EN):** We build the intelligence layer of the modern wafer fab.

---

## 2. Voice & Language

- **Body copy: 繁體中文（Traditional Chinese）.** The deck source is Simplified; convert all marketing copy to Traditional Chinese.
- **Kickers / section labels / technical annotations: English, monospace, UPPERCASE** (e.g. `INTELLIGENT FAB INFRASTRUCTURE`, `// FIG.03`). Mirrors the deck's English section headers.
- **Keep verbatim, never translate:** product & standard names — NVIDIA GB300 NVL72, HGX B300, Blackwell Ultra, Quantum-X800, Spectrum-X, ConnectX-8, Applied SmartFactory FAB300 (AMAT FAB300), AVEVA PI, Omniverse, Claroty, Nozomi, SECS-GEM, GEM300, OPC UA, IEC 62443, SEMI E187, ISA-95, 等保 2.0, RTO/RPO/SLO/WSPM/PUE.
- **Tone:** precise, confident, engineering-grade, restrained. Lead with concrete numbers. No hype adjectives, no exclamation marks, no emoji.
- Numbers use thin grouping; currency shown as `RMB 4.35 億` / `RMB 43,459 萬`. Always note unit.

---

## 3. Aesthetic Direction — “Lithographic Precision”

A dark, engineering-grade instrument panel inspired by semiconductor lithography and the
cleanroom. Deep graphite, phosphor-cyan signal, fine hairline linework, monospace
telemetry, reticle/registration alignment marks, and a 300 mm-wafer motif. Refined and
dense — precision instrument, not “cyberpunk gamer.” Restraint over glow.

**Forbidden (AI slop):** Inter / Roboto / Arial / system-ui as a display face, purple-on-white
gradients, generic SaaS hero with a centered headline + two buttons + floating cards,
emoji icons, stocky drop shadows, evenly-distributed rainbow palettes.

---

## 4. Color Tokens  (define as CSS variables on `:root`)

```
--ink-900:    #07090C;   /* page base — near-black blue graphite        */
--ink-850:    #0A0D11;   /* alt section base                            */
--ink-800:    #0D1217;   /* raised panel                                */
--ink-700:    #121922;   /* card                                        */
--ink-600:    #18222D;   /* card hover / elevated                       */

--text:       #EAF1F6;   /* primary text                                */
--mist:       #C4D0D9;   /* secondary headings / strong labels          */
--fog:        #8C9DAB;   /* body secondary text                         */
--steel:      #5C6B78;   /* muted / disabled / faint labels             */

--cyan:       #67E8F9;   /* PRIMARY accent (from deck #67E8F9) — phosphor*/
--cyan-bright:#A5F3FC;   /* highlight / hover text                      */
--cyan-deep:  #22D3EE;   /* deeper cyan for fills/borders               */
--gold:       #E7B567;   /* SECONDARY warm accent — use SPARINGLY        */
--good:       #5EE6A8;   /* status dot only (online/pass)               */

--line:       rgba(147,164,179,.12);   /* hairlines                     */
--line-bright:rgba(103,232,249,.30);   /* active/accent hairline        */
--grid:       rgba(147,164,179,.045);  /* blueprint micro-grid          */
--glow-cyan:  rgba(103,232,249,.16);   /* radial glow                   */
```

**Usage rule:** Background is overwhelmingly graphite. Cyan is the single dominant accent
(links, active marks, key data, focus rings). Gold appears only on a few hero/CTA numerals
and the primary button hover — treat it as a rare highlight. Green is status dots only.

---

## 5. Typography

Load via Google Fonts `<link>` (preconnect + display=swap):

- **Display / headings (Latin):** `Saira` — weights 300, 400, 500, 600, 700, 800.
- **Big stat numerals:** `Saira Condensed` — weights 500, 600, 700 (tall, dramatic).
- **Mono / kickers / annotations / data labels:** `IBM Plex Mono` — weights 400, 500, 600.
- **CJK body & headings:** `Noto Sans TC` — weights 300, 400, 500, 700.

```
--font-display: "Saira", "Noto Sans TC", system-ui, sans-serif;
--font-cond:    "Saira Condensed", "Saira", "Noto Sans TC", sans-serif;
--font-mono:    "IBM Plex Mono", ui-monospace, "Cascadia Code", monospace;
--font-body:    "Noto Sans TC", "Saira", system-ui, sans-serif;
```

**Scale** (fluid where noted):
- Hero headline: `clamp(2.6rem, 6vw, 5.25rem)`, `--font-display`, weight 600–700, line-height .98, letter-spacing -0.02em. CJK lines use `--font-body` weight 700.
- Section title: `clamp(1.9rem, 3.4vw, 3rem)`, weight 600.
- Section index number (big faint): `clamp(3rem, 7vw, 6rem)`, `--font-cond`, color `--steel` @ ~14% opacity, sits behind/beside title.
- Stat numeral: `clamp(2.6rem, 5vw, 4.5rem)`, `--font-cond`, weight 600.
- Body: 1rem–1.0625rem, line-height 1.75, color `--fog` (CJK needs generous leading).
- Kicker / mono label: .72–.8rem, `--font-mono`, letter-spacing .22em, uppercase, color `--cyan` or `--steel`.
- Lede: 1.05–1.2rem, color `--mist`.

---

## 6. Spacing, Grid, Layout

- 8px base scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- Container: `.wrap` max-width 1200px, side padding `clamp(20px, 5vw, 64px)`, centered.
- Section vertical padding: `clamp(80px, 11vw, 168px)`.
- Generous negative space at section heads; controlled density inside data panels.
- Embrace asymmetry: section headers left-aligned with a big faint index number offset to
  the right or overlapping; let some panels break the grid / overlap hairlines.
- Breakpoints: 1024 (tablet), 768 (stack), 560 (mobile). Mobile: single column, reduced
  type scale, hamburger nav.

---

## 7. Signature Motifs & Textures  (this is what makes it memorable — use throughout)

1. **Blueprint micro-grid** — fixed faint grid (`--grid`) as a background layer on `body`
   (e.g. two repeating-linear-gradients, 40px cell). Very subtle.
2. **Reticle / registration corner marks** — small L-shaped cyan ticks at the four corners
   of key panels & the hero (lithography alignment marks). Implement via `.reticle` wrapper
   with `::before/::after` + extra spans, or a shared utility. Brighten on hover.
3. **300 mm wafer motif** — an SVG in the hero: concentric circles + a flat/notch + faint
   radial scan line that slowly rotates (respect reduced-motion). Subtle cyan stroke.
4. **Monospace telemetry** — small mono annotations everywhere: `// FIG.0X`, coordinate
   ticks (`X:0420  Y:1080`), unit tags (`RMB 萬`), `[ ACTIVE ]` style brackets.
5. **Hairline system** — 1px `--line` dividers, ticked rulers, and bordered panels. Linework
   does a lot of the design's work; keep it crisp.
6. **Grain / noise overlay** — a fixed full-page SVG `feTurbulence` noise at ~3–5% opacity,
   `mix-blend-mode: overlay`, `pointer-events:none`. Adds analog depth.
7. **Radial glow** — one or two restrained `--glow-cyan` radial gradients behind the hero
   and the AI-compute spotlight. Do not scatter glows everywhere.

---

## 8. Components Contract (Foundation defines these; sections REUSE them)

Foundation phase must implement and style all of the following shared classes. Section
builders must use them and only add **scoped** CSS (selectors prefixed by the section's
scope class, e.g. `.s-arch ...`) to avoid collisions.

- `.wrap` — container.
- `.section` — vertical rhythm; `.section--alt` — uses `--ink-850` base.
- `.section-head` — header block. Contains:
  - `.kicker` — mono uppercase label (cyan).
  - `.section-index` — big faint `--font-cond` number (e.g. `03`).
  - `.section-title` — display title.
  - `.section-lede` — `--mist` intro paragraph.
- `.panel` — bordered graphite surface (`--ink-800`, 1px `--line`, radius 4px).
- `.card` — `--ink-700` surface; `.card--reticle` adds corner marks; hover lifts + brightens hairline.
- `.hairline` — 1px divider; `.rule` — ticked ruler variant (optional).
- `.metric` / `.metric__num` (`--font-cond`) / `.metric__unit` / `.metric__label` (mono).
- `.btn` / `.btn--primary` (cyan outline → gold on hover) / `.btn--ghost`.
- `.pill` / `.tag` — small mono labels with hairline border.
- `.mono`, `.fog`, `.mist`, `.accent` (cyan text), `.gold` (gold text) — text utilities.
- `.reticle` — corner-mark wrapper utility.
- Animation hooks: `.reveal` (JS toggles `.is-in` on scroll). Counters use
  `data-count="<number>"`, optional `data-suffix`, `data-prefix`, `data-decimals`.

### Placeholder markers (Foundation writes these into `index.html`, IN THIS ORDER):
```
<!--#stats-->
<!--#architecture-->
<!--#capabilities-->
<!--#compute-->
<!--#mes-->
<!--#delivery-->
<!--#assurance-->
<!--#contact-->
```
Each section root = `<section id="<id>" class="section reveal s-<scope>">…</section>`.

---

## 9. Motion

- **Hero load:** staggered reveal — kicker → headline line 1 → line 2 → lede → metrics → wafer,
  via `animation-delay` (60–90ms steps), translateY(14px)+opacity. ~700ms cubic-bezier(.2,.7,.2,1).
- **Scroll reveal:** IntersectionObserver adds `.is-in`; default fade+rise; stagger children
  with incremental `--i` custom property * delay.
- **Counters:** count-up from 0 → value over ~1.4s ease-out when section enters view (once).
- **Architecture stack:** hovering/clicking a layer expands its detail (max-height + opacity);
  a vertical “signal pulse” travels top→bottom of the stack on a loop. Keyboard accessible
  (accordion: `button` headers, `aria-expanded`).
- **Capability cards:** hover → lift 4px, hairline → `--line-bright`, reticle marks brighten.
- **Timeline:** phase bars animate width from 0 → their budget % when in view.
- **prefers-reduced-motion: reduce** → disable wafer rotation, signal pulse, count-up
  (show final value), and translate reveals (use instant opacity only).

---

## 10. Accessibility & Quality Bar

- Semantic landmarks: `header`/`nav`/`main`/`section`/`footer`; one `h1` (hero), section `h2`.
- All interactive elements keyboard-operable; visible `:focus-visible` ring in `--cyan`.
- Decorative SVG/motifs `aria-hidden="true"`; meaningful images get alt text.
- Body text meets contrast on graphite (use `--text`/`--mist` for content, `--fog` for
  secondary only). Don't put `--steel` on body copy.
- Mobile nav toggles with a button (`aria-expanded`, `aria-controls`).
- No layout shift from counters (reserve width). Valid HTML5. No console errors.

---

## 11. Section Blueprint & Copy

> Copy below is the baseline; agents may refine wording but must keep all facts/numbers and
> the Traditional-Chinese voice. English kickers stay English.

### NAV (Foundation)
- Left: wordmark `SHINYLOGIC` (Saira, 700, tight) with sub `顯藝科技` (mono, steel, small).
  A `--good` status dot + `[ FAB300 ]` mono tag is a nice touch.
- Links: `架構` (#architecture) · `能力` (#capabilities) · `算力` (#compute) · `交付` (#delivery) · `治理` (#assurance).
- CTA button `啟動建置規劃` (#contact).
- Fixed; gains a hairline border + blur backdrop after scroll. Mobile hamburger.
- A thin top status strip (mono, steel) above nav:
  `顯藝科技 SHINYLOGIC` · `INTELLIGENT WAFER FAB SYSTEMS` · `規劃匯率 USD 1 = RMB 7.2` · `金額單位 RMB 萬`.

### HERO (Foundation)
- Kicker: `智能晶圓廠 · IT/OT 全棧建置  //  INTELLIGENT FAB INFRASTRUCTURE`
- Headline (two lines, CJK display):
  line 1 — `把設備數據，`
  line 2 — `鍛造成可決策的智能。`
  (treat the second clause / a key noun in `--cyan`)
- Lede: `從 8 大工藝機台的訊號，到 AI 決策閉環，再到跨區域異地備援 — 顯藝科技為高量產晶圓廠交付完整六層技術堆疊，承擔授權、責任與業務連續性。`
- Inline hero metrics (4): `248 AI GPU` · `4PB 數據湖` · `RTO ≤ 4hr` · `六層架構`.
- CTAs: `啟動建置規劃` (primary → #contact) · `查看系統架構` (ghost → #architecture).
- Right / background: wafer SVG motif + reticle corners + grid + one radial glow.

### MARQUEE strip (Foundation, between hero & stats)
- Slow mono marquee of technology partners/standards (text only, hairline top/bottom):
  `NVIDIA Blackwell Ultra` · `Applied SmartFactory FAB300` · `AVEVA PI` · `NVIDIA Omniverse`
  · `Quantum-X800 InfiniBand` · `Spectrum-X` · `Claroty / Nozomi` · `IEC 62443` · `SEMI E187`
  · `ISA-95`. Pauses on hover.

### `#stats` — 02 / BY THE NUMBERS
Animated counters in a bordered grid (6 cells). Each: big `--font-cond` number + mono label.
- `RMB 4.35 億` — CapEx 一次性建置 (`data-count="4.35" data-decimals="2" data-suffix=" 億"` w/ `RMB ` prefix shown statically)
- `RMB 6.07 億` — 3 年 TCO（CapEx + 3 年 OpEx）
- `248` — AI GPU（3 × GB300 NVL72 + 4 × HGX B300）
- `4 PB` — NVMe 數據湖
- `≤ 4 hr` — DR RTO（RPO ≤ 15 min）
- `≥ 95%` — 系統 SLO（良率 ≥ 90%）

### `#architecture` — 03 / ARCHITECTURE  ★ centerpiece
Title `六層架構，一條決策閉環`. Lede: `從設備數據到 AI 決策，再到異地備援 — 每一層的硬體、軟體、網路與安全都被涵蓋。`
Interactive vertical stack (accordion, top→bottom signal flow). Six layers:
1. **輸入層 / INPUT** — `8 大工藝機台 · MES / EAP / SECS-GEM · OPC UA 廠務 · 傳感網絡`
2. **數據層 / DATA** — `Historian（AVEVA PI）· Lakehouse + EDA 高頻採集 · 4PB NVMe 數據湖`
3. **算力層 / COMPUTE** — `3 × GB300 NVL72（216 GPU）· 4 × HGX B300 推理 · Quantum-X800 / Spectrum-X 網絡`
4. **應用層 / APPLICATION** — `Agentic RAG / LLM · Digital Twin（Omniverse）· MES（AMAT FAB300）· ECR / ECO`
5. **治理層 / GOVERNANCE** — `CCC 中控台 · SOC 24×7 · OT 安全（Claroty / Nozomi）· 合規底座`
6. **備援層 / RESILIENCE** — `異地備援 DR · 溫備援跨區域 · 異步複製 · SD-WAN 雙 ISP · RTO ≤ 4hr / RPO ≤ 15min`
Each layer header shows index (L1–L6), TC name, EN tag; expanded body shows the bullet tech list as `.tag` chips. First layer open by default.

### `#capabilities` — 04 / CAPABILITIES
Title `從矽到決策的全棧能力`. Grid of 6 `.card--reticle` cards. Each: inline-SVG line icon
(stroke `--cyan`, 1.5px, geometric — NO emoji), TC name, EN sub, one-line blurb, a key spec,
and a faint share % (from CapEx mix). Cards:
1. **AI 算力與儲存** / AI COMPUTE & STORAGE — `NVIDIA Blackwell Ultra 世代；GB300 NVL72 + HGX B300，承接設備高頻數據與 Digital Twin 資產。` spec `248 GPU · 4PB NVMe` · `36.1%`
2. **製造執行 MES** / MANUFACTURING EXECUTION — `Applied SmartFactory FAB300 — 實證 300K WSPM 的高量產旗艦，與設備自動化深度整合。` spec `AMAT FAB300` · `平台軟體 20.4%`
3. **高速網絡 Fabric** / NETWORK FABRIC — `Quantum-X800 InfiniBand 800Gb/s + Spectrum-X，覆蓋東西向 AI 計算網與南北向生產網。` spec `800 Gb/s` · `7.1%`
4. **資訊安全 OT/IT** / SECURITY — `OT/IT 雙域：Claroty / Nozomi 可視化、NGFW、SIEM/SOAR、SOC 24×7，對齊 IEC 62443。` spec `IEC 62443` · `5.8%`
5. **異地備援 DR** / RESILIENCE — `溫備援跨區域、異步複製、SD-WAN 雙 ISP；關鍵系統 RTO ≤ 4hr、RPO ≤ 15min。` spec `RTO ≤ 4hr` · `6.0%`
6. **企業整合** / ENTERPRISE INTEGRATION — `打通 ISA-95 L3↔L4：ERP/PLM 接口、AMHS/MCS、LIMS、FMCS。` spec `ISA-95 L3↔L4` · `5.1%`

### `#compute` — 05 / AI COMPUTE  (spotlight, has radial glow)
Title `Blackwell Ultra 算力底座`. Lede: `3 × GB300 NVL72 構成 AI Fabric，HGX B300 承擔推理，Quantum-X800 全互聯 — 為 Digital Twin 與 Agentic RAG 提供決策算力。`
Two-column: left = narrative + spec list; right = a visual (GPU dot-grid of 248 dots, or
3 stacked rack bars). Spec rows (mono): `GB300 NVL72 × 3 — 216 GPU · ~132kW/柜 · 液冷`;
`HGX B300 × 4 — 32 GPU 推理`; `Quantum-X800 InfiniBand — 800Gb/s XDR`; `Spectrum-X — SN5600 800Gb/s`;
`儲存 — 4PB NVMe 數據湖`. Big number `248` `AI GPU`. Note `GB300 NVL72 必須液冷，機房約 400kW`.

### `#mes` — 06 / MES · FAB300  (compact band, `--alt`)
Title `Applied SmartFactory FAB300`. Lede: `高量產（HVM）晶圓廠 MES 旗艦，與設備自動化最深整合，適合先進製程量產爬坡。`
Module chips (7, `.tag` / small cards): `Dispatching / WIP 調度`, `Genealogy 譜系追溯`,
`APC · R2R + FDC`, `Recipe / RMS 配方管理`, `Scheduling / APS 排程`, `SPC / YMS 良率`,
`設備整合 EAP / SECS-GEM（GEM300）`. Side facts: `定位：實證 300K WSPM 龍頭` · `授權＋實施 ≈ USD 6.5M` · `EAP/SECS-GEM 8 工藝機台聯調`.

### `#delivery` — 07 / DELIVERY
Title `四階段交付，八道 Gate`. Lede: `CapEx 依建置區間分攤，逐道 Gate 釋放撥款；裝機期承接 GB300 主交付與 AI Fabric。`
Horizontal phased timeline; each phase a column with an animated proportional bar:
- `建廠期 M1–M6` — `RMB 8,318 萬` — `19.1%`
- `裝機期 M7–M15` — `RMB 23,829 萬` — `54.8%`
- `試產期 M16–M21` — `RMB 8,884 萬` — `20.4%`
- `量產期 M22+` — `RMB 2,428 萬` — `5.6%`
Footnote: `OpEx 年費（RMB 5,756 萬/年）自裝機期起算 · 8% 預備金已按階段分攤 · DR 於試產期完成首輪演練`.

### `#assurance` — 08 / ASSURANCE  (`--alt`)
Title `承諾守住業務連續性`. A row of big SLA commitment metrics + compliance badges.
Metrics: `RTO ≤ 4hr`, `RPO ≤ 15min`, `良率 ≥ 90%`, `SLO ≥ 95%`, `跨廠模板 100% 歸檔`.
Governance line: `8 道 Gate 對齊四階段 · RACI 每議題唯一 A · 風險三級升級 · DR 演練納入季度 Review`.
Compliance badges (`.pill`): `等保 2.0 三級` · `密評` · `IEC 62443` · `SEMI E187` · `ISA-95`.

### `#contact` — 09 / ENGAGE
Title `規劃您的智能晶圓廠`. Bold closing statement: `顯藝科技不是只交付硬體 — 而是拿授權、拿責任，並以異地備援守住業務連續性。`
Contact panel: email `roberto.hsu@gmail.com` (mailto), a `下載建置藍圖` ghost CTA (href="#"),
and a short static form is optional. Keep it a striking bordered CTA panel with reticle marks
and a radial glow. Big mono coordinate flourish allowed.

### FOOTER (Foundation)
- Wordmark + descriptor; quick nav links; the deck-style technical line:
  `USD 1 = RMB 7.2（規劃匯率） · 金額單位 RMB 萬 · 報價基準 2026 Q2`
- Copyright: `© 2026 顯藝科技 ShinyLogic. All rights reserved.`
- Small print mono: `FAB300 REFERENCE BUILD · CapEx 一次性 RMB 4.35 億 · 3 年 TCO RMB 6.07 億`.

---

## 12. Source Facts Appendix  (for content-fidelity review — do not contradict)

- Company: 顯藝科技 / ShinyLogic. Domain: intelligent (smart) wafer fab IT/OT build.
- CapEx 一次性合計 **RMB 43,459 萬 ≈ 4.35 億**（含 8% 預備金 3,219 萬）.
- OpEx 授權/雲端/DR/SaaS **RMB 5,756 萬/年**；3 年 TCO **RMB 60,727 萬 ≈ 6.07 億**.
- AI 算力：**3 × GB300 NVL72（216 GPU）** + **4 × HGX B300（32 GPU 推理）** = **248 AI GPU**；單柜 GB300 ≈ USD 6.0M、≈132kW、需液冷。儲存 **4PB NVMe**.
- CapEx mix: AI 算力與儲存 15,682 萬 (36.1%)、平台軟體含 MES 8,856 (20.4%)、網絡 3,082 (7.1%)、DR 2,592 (6.0%)、資安 2,520 (5.8%)、機房/液冷/供電 2,304 (5.3%)、中控/視覺 936 (2.2%)、企業整合 2,232 (5.1%)、消防安防備件 1,116 (2.6%)、員工設備 920 (2.1%)、不可預見費 3,219 (7.4%).
- MES = **Applied SmartFactory FAB300（AMAT）**；License+實施 ≈ USD 6.5M（RMB 4,680 萬，計入平台軟體）；年維護 ≈ RMB 700 萬/年；實證 **300K WSPM** HVM 龍頭。模組：Dispatching/WIP、Genealogy、APC R2R+FDC、Recipe/RMS、Scheduling/APS、SPC/YMS、EAP/SECS-GEM(GEM300).
- 網絡：Quantum-X800 InfiniBand 144-port 800Gb/s XDR；Spectrum-X SN5600 800Gb/s；ConnectX-8 SuperNIC + LinkX.
- 資安：Claroty/Nozomi（OT）、NGFW、SIEM/SOAR、EDR/IAM/PAM、SOC 24×7；對齊 ISA-95 / IEC 62443 / SEMI E187.
- DR：溫備援跨區域、異步複製、SD-WAN 雙 ISP、warm standby + 2× HGX B300 關鍵推理；**RTO ≤ 4hr / RPO ≤ 15min**；DR 年運維 RMB 576 萬/年.
- 階段別 CapEx：建廠 M1–6 8,318 (19.1%)、裝機 M7–15 23,829 (54.8%)、試產 M16–21 8,884 (20.4%)、量產 M22+ 2,428 (5.6%)。OpEx 自裝機期起算.
- 治理：8 道 Gate、RACI（每議題唯一 A）、風險三級（紅/黃/綠）升級、DR 季度演練.
- 結果承諾：良率 ≥ 90% · SLO ≥ 95% · DR RTO ≤ 4hr · RPO ≤ 15min · 跨廠模板 100% 歸檔.
- 編制：92 人（建廠 9 → 裝機 45 → 試產 85 → 量產 92）。Contact email: roberto.hsu@gmail.com.
- 規劃匯率 USD 1 = RMB 7.2；金額單位 RMB 萬；報價基準 2026 Q2；發布 2026-06-10.

---

## 13. Deliverable & Tech

- Static, self-contained, no build step. Multi-page (see §14). Fonts from Google Fonts CDN.
- Vanilla JS only (no framework). Progressive enhancement: content readable with JS off
  (a `<noscript>` block neutralizes the `.reveal` initial state; default in-HTML text is 繁中).
- Must look intentional and polished at 1440 / 1024 / 390 widths.

---

## 14. Multi-page Site, i18n & Social  (v2 — extends, never contradicts §1-§12)

The site grows from one landing page into a 7-page corporate site sharing one chrome
(nav + footer), one stylesheet, one JS core, and a client-side i18n layer (繁中 / English /
简体中文). The Lithographic-Precision aesthetic (§3-§9) is unchanged and MUST stay identical
across every page — same tokens, fonts, motifs, motion, components. Consistency is a hard rule.

### 14.1 Pages (root-level files)
| File | Tab (繁) | Purpose |
|---|---|---|
| `index.html` | 首頁 (brand) | Existing landing page; retrofitted with the new chrome + i18n + social. |
| `about.html` | 關於 | Who we are: mission, positioning, governance/RACI as differentiator, delivery rhythm, milestones, values. |
| `solutions.html` | 解決方案 | Full-stack offering framed by the six layers + the 6 capability domains as solutions (what each solves + scope + outcome). |
| `technology.html` | 技術 | Engineering deep-dive: AI compute (GB300/Blackwell), network fabric, MES FAB300 modules, data & AI, security, resilience/DR, compliance. |
| `case-studies.html` | 案例 | FAB300 flagship deep-dive: scope, CapEx mix table, 4-phase delivery, outcomes/SLA, risk & compliance; cross-fab replication as roadmap. |
| `careers.html` | 招募 | Join us: the 92-person 4-phase hiring build, teams/roles, culture (拿授權、拿責任), representative open roles, apply CTA. |
| `contact.html` | 聯絡 | Accessible contact form (static), inquiry types, direct email, HQ coordinate panel. |

Each new page opens with the standard `.section-head` pattern (kicker + index + title + lede)
and a page-hero band, then 3-6 sections, then a closing CTA band reusing the home `#contact`
visual language. Pull all facts from §11-§12; never invent numbers. Keep new pages substantial
but not bloated (each ~4-6 screens).

### 14.2 Shared chrome — Nav
- Brand `SHINYLOGIC` + 顯藝科技 → links to `index.html`. Keep the top status strip and `[FAB300]` dot.
- **Page tabs** (replace the old in-page anchors): 關於 / 解決方案 / 技術 / 案例 / 招募 → their pages;
  the active page's tab gets `aria-current="page"` + a cyan underline/active style.
- **Language switcher**: a compact segmented control of 3 buttons — `繁` / `EN` / `简` — with
  `aria-pressed` reflecting the active locale; min 44×44px touch target; visible focus ring.
- CTA button `啟動建置規劃` → `contact.html`.
- Mobile (≤768): hamburger reveals tabs + language switcher + CTA in the panel (existing toggle pattern).
- The nav markup MUST be byte-identical across all pages except the active-tab marker. Same for footer.

### 14.3 Shared chrome — Footer
- Keep the existing footer, and add a sitemap row linking all 6 pages (grouped, e.g. 公司 / 能力 / 聯絡)
  plus the language switcher mirror. Identical across pages.

### 14.4 i18n contract  (繁中 default · English · 简体中文)
- Two JS files, loaded `defer` on every page, dictionary BEFORE runtime:
  `i18n-dict.js` (generated — defines `window.I18N = { "zh-Hant": {...}, "en": {...}, "zh-Hans": {...} }`)
  then `i18n.js` (hand-written runtime).
- Mark translatable text with `data-i18n="ns.key"`. The element's in-HTML text is the **繁中**
  value and the no-JS fallback. For attributes use `data-i18n-attr="aria-label:ns.key;placeholder:ns.key2"`.
  For markup-bearing strings use `data-i18n-html="ns.key"`.
- Runtime (`i18n.js`): on DOM ready read `localStorage['sl-lang']` (default `zh-Hant`); apply the
  dictionary to every `[data-i18n]/[data-i18n-attr]/[data-i18n-html]`; set `document.documentElement.lang`
  to `zh-Hant`/`en`/`zh-Hans`; wire the switcher buttons (set + persist + re-apply, no reload, update
  `aria-pressed`). Missing key → fall back to `zh-Hant` then to existing DOM text (never blank). Guard for
  absent `window.I18N`.
- **Key namespaces**: `nav.*`, `foot.*`, `cta.*`, `lang.*`, `common.*` (shared, owned by Foundation),
  and one per page: `home.*`, `about.*`, `sol.*`, `tech.*`, `case.*`, `careers.*`, `contact.*`.
- **Never translate** product/standard names or numerals/units shown as data (keep verbatim in all 3
  locales): NVIDIA GB300 NVL72, HGX B300, Blackwell Ultra, Quantum-X800, Spectrum-X, ConnectX-8, Applied
  SmartFactory FAB300, AVEVA PI, Omniverse, Claroty, Nozomi, SECS-GEM, GEM300, OPC UA, IEC 62443, SEMI
  E187, ISA-95, 等保 2.0 (en: "China MLPS 2.0 Level 3"), RTO/RPO/SLO/WSPM/PUE, GPU counts, percentages,
  M-prefixed months, dates.
- **Trilingual figure table** (use these EXACT renderings so all pages/locales agree):
  | concept | zh-Hant | en | zh-Hans |
  |---|---|---|---|
  | CapEx 一次性 | RMB 4.35 億 | RMB 435M | RMB 4.35 亿 |
  | 3 年 TCO | RMB 6.07 億 | RMB 607M | RMB 6.07 亿 |
  | OpEx 年費 | RMB 5,756 萬/年 | RMB 57.56M/yr | RMB 5,756 万/年 |
  | 階段別 (萬) | 8,318 / 23,829 / 8,884 / 2,428 萬 | RMB 83.18M / 238.29M / 88.84M / 24.28M | 8,318 / 23,829 / 8,884 / 2,428 万 |
  | 數據湖 | 4PB | 4PB | 4PB |
  | AI GPU | 248（216 GB300 + 32 HGX B300） | 248 (216 GB300 + 32 HGX B300) | 248（216 GB300 + 32 HGX B300） |
  Percentages (36.1% etc.), RTO ≤ 4hr, RPO ≤ 15min, 良率/yield ≥ 90%, SLO ≥ 95%, 300K WSPM,
  92 人/staff, 8 Gate are identical across locales (translate only the surrounding label words).
- English voice: precise, engineering-grade, no hype (mirror §2). 简体中文: faithful conversion of the
  繁中 copy (the original deck was Simplified — match its register).

### 14.5 Social — Open Graph, Twitter, favicon  (every page)
- `<head>` of each page includes, with per-page `og:title`/`og:description`/`og:url`:
  `og:type=website`, `og:site_name=顯藝科技 ShinyLogic`, `og:image=og-image.png` (+`og:image:width=1200`,
  `og:image:height=630`, `og:image:alt`), `og:locale=zh_Hant` + `og:locale:alternate` en_US & zh_Hans;
  `twitter:card=summary_large_image` + `twitter:title/description/image`. Also `<meta name="theme-color"
  content="#07090C">` and a canonical `<link rel="canonical">`.
- **favicon**: `favicon.svg` — a minimal mark on `--ink-900`: a concentric-ring wafer glyph or a tight
  `SL` monogram in `--cyan`, with one reticle tick. Link `<link rel="icon" href="favicon.svg"
  type="image/svg+xml">` (+ a `<link rel="mask-icon">` is optional). No emoji.
- **OG image** `og-image.png` (1200×630): generated by rendering `og-card.html` (a self-contained card
  in the brand language — graphite, wafer motif, SHINYLOGIC wordmark, tagline 把設備數據，鍛造成可決策的智能。,
  a few key metrics) and screenshotting it. Foundation builds `og-card.html`; the OG PNG is produced
  during verification.

### 14.6 UX rules to honor (from ui-ux-pro-max)
- SVG icons only (no emoji); consistent 24px viewBox. Visible `:focus-visible` rings everywhere.
- Touch targets ≥ 44px (nav tabs, lang buttons, form controls). Body ≥ 16px on mobile.
- Form: every input has an associated `<label for>`; inquiry type is a real `<select>`; clear error/help
  text; submit is a `<button type="submit">` (static demo — on submit, show an inline confirmation, no backend).
- `cursor:pointer` on all interactive elements; transitions 150-300ms; respect `prefers-reduced-motion`.
- Cross-page consistency: identical nav/footer, same max-width, same active-state convention.

### 14.7 File structure (v2)
```
index.html about.html solutions.html technology.html case-studies.html careers.html contact.html
styles.css        (shared, extended per-page with scoped blocks)
script.js         (shared core: reveal, counters, nav, accordion, dot-grid, etc.)
i18n-dict.js      (generated: window.I18N for all 3 locales)
i18n.js           (runtime: applies dict, wires switcher, persists)
favicon.svg  og-image.png  og-card.html
DESIGN.md
```
Every page links, in `<head>`: `styles.css`; and deferred: `i18n-dict.js`, `i18n.js`, `script.js`
(dict before runtime before core). Page-scoped CSS uses a `.p-<page>` body/root class prefix.
