"""Build the Crossover Branding site in the Theme 2 (thiswasmajor.com) grammar.

Pages: index (featured slideshow), work (portfolio), about, contact, work/<slug> (case studies).
Run:  python3 src/build.py   (python3 src/images.py first if project images changed)
"""
import html, os, re, sys, pathlib
sys.path.insert(0, os.path.dirname(__file__))
from data import PROJECTS, SERVICES, PRACTICE, SHIFT, CONTACT

ROOT = pathlib.Path(__file__).resolve().parent.parent
e = html.escape
YEAR = 2026
FEATURED = [p for p in PROJECTS if p.get('featured')]

# ---------- logo SVGs (paths from the gradient master) ----------
logo_src = (ROOT / 'images/crossover-logo-gradient.svg').read_text()
PATHS = re.findall(r'<path([^>]*)/>', logo_src)  # 13 "crossover" paths, then 8 "BRANDING" letters
VIEWBOX = '0 0 774.99 166.65'
GRAD = ('<linearGradient id="{id}" gradientUnits="userSpaceOnUse" x1="0" y1="190" x2="0" y2="-20">'
        '<stop offset="0" stop-color="#B48655"/><stop offset="1" stop-color="#E6C79C"/></linearGradient>')


def logo(cls, fill='currentColor', grad_id=None):
    paths = ''.join(f'<path class="lp" data-row="{"word" if i < 13 else "brand"}"'
                    f'{a.replace("url(#cg)", f"url(#{grad_id})" if grad_id else fill)}/>' for i, a in enumerate(PATHS))
    defs = f'<defs>{GRAD.format(id=grad_id)}</defs>' if grad_id else ''
    return (f'<svg class="{cls}" viewBox="{VIEWBOX}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" '
            f'focusable="false">{defs}{paths}</svg>')


def mark(cls='mark-svg', fill='currentColor', grad_id=None):
    parts = ''.join(f'<path class="mk mk-{n}"{PATHS[i].replace("url(#cg)", f"url(#{grad_id})" if grad_id else fill)}/>'
                    for n, i in zip('abc', (7, 8, 9)))
    defs = f'<defs>{GRAD.format(id=grad_id)}</defs>' if grad_id else ''
    return f'<svg class="{cls}" viewBox="156 0 96 95" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{defs}{parts}</svg>'


def loader_logo():
    """Loader lockup (approved HyperFrames sting): the first "o" starts large and travels home."""
    def p(i, cls):
        return f'<path class="{cls}"{PATHS[i].replace("url(#cg)", "url(#cg-load)")}/>'
    shards = ''.join(p(i, f'loader-shard mk-{n}') for n, i in zip('abc', (7, 8, 9)))
    word = ''.join(p(i, 'loader-lw') for i in (0, 1, 2, 3, 4, 5, 6, 10, 11, 12))
    brand = ''.join(p(i, 'loader-lb') for i in range(13, 21))
    defs = (f'<defs>{GRAD.format(id="cg-load")}'
            '<clipPath id="load-cw"><rect x="-2" y="-2" width="780" height="99"/></clipPath>'
            '<clipPath id="load-cb"><rect x="-2" y="108" width="780" height="60"/></clipPath></defs>')
    return (f'<svg class="loader-svg" viewBox="{VIEWBOX}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
            f'{defs}<g clip-path="url(#load-cw)">{word}</g><g clip-path="url(#load-cb)">{brand}</g>'
            f'<g class="loader-mark">{shards}</g></svg>')


# ---------- shared chrome ----------
def head(title, desc, r):
    return f'''<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#0A0908">
<link rel="icon" href="{r}images/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300;400;500&family=League+Gothic&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.css">
<link rel="stylesheet" href="{r}css/crossover.css">
<script>
  document.documentElement.classList.replace('no-js', 'js');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  try {{ if (sessionStorage.getItem('crossover:loader-played') === '1') document.documentElement.classList.add('loader-skip'); }} catch (e) {{}}
</script>
</head>
'''


