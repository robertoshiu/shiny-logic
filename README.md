# 顯藝科技 ShinyLogic

Company website for **顯藝科技 / ShinyLogic** — an intelligent wafer-fab IT/OT full-stack
systems integrator. ShinyLogic designs and delivers the complete six-layer technology stack
for high-volume-manufacturing (HVM) semiconductor fabs: from equipment data, through an AI
decision loop, to cross-region disaster recovery.

🔗 **Live:** https://robertoshiu.github.io/shiny-logic/

## Highlights

- **7 pages** — Home · 關於 About · 解決方案 Solutions · 技術 Technology ·
  案例 Case Studies (FAB300) · 招募 Careers · 聯絡 Contact.
- **Trilingual** — 繁體中文 (default) · English · 简体中文. In-place switcher, no reload,
  persisted in `localStorage`; product/standard names kept verbatim.
- **Design** — "Lithographic Precision": dark graphite + phosphor-cyan, Saira / IBM Plex Mono /
  Noto Sans TC, blueprint grid, reticle marks, a 300 mm wafer motif. See [`DESIGN.md`](DESIGN.md).
- **Static & dependency-free** — hand-written HTML/CSS/vanilla JS, no build step, fonts from
  Google Fonts. Progressive enhancement (readable with JS off).

## Structure

```
index.html  about.html  solutions.html  technology.html  case-studies.html  careers.html  contact.html
styles.css            shared stylesheet
script.js             shared interactions (reveal, counters, accordion, GPU dot-grid, nav)
i18n-dict.js          generated dictionary (window.I18N, 3 locales)
i18n.js               i18n runtime (apply + switch + persist)
favicon.svg  og-image.png  og-card.html
DESIGN.md             design system + content blueprint (source of truth)
```

## Local development

```bash
python -m http.server 8347   # then open http://localhost:8347/
```
Use a local server (not `file://`) so the relative `i18n` / `script` links resolve.

---

This site is a design/engineering showcase. Figures reference a representative FAB300
reference build (planning rate USD 1 = RMB 7.2).
