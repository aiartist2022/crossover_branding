# Crossover Branding — website

Multi-page marketing site for **Crossover Branding** (Strategic Brand Development, Dubai · India).
Design language follows the "Theme 2" reference (a dark, condensed-type portfolio site), re-skinned in
Crossover's bronze and gold on black, with real-time 3D brand elements built in Three.js.

It is a **plain static site** — HTML, CSS, JavaScript and images. There is no server code, no build step
required to host it, and no dependency on Webflow.

## Pages

| File | Page |
|---|---|
| `index.html` | Home — full-screen featured-work slideshow (6 projects), first-visit loader animation |
| `work.html` | Work — all 13 projects, search + discipline filter, draggable 3D Crossover mark |
| `work/<slug>.html` | 13 case-study pages (cover, services, description, gallery, next project) |
| `about.html` | About — 3D mark hero, intro, marquee, services carousel with 3D stage icons, The M-Shift, practice, clients |
| `contact.html` | Contact — direct lines + enquiry form, 3D mark that assembles as you scroll / start the form |

## Structure

```
index.html  work.html  about.html  contact.html  work/*.html   ← generated pages (ready to host)
css/crossover.css        all styles
js/crossover.js          motion system: page transitions, slideshow, reveals, filters, carousel (GSAP + Lenis)
js/mark3d.js             real-time 3D Crossover mark (Three.js), extruded from the logo paths
js/stages3d.js           the 8 service-stage 3D icons, scrubbed by scroll / swipe
images/                  logos, favicon, project images (images/work), stage-icon style tests (images/stages)
src/data.py              all content: projects, services, practice, contact details
src/build.py             generates every HTML page from data.py
src/images.py            exports/crops project images from the original image folder
```

## Run it locally

```bash
python3 -m http.server 5190
```

Then open http://localhost:5190. (Open it through a local server rather than double-clicking the HTML
files — the 3D modules need to be served over http.)

## Edit content and rebuild

1. Change text, projects or contact details in `src/data.py`.
2. Rebuild the pages: `python3 src/build.py`
3. If project images changed: `python3 src/images.py` (it reads from the original image folder path set
   in `src/data.py` → `SRC`; update that path on a new machine).

## Hosting (no Webflow needed)

Any static host works. All of these have a free tier and serve this folder as-is:

- **GitHub Pages** — repo Settings → Pages → Deploy from branch → `main` / root. Site appears at
  `https://<user>.github.io/crossover_branding/`. Custom domain supported.
- **Netlify** — "Add new site → Import from Git", pick this repo, no build command, publish directory `/`.
- **Vercel** — import the repo, framework preset "Other", no build command.
- **Cloudflare Pages** — connect the repo, no build command, output directory `/`.

All internal links are relative, so the site also works from a sub-path (as on GitHub Pages).

### Contact form (Hostinger / any PHP host)

The form posts to `contact.php`, which emails each enquiry to the address set in `TO`/`FROM` at the top of
that file (`FROM` must be a mailbox on the hosting domain). It needs PHP hosting (Hostinger shared hosting
has it); on static-only hosts or local preview it falls back to opening the visitor's email app.

## Libraries & fonts (all loaded from public CDNs)

- GSAP 3.13 (ScrollTrigger, SplitText, Draggable, Inertia) and Lenis — via jsDelivr
- Three.js 0.170 — via jsDelivr (import map in the page footer)
- Fonts via Google Fonts: League Gothic (display), Host Grotesk (body), Roboto Mono (labels) — all
  open-licensed

## Notes

- Motion respects `prefers-reduced-motion` (static renders, no scroll animation).
- 3D falls back to the flat SVG mark if WebGL is unavailable.
- Project descriptions in `src/data.py` describe what the images show — review before launch.