def roll(txt):
    """Theme 2 nav hover: the label rolls up through stacked copies."""
    t = e(txt)
    return f'<span class="roll" aria-hidden="true"><span>{t}</span><span>{t}</span></span><span class="sr-only">{t}</span>'


def nav(r, current):
    def link(href, label, key, count=None):
        c = f'<sup class="nav-count">[{count}]</sup>' if count is not None else ''
        cur = ' is-current' if key == current else ''
        return f'<a href="{href}" class="nav-link{cur}" data-key="{key}">{roll(label)}{c}</a>'
    return f'''<header class="nav">
  <div class="nav-col nav-col--l">
    {link(f"{r}index.html", "Featured Work", "home", len(FEATURED))}
    {link(f"{r}work.html", "Work", "work", len(PROJECTS))}
  </div>
  <a href="{r}index.html" class="nav-logo" aria-label="Crossover Branding — home">{logo("nav-svg")}</a>
  <div class="nav-col nav-col--r">
    {link(f"{r}about.html", "About", "about")}
    {link(f"{r}contact.html", "Contact", "contact")}
  </div>
  <button class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><i></i><i></i><i></i></button>
</header>

<div class="menu" id="menu" aria-hidden="true">
  <nav class="menu-links">
    <a href="{r}index.html" class="menu-link"><span>Featured Work</span><sup>[{len(FEATURED)}]</sup></a>
    <a href="{r}work.html" class="menu-link"><span>Work</span><sup>[{len(PROJECTS)}]</sup></a>
    <a href="{r}about.html" class="menu-link"><span>About</span></a>
    <a href="{r}contact.html" class="menu-link"><span>Contact</span></a>
  </nav>
  <div class="menu-foot mono">
    <a href="mailto:{CONTACT["emails"][0]}">{CONTACT["emails"][0]}</a>
    <span>Dubai · India</span>
  </div>
</div>

<div class="curtain" aria-hidden="true"></div>
'''


def footer(r):
    ph = ''.join(f'<a href="{h}" class="foot-link">{roll(t)}</a>' for t, h in CONTACT['phones'])
    return f'''<footer class="footer">
  <div class="footer-glow" aria-hidden="true"></div>
  <div class="footer-top">
    <div class="footer-brand">
      <a href="{r}index.html" class="footer-logo" aria-label="Crossover Branding">{logo("footer-svg", grad_id="cg-foot")}</a>
      <div class="footer-based">
        <span class="mono dim">Based in</span><span class="arrow-r" aria-hidden="true"></span>
        <span class="pill">Dubai</span><span class="pill">India</span>
      </div>
      <div class="footer-based">
        <span class="mono dim">Available worldwide</span><span class="arrow-r" aria-hidden="true"></span>
        <span class="pill pill--globe" aria-hidden="true">{mark("globe-mark")}</span>
      </div>
    </div>
    <nav class="footer-cols">
      <div class="footer-col">
        <a href="{r}index.html" class="foot-link">{roll("Home")}</a>
        <a href="{r}work.html" class="foot-link">{roll("Work")}</a>
        <a href="{r}about.html" class="foot-link">{roll("About")}</a>
        <a href="{r}contact.html" class="foot-link">{roll("Contact")}</a>
      </div>
      <div class="footer-col">
        <a href="{CONTACT["instagram"]}" target="_blank" rel="noopener" class="foot-link foot-link--ext">{roll("Instagram")}</a>
        <a href="mailto:{CONTACT["emails"][0]}" class="foot-link foot-link--ext">{roll("Email")}</a>
        {ph}
      </div>
    </nav>
  </div>
  <div class="footer-legal mono">
    <span>© {YEAR} Crossover Branding. All rights reserved.</span>
    <span>Conceived, crafted &amp; presented by the Crossover team.</span>
    <a href="#top" class="to-top">Back to top ↑</a>
  </div>
</footer>
'''


THREE_TAGS = '''<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
<script type="module" src="{r}js/mark3d.js"></script>'''

SCRIPTS = '''
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/InertiaPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>
<script src="{r}js/crossover.js"></script>{three}
</body>
</html>
'''


