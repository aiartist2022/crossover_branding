# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for Crossover Branding (HTML/CSS/JS, no framework, no package.json, no tests, no linter). The HTML pages are **generated** by a Python script and committed; hosting just serves the repo root.

## Commands

```bash
python3 -m http.server 5190   # serve locally (must be over http — the Three.js ES modules won't load from file://)
python3 src/build.py          # regenerate index.html, work.html, about.html, contact.html, work/*.html
python3 src/images.py         # re-export project images into images/work/ (needs Pillow; see caveat below)
```

There is no test or lint command. Verify changes by rebuilding and loading the site in a browser.

## Architecture

**Never hand-edit the generated HTML** (`index.html`, `work.html`, `about.html`, `contact.html`, `work/*.html`) — `python3 src/build.py` overwrites them.

- `src/data.py` — all content: `PROJECTS` (13; those with `featured` appear in the home slideshow), `SERVICES`, `PRACTICE`, `SHIFT`, `CONTACT`. Also `SRC`, an absolute path on the original author's Mac for source images.
- `src/build.py` — holds every page template as Python string functions (`home()`, `work()`, `about()`, `contact()`, `case()` per project) plus shared `head()`, `nav()`, `footer()`, and the script tags (`SCRIPTS`, `THREE_TAGS` import map). It also inlines the logo SVG paths from `images/crossover-logo-*.svg` (13 "crossover" paths then 8 "BRANDING" letters) for the animated loader/mark. Layout or markup changes go here; copy changes go in `data.py`.
- `css/crossover.css` — single stylesheet for all pages.
- `js/crossover.js` — the motion system (GSAP + ScrollTrigger/SplitText/Draggable/Inertia + Lenis, loaded from jsDelivr). It picks per-page behaviour from `<body data-page="home|work|about|contact|case">`, and scroll/reveal effects from `data-reveal`, `data-giant`, `data-reveal-img`, `data-cursor` attributes emitted by `build.py`. The contact form validates, then opens a `mailto:` (handler in `contact()`); there is no form backend.
- `js/mark3d.js`, `js/stages3d.js` — Three.js (0.170, via import map) scenes: the extruded 3D logo mark and the eight service-stage icons. Both fall back to flat SVG without WebGL; motion honors `prefers-reduced-motion`.

All internal links are relative (site must work from a sub-path such as GitHub Pages); `build.py` passes a relative-prefix `r` into templates (`''` at root, `'../'` for `work/`) — preserve this when adding pages.

## Gotchas

- `src/images.py` reads originals from `SRC` in `src/data.py`, which only exists on the original author's machine; update it before running elsewhere. The generated `images/work/*.webp` (`-card`, `-slide`, `-NN` variants) are committed, so you normally don't need to run it.
- All libraries and fonts come from public CDNs; there is nothing to install.
- Project descriptions in `data.py` were written from the images and are flagged in the README for review before launch.