def page(name, title, desc, body, r='', current=None, foot=True):
    out = head(title, desc, r) + f'<body data-page="{name}">\n' + nav(r, current)
    out += f'<main class="page page--{name}" id="top">\n{body}\n</main>\n'
    if foot:
        out += footer(r)
    three = ('\n' + THREE_TAGS) if 'data-mark3d' in body else ''  # Three.js only where a 3D mark lives
    if 'data-stage' in body:
        three += f'\n<script type="module" src="{r}js/stages3d.js"></script>'
    out += SCRIPTS.replace('{three}', three).replace('{r}', r)
    return out


def tags(p, cls='tag'):
    return ''.join(f'<span class="{cls}">{e(s)}</span>' for s in p['services'])


def img(src, alt, cls='', lazy=True, extra=''):
    return f'<img src="{src}" alt="{e(alt)}"{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}{" loading=" + chr(34) + "lazy" + chr(34) if lazy else ""}{extra}>'


# ---------- home: featured slideshow ----------
def home():
    n = len(FEATURED)
    slides = []
    for i, p in enumerate(FEATURED):
        slides.append(f'''
    <a href="work/{p["slug"]}.html" class="slide{" is-active" if i == 0 else ""}" data-i="{i}" aria-label="{e(p["name"])} — view project">
      <div class="slide-media">{img(f"images/work/{p['slug']}-slide.webp", p['name'] + ' — ' + p['kind'], 'slide-img', lazy=i > 0)}</div>
    </a>''')
    titles = ''.join(f'<span class="stage-title" data-i="{i}">{e(p["name"])}</span>' for i, p in enumerate(FEATURED))
    kinds = ''.join(f'<span class="stage-kind" data-i="{i}">{e(p["services"][0])}</span>' for i, p in enumerate(FEATURED))
    bars = ''.join(f'<button class="bar" data-i="{i}" aria-label="Show {e(p["name"])}"><i></i></button>' for i, p in enumerate(FEATURED))
    body = f'''
  <div class="loader" aria-hidden="true">
    <div class="loader-bloom"></div>
    <div class="loader-line loader-line--h"></div>
    <div class="loader-line loader-line--v"></div>
    <div class="loader-logo">{loader_logo()}</div>
    <div class="loader-meta">
      <span class="loader-mask"><span class="loader-meta-txt">( Strategic Brand Development )</span></span>
      <span class="loader-mask"><span class="loader-meta-txt loader-nbr-txt">000</span></span>
      <span class="loader-mask"><span class="loader-meta-txt">Dubai · India</span></span>
    </div>
    <div class="loader-bar"><i></i></div>
  </div>

  <section class="stage" aria-label="Featured work">
    <h1 class="sr-only">Crossover Branding — featured work</h1>
    <div class="slides">{"".join(slides)}
    </div>
    <div class="stage-shade" aria-hidden="true"></div>
    <div class="stage-meta">
      <div class="stage-kinds">{kinds}</div>
      <a href="work/{FEATURED[0]["slug"]}.html" class="stage-titles" aria-hidden="true" tabindex="-1">{titles}</a>
      <div class="stage-index mono"><b class="stage-cur">01</b> / {n:02d}</div>
    </div>
    <div class="stage-foot">
      <div class="bars">{bars}</div>
      <div class="stage-legal">
        <span>© {YEAR} Crossover Branding. All rights reserved.</span>
        <span class="stage-links"><a href="{CONTACT["instagram"]}" target="_blank" rel="noopener">Instagram</a><a href="mailto:{CONTACT["emails"][0]}">Email</a></span>
        <span class="hide-sm">Strategic Brand Development · Dubai · India</span>
      </div>
    </div>
    <a href="work.html" class="stage-scroll mono"><span class="stage-scroll-ic" aria-hidden="true"></span>Scroll for all work</a>
  </section>
'''
    return page('home', "Crossover Branding — Don't follow the industry. Crossover it.",
                'Crossover Branding turns innovative thinking into distinctive brand voice, powerful visual language and '
                'strategic communication through Strategic Brand Development.', body, current='home', foot=False)


# ---------- work: portfolio ----------
def work():
    # filter by the main disciplines; signage/environmental work files under Wayfinding
    services = ['Brand Identity', 'Packaging', 'Campaign', 'Stationery', 'Wayfinding', 'Naming']
    chips = '<button class="chip is-on" data-filter="*">All</button>' + ''.join(
        f'<button class="chip" data-filter="{e(s)}">{e(s)}</button>' for s in services)
    rows = []
    for i, p in enumerate(PROJECTS, 1):
        rows.append(f'''
      <article class="row" data-services="{e("|".join(p["services"]))}" data-name="{e(p["name"].lower())} {e(p["kind"].lower())}">
        <span class="row-num mono">#{i:02d}</span>
        <a href="work/{p["slug"]}.html" class="row-media" data-cursor="view">
          {img(f"images/work/{p['slug']}-card.webp", p['name'] + ' — ' + p['kind'], 'row-img')}
          <span class="row-overlay"><span class="row-name-sm">{e(p["name"])}</span><span class="row-kind-sm">{e(p["kind"])}</span></span>
        </a>
        <div class="row-info">
          <div class="row-head">
            <h2 class="row-name"><a href="work/{p["slug"]}.html">{e(p["name"])}</a></h2>
            <span class="row-count mono">{len(p["imgs"]):02d} img</span>
          </div>
          <p class="row-kind">{e(p["kind"])}</p>
          <div class="row-tags">{tags(p)}</div>
        </div>
      </article>''')
    body = f'''
  <section class="w-hero">
    <div class="w-hero-glow" aria-hidden="true"></div>
    <h1 class="w-hero-title" aria-label="Work"><span>W</span><span>o</span><span>r</span><span>k</span></h1>
    <div class="w-hero-mark" aria-hidden="true"><div class="mark3d" data-mark3d="work">{mark("drag-mark mark3d-fallback", grad_id="cg-drag")}</div><span class="drag-hint mono">Drag to spin</span></div>
    <p class="w-hero-sub">{len(PROJECTS)} brands built with Strategic Brand Development — identities, packaging, campaigns and wayfinding.</p>
    <a href="#work-list" class="w-hero-scroll mono"><span aria-hidden="true">↓</span> Scroll for more <span aria-hidden="true">↓</span></a>
  </section>

  <section class="w-list" id="work-list">
    <div class="w-filter">
      <label class="search"><span class="sr-only">Search projects</span><input type="search" placeholder="Search…" autocomplete="off"></label>
      <div class="chips">{chips}</div>
    </div>
    <div class="rows">{"".join(rows)}
    </div>
    <p class="w-empty mono" hidden>No projects match — try another filter.</p>
  </section>
'''
    return page('work', 'Work — Crossover Branding',
                'Selected brand identity, packaging, campaign and wayfinding work by Crossover Branding.', body, current='work')


# ---------- about ----------
def about():
    svc = ''.join(f'''
        <article class="svc-card">
          <div class="svc-3d" data-stage="{i}" aria-hidden="true"></div>
          <span class="svc-num mono">{i:02d}</span>
          <h3 class="svc-title">{e(t)}</h3>
          <p class="svc-short">{e(s)}</p>
          <ul class="svc-list">{"".join(f"<li>{e(b)}</li>" for b in bl)}</ul>
        </article>''' for i, (t, s, bl) in enumerate(SERVICES, 1))
    prac = ''.join(f'<div class="prac{" is-key" if t == "Branding" else ""}"><h3 class="prac-title">{e(t)}</h3><p>{e(d)}</p></div>' for t, d in PRACTICE)
    shift = ''.join(f'<div class="shift-row"><span class="shift-from">{a}</span><span class="shift-arrow"></span><span class="shift-to">{b}</span></div>' for a, b in SHIFT)
    clients = ''.join(f'<a href="work/{p["slug"]}.html" class="client"><span class="client-name">{e(p["name"])}</span><span class="client-kind mono">{e(p["services"][0])}</span></a>' for p in PROJECTS)
    mq = '<span>Rethink.</span> <em>Redefine.</em> <span>Reinvent.</span>' + f'<span class="mq-mark">{mark("mq-svg", grad_id="cg-mq")}</span>'
    body = f'''
  <section class="a-hero">
    <div class="a-hero-glow" aria-hidden="true"></div>
    <div class="a-hero-3d" aria-hidden="true"><div class="mark3d" data-mark3d="about">{mark("mark3d-fallback", grad_id="cg-ab")}</div></div>
    <p class="a-hero-lead" data-reveal>Crossover turns innovative thinking into distinctive brand voice, powerful visual language and strategic communication.</p>
  </section>

  <section class="a-intro">
    <h1 class="a-label">About Us</h1>
    <div class="a-cols">
      <p data-reveal>Groundbreaking ideas can reshape industries — but their impact depends on how clearly they are communicated. Innovation deserves to be understood.</p>
      <p data-reveal>Our proprietary Strategic Brand Development methodology turns innovative thinking into a distinctive brand voice, a powerful visual language and strategic communication.</p>
      <p data-reveal>Our processes are deeply rooted in the business strategies they support — informed by research and strategic insights that guide tangible recommendations. The result: revolutionary yet grounded solutions to the most sophisticated brand challenges.</p>
      <p data-reveal>Brands are highly valued business assets — both on the balance sheet and in the minds of those in the market. Strategic Brand Development is the foundation from which all effective brand communications should originate.</p>
    </div>
  </section>

  <div class="marquee" aria-label="Rethink. Redefine. Reinvent.">
    <div class="marquee-track">
      <div class="marquee-item">{mq}</div><div class="marquee-item" aria-hidden="true">{mq}</div>
    </div>
  </div>

  <section class="svc" id="services">
    <div class="svc-head">
      <h2 class="svc-heading">Services<span class="accent">.</span></h2>
      <div class="svc-nav"><button class="svc-arrow" data-dir="-1" aria-label="Previous service">←</button><button class="svc-arrow" data-dir="1" aria-label="Next service">→</button></div>
    </div>
    <div class="svc-viewport"><div class="svc-track">{svc}
    </div></div>
  </section>

  <section class="mission">
    <h2 class="giant" data-giant>The M-Shift</h2>
    <p class="mission-sub mono">M — the Makeover method</p>
    <div class="mission-body">
      <p class="mission-copy" data-reveal>The M-Shift is Crossover's proprietary makeover method — designed to uncover opportunities, reshape business thinking and create meaningful change. Through market analysis, design thinking and strategic transformation, we help businesses evolve how they function, are portrayed and are perceived.</p>
      <div class="shift">{shift}</div>
    </div>
  </section>

  <section class="practice">
    <div class="practice-head">
      <span class="mono dim">We practice</span>
      <h2 class="practice-title" data-reveal>Give them a reason to believe. <span class="accent">Give them a reason to remember.</span></h2>
    </div>
    <div class="prac-grid">{prac}</div>
  </section>

  <section class="clients">
    <h2 class="clients-title" data-reveal>Shaping brands together</h2>
    <div class="client-grid">{clients}</div>
  </section>
'''
    return page('about', 'About — Crossover Branding',
                'Crossover Branding: Strategic Brand Development, services and the M-Shift makeover method.', body, current='about')


# ---------- contact ----------
def contact():
    phones = ''.join(f'<a href="{h}" class="c-link">{e(t)}</a>' for t, h in CONTACT['phones'])
    mails = ''.join(f'<a href="mailto:{m}" class="c-link">{e(m)}</a>' for m in CONTACT['emails'])
    body = f'''
  <section class="c-hero">
    <div class="c-glow" aria-hidden="true"></div>
    <div class="c-3d" aria-hidden="true"><div class="mark3d" data-mark3d="contact">{mark("mark3d-fallback", grad_id="cg-ct")}</div></div>
    <div class="c-grid">
      <div class="c-intro">
        <h1 class="c-title" data-giant>Think with us</h1>
        <p class="c-lead" data-reveal>To learn more about Strategic Brand Development, discuss a project, or explore our services — reach out and start the conversation.</p>
        <div class="c-direct">
          <div><span class="mono dim">Call</span>{phones}</div>
          <div><span class="mono dim">Write</span>{mails}</div>
          <div><span class="mono dim">Follow</span><a href="{CONTACT["instagram"]}" target="_blank" rel="noopener" class="c-link">@crossover_studios</a></div>
        </div>
      </div>
      <form class="c-form" data-mailto="{CONTACT["emails"][0]}" novalidate>
        <div class="c-form-head"><span>Contact Us</span>{mark("c-form-mark", grad_id="cg-form")}</div>
        <div class="c-row2">
          <label><span class="sr-only">Name</span><input name="name" placeholder="Name*" required></label>
          <label><span class="sr-only">Organization</span><input name="organization" placeholder="Organization*" required></label>
        </div>
        <label><span class="sr-only">Email</span><input name="email" type="email" placeholder="Email*" required></label>
        <label><span class="sr-only">How did you hear about us?</span><input name="source" placeholder="How did you hear about us?"></label>
        <label><span class="sr-only">Estimated budget</span><input name="budget" placeholder="Estimated budget?"></label>
        <label><span class="sr-only">Message</span><textarea name="message" rows="6" placeholder="Message*" required></textarea></label>
        <button type="submit" class="c-submit">Submit</button>
        <p class="c-note mono" role="status" aria-live="polite"></p>
      </form>
    </div>
  </section>
'''
    return page('contact', 'Contact — Crossover Branding',
                'Contact Crossover Branding in Dubai and India to discuss Strategic Brand Development.', body, current='contact')


# ---------- case study ----------
def case(i, p):
    r = '../'
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    n = len(p['imgs'])
    gallery = ''.join(
        f'<figure class="g-item{" g-item--wide" if (k % 3 == 1 or n - 1 < 2) else ""}" data-reveal-img>'
        f'{img(f"{r}images/work/{p['slug']}-{k + 1:02d}.webp", f"{p['name']} — image {k + 1}")}</figure>'
        for k in range(1, n))
    body = f'''
  <section class="cs-hero">
    <div class="cs-bg" aria-hidden="true">{img(f"{r}images/work/{p['slug']}-card.webp", "", lazy=False)}</div>
    <figure class="cs-media">{img(f"{r}images/work/{p['slug']}-01.webp", p['name'] + ' — ' + p['kind'], lazy=False)}</figure>
  </section>

  <section class="cs-info">
    <div class="cs-top">
      <a href="{r}work.html" class="cs-back mono">← All work</a>
      <span class="cs-idx mono">#{i + 1:02d} / {len(PROJECTS):02d}</span>
    </div>
    <h1 class="cs-title" data-giant>{e(p["name"])}</h1>
    <div class="cs-grid">
      <div class="cs-meta">
        <p class="cs-kind">{e(p["kind"])}</p>
        <div class="row-tags">{tags(p)}</div>
      </div>
      <p class="cs-blurb" data-reveal>{e(p["blurb"])}</p>
    </div>
  </section>

  {f'<section class="gallery">{gallery}</section>' if gallery else ''}

  <a href="{nxt["slug"]}.html" class="next">
    <span class="mono dim">Next project</span>
    <span class="next-name">{e(nxt["name"])}</span>
    <span class="next-media">{img(f"{r}images/work/{nxt['slug']}-card.webp", "")}</span>
  </a>
'''
    return page('case', f'{p["name"]} — Crossover Branding',
                f'{p["name"]} ({p["kind"]}): {", ".join(p["services"])} by Crossover Branding.', body, r=r, current='work')


def write(rel, s):
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(s)


write('index.html', home())
write('work.html', work())
write('about.html', about())
write('contact.html', contact())
for i, p in enumerate(PROJECTS):
    write(f'work/{p["slug"]}.html', case(i, p))
write('images/favicon.svg', mark().replace('currentColor', '#B48655').replace('class="mark-svg" ', ''))
print('built', 4 + len(PROJECTS), 'pages')
