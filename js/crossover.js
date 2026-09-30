/* ==========================================================================
   Crossover Branding — Theme 2 motion system
   GSAP 3.13 (ScrollTrigger, SplitText, Draggable, Inertia) + Lenis.
   Page is chosen by <body data-page>: home | work | about | contact | case.
   ========================================================================== */
(() => {
  const html = document.documentElement;
  const curtain = document.querySelector('.curtain');
  if (!window.gsap || !window.ScrollTrigger) {
    html.classList.replace('js', 'no-js');
    curtain && curtain.remove();
    document.querySelector('.loader')?.remove();
    return;
  }
  gsap.registerPlugin(ScrollTrigger, ...[window.SplitText, window.Draggable, window.InertiaPlugin].filter(Boolean));

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const PAGE = document.body.dataset.page;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const EASE = 'expo.out';

  /* ---------- Smooth scroll (not on the fixed home stage) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis && PAGE !== 'home') {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); };

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (ev) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    ev.preventDefault();
    lenis ? lenis.scrollTo(target, { duration: 1.4 }) : (target === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' }));
  }));

  /* ---------- Page transitions (curtain) ---------- */
  const reveal = () => gsap.to(curtain, { opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.05 });
  function go(url) {
    lock(true);
    gsap.to(curtain, { opacity: 1, duration: 0.45, ease: 'power2.in', onComplete: () => { location.href = url; } });
  }
  addEventListener('pageshow', (ev) => { if (ev.persisted) gsap.set(curtain, { opacity: 0 }); });
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href]');
    if (!a || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
    const href = a.getAttribute('href');
    if (a.target === '_blank' || href.startsWith('#') || /^(mailto|tel):/.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.href === location.href) return;
    ev.preventDefault();
    if (html.classList.contains('menu-open')) toggleMenu(false);
    go(url.href);
  });

  /* ---------- Nav + menu ---------- */
  const nav = $('.nav');
  if (PAGE !== 'home') {
    ScrollTrigger.create({ start: 80, end: 'max', onToggle: (s) => nav.classList.toggle('is-solid', s.isActive) });
  }
  const menu = $('.menu');
  const menuBtn = $('.menu-btn');
  let menuTl;
  function toggleMenu(open) {
    const on = open ?? !html.classList.contains('menu-open');
    html.classList.toggle('menu-open', on);
    menuBtn.setAttribute('aria-expanded', on);
    menuBtn.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !on);
    menuTl?.kill();
    lock(on);
    menuTl = on
      ? gsap.timeline().set(menu, { visibility: 'visible' })
          .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
          .fromTo($$('.menu-link span, .menu-link sup'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.05 }, '-=0.4')
          .fromTo('.menu-foot', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.5')
      : gsap.timeline().to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut' }).set(menu, { visibility: 'hidden' });
  }
  menuBtn.addEventListener('click', () => toggleMenu());
  addEventListener('keydown', (ev) => ev.key === 'Escape' && html.classList.contains('menu-open') && toggleMenu(false));

  /* ---------- Cursor label (desktop) ---------- */
  if (!touch) {
    const cur = document.createElement('div');
    cur.className = 'cursor';
    cur.innerHTML = '<div class="cursor-ball"></div>';
    document.body.appendChild(cur);
    const ball = $('.cursor-ball', cur);
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('pointermove', (ev) => { xTo(ev.clientX); yTo(ev.clientY); });
    document.addEventListener('pointerover', (ev) => {
      const t = ev.target.closest('[data-cursor]');
      cur.classList.toggle('is-on', !!t);
      if (t) ball.textContent = t.dataset.cursor;
    });
  }

  /* ---------- Reveal grammar ---------- */
  const split = (el, type) => (window.SplitText ? SplitText.create(el, { type, mask: type === 'chars' ? 'chars' : 'lines', linesClass: 'line-child' }) : null);
  function reveals() {
    $$('[data-reveal]').forEach((el) => {
      gsap.set(el, { opacity: 1 });
      if (reduce) return;
      const s = split(el, 'lines');
      if (!s) return;
      gsap.from(s.lines, { yPercent: 110, duration: 1.3, ease: EASE, stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    $$('[data-giant]').forEach((el) => {
      if (reduce) return;
      const s = split(el, 'chars');
      if (!s) return;
      gsap.from(s.chars, { yPercent: 105, duration: 1.4, ease: EASE, stagger: 0.035, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('[data-reveal-img]').forEach((el) => {
      gsap.set(el, { opacity: 1 });
      if (reduce) return;
      gsap.fromTo(el, { clipPath: 'inset(12% 6% 12% 6% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 8px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 45%', scrub: 1 } });
      gsap.fromTo($('img', el), { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Loader (approved HyperFrames sting) ---------- */
  function runLoader() {
    const loader = $('.loader');
    if (!loader) return Promise.resolve();
    let skip = false;
    try { skip = sessionStorage.getItem('crossover:loader-played') === '1'; } catch (e) {}
    if (skip || reduce) { loader.remove(); return Promise.resolve(); }
    try { sessionStorage.setItem('crossover:loader-played', '1'); } catch (e) {}
    gsap.set(curtain, { opacity: 0 });
    return new Promise((resolve) => {
      const nbr = $('.loader-nbr-txt');
      const svg = $('.loader-svg', loader);
      const markO = $('.loader-mark', svg);
      const shards = $$('.loader-shard', svg);
      const O = { x: 204, y: 47.4 };
      const C = { x: 387.5, y: 83.3 };
      const cx = (el) => { const b = el.getBBox(); return b.x + b.width / 2; };
      const letters = $$('.loader-lw', svg).sort((a, b) => Math.abs(cx(a) - O.x) - Math.abs(cx(b) - O.x));
      const brand = $$('.loader-lb', svg).sort((a, b) => cx(a) - cx(b));
      const mid = (brand.length - 1) / 2;
      const meta = $$('.loader-meta-txt', loader);
      const count = { v: 0 };
      gsap.set(markO, { x: C.x - O.x, y: C.y - O.y, scale: 2.7, svgOrigin: `${O.x} ${O.y}` });
      gsap.set(letters, { y: 112 });
      gsap.set(brand, { y: 64, x: (i) => (mid - i) * 22 });
      gsap.set(['.loader-logo', '.loader-meta'], { visibility: 'visible' });
      gsap.timeline({ onComplete: () => loader.remove() })
        .fromTo('.loader-line--h', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0)
        .fromTo('.loader-line--v', { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'expo.inOut' }, 0.08)
        .fromTo(shards,
          { x: (i) => [-150, 20, 150][i], y: (i) => [10, -150, 110][i], rotation: (i) => [-28, 22, 34][i], autoAlpha: 0, svgOrigin: `${O.x} ${O.y}` },
          { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 1.05, ease: 'expo.out', stagger: 0.09 }, 0.22)
        .fromTo('.loader-bloom', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 1.1)
        .to('.loader-bloom', { autoAlpha: 0, scale: 1.25, duration: 1, ease: 'power2.in' }, 1.6)
        .to('.loader-line--h', { scaleX: 0, duration: 0.8, ease: 'expo.inOut' }, 1.2)
        .to('.loader-line--v', { scaleY: 0, duration: 0.8, ease: 'expo.inOut' }, 1.24)
        .to(markO, { x: 0, y: 0, scale: 1, duration: 0.95, ease: 'power4.inOut' }, 1.45)
        .to(shards, { autoAlpha: (i) => [1, 0.55, 0.75][i], duration: 0.7, ease: 'power2.inOut' }, 1.65)
        .to(letters, { y: 0, duration: 1.1, ease: EASE, stagger: 0.045 }, 1.98)
        .to(brand, { y: 0, x: 0, duration: 1.1, ease: EASE, stagger: { each: 0.035, from: 'center' } }, 2.2)
        .fromTo(meta, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.06 }, 0.35)
        .to(count, { v: 100, duration: 3.1, ease: 'power2.inOut', onUpdate: () => (nbr.textContent = String(Math.round(count.v)).padStart(3, '0')) }, 0.3)
        .fromTo('.loader-bar i', { scaleX: 0 }, { scaleX: 1, duration: 3.1, ease: 'power2.inOut' }, 0.3)
        .to(meta, { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.04 }, 3.45)
        .to('.loader-logo', { yPercent: -112, duration: 0.85, ease: 'expo.in' }, 3.55)
        .add(resolve, 3.55)
        .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.85, ease: 'expo.inOut' }, 3.55);
    });
  }

  /* ---------- Home: featured slideshow ---------- */
  function home() {
    const slides = $$('.slide');
    const titles = $$('.stage-title');
    const kinds = $$('.stage-kind');
    const bars = $$('.bar');
    const cur = $('.stage-cur');
    const link = $('.stage-titles');
    const N = slides.length;
    const DUR = 6;
    let i = 0, busy = false;
    const chars = titles.map((t) => {
      const txt = t.textContent;
      t.innerHTML = [...txt].map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
      return $$('.ch', t);
    });
    const progress = { p: 0 };
    const tick = gsap.to(progress, {
      p: 1, duration: DUR, ease: 'none', paused: true,
      onUpdate: () => bars[i].style.setProperty('--p', progress.p),
      onComplete: () => show((i + 1) % N, 1),
    });

    function paint(n) {
      bars.forEach((b, k) => b.style.setProperty('--p', k < n ? 1 : 0));
      cur.textContent = String(n + 1).padStart(2, '0');
      link.setAttribute('href', slides[n].getAttribute('href'));
    }
    function titleIn(n, dir) {
      gsap.set(titles[n], { visibility: 'visible' });
      gsap.fromTo(chars[n], { yPercent: dir > 0 ? 105 : -105 }, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.03 });
      gsap.fromTo(kinds[n], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, ease: EASE, delay: 0.15 });
    }
    function show(n, dir = 1) {
      if (busy || n === i) return;
      busy = true;
      const from = i;
      i = n;
      tick.pause();
      progress.p = 0;
      paint(n);
      slides.forEach((s) => s.classList.remove('is-prev'));
      slides[from].classList.replace('is-active', 'is-prev');
      slides[n].classList.add('is-active');
      const img = $('.slide-img', slides[n]);
      gsap.to(chars[from], { yPercent: dir > 0 ? -105 : 105, duration: 0.55, ease: 'power3.in', stagger: 0.015, onComplete: () => gsap.set(titles[from], { visibility: 'hidden' }) });
      gsap.to(kinds[from], { opacity: 0, duration: 0.3 });
      gsap.fromTo(slides[n], { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'expo.inOut',
        onComplete: () => { slides[from].classList.remove('is-prev'); busy = false; tick.restart(); },
      });
      gsap.fromTo(img, { scale: 1.25 }, { scale: 1.08, duration: 1.6, ease: 'expo.out' });
      gsap.to(img, { scale: 1, duration: DUR + 1.5, ease: 'none', delay: 1.6 });
      gsap.delayedCall(0.45, () => titleIn(n, dir));
    }

    // intro
    paint(0);
    gsap.set(chars.flat(), { yPercent: 105 });
    const start = () => {
      gsap.fromTo($('.slide-img', slides[0]), { scale: 1.2 }, { scale: 1, duration: DUR + 2, ease: 'power2.out' });
      gsap.from('.stage-foot, .stage-scroll', { opacity: 0, y: 20, duration: 1, ease: EASE, delay: 0.4 });
      titleIn(0, 1);
      tick.restart();
    };
    runLoader().then(() => { reveal(); start(); });

    bars.forEach((b, k) => b.addEventListener('click', () => show(k, k > i ? 1 : -1)));
    // wheel / swipe / keys: step through the featured work, then continue into the portfolio
    let acc = 0, wheelLock = false;
    const step = (dir) => {
      if (busy || wheelLock) return;
      wheelLock = true;
      setTimeout(() => (wheelLock = false), 900);
      if (dir > 0 && i === N - 1) return go($('.stage-scroll').href);
      if (dir < 0 && i === 0) return;
      show(i + dir, dir);
    };
    addEventListener('wheel', (ev) => {
      acc += ev.deltaY;
      if (Math.abs(acc) > 60) { step(Math.sign(acc)); acc = 0; }
    }, { passive: true });
    let ty = null;
    addEventListener('touchstart', (ev) => (ty = ev.touches[0].clientY), { passive: true });
    addEventListener('touchend', (ev) => {
      if (ty === null) return;
      const d = ty - ev.changedTouches[0].clientY;
      if (Math.abs(d) > 50) step(Math.sign(d));
      ty = null;
    });
    addEventListener('keydown', (ev) => {
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(ev.key)) step(1);
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(ev.key)) step(-1);
    });
    document.addEventListener('visibilitychange', () => (document.hidden ? tick.pause() : !busy && tick.resume()));
  }

  /* ---------- Work: portfolio ---------- */
  function work() {
    // hero letters + draggable mark
    if (!reduce) {
      gsap.from('.w-hero-title span', { yPercent: 100, opacity: 0, duration: 1.4, ease: EASE, stagger: 0.07, delay: 0.2 });
      gsap.from('.w-hero-mark', { scale: 0.4, rotation: -40, opacity: 0, duration: 1.6, ease: 'elastic.out(1, 0.6)', delay: 0.55 });
      gsap.to('.w-hero-title', { yPercent: 18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.w-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    // the hero mark is a real-time 3D object: drag-to-spin lives in js/mark3d.js

    // rows
    const rows = $$('.row');
    rows.forEach((r) => {
      if (reduce) return;
      gsap.from(r, { opacity: 0, y: 60, duration: 1.2, ease: EASE, scrollTrigger: { trigger: r, start: 'top 92%', once: true } });
    });

    // filter + search
    const chips = $$('.chip');
    const input = $('.search input');
    const empty = $('.w-empty');
    let filter = '*';
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach((r) => {
        const ok = (filter === '*' || r.dataset.services.split('|').includes(filter)) && (!q || r.dataset.name.includes(q));
        r.hidden = !ok;
        shown += ok;
        if (ok) gsap.set(r, { opacity: 1, y: 0 });
      });
      empty.hidden = shown > 0;
      ScrollTrigger.refresh();
    };
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((x) => x.classList.toggle('is-on', x === c));
      filter = c.dataset.filter;
      apply();
    }));
    input.addEventListener('input', apply);
  }

  /* ---------- About ---------- */
  function about() {
    if (!reduce) {
      gsap.from('.a-hero-glow', { opacity: 0, scale: 1.2, duration: 2, ease: 'power2.out' });
      // marquee reacts to scroll velocity
      const loop = gsap.to('.marquee-track', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
      gsap.to('.mq-svg', { rotation: 360, duration: 9, ease: 'none', repeat: -1 });
      let dir = 1;
      lenis?.on('scroll', ({ velocity, direction }) => {
        if (direction) dir = direction;
        gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(velocity) * 0.2, 5)), duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: 'power2.out' });
      });
      // shift rows strike through, arrow draws, new word arrives
      $$('.shift-row').forEach((row) => {
        gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%', end: 'top 55%', scrub: 1 } })
          .fromTo($('.shift-from', row), { '--strike': 0 }, { '--strike': 1, ease: 'none', duration: 0.5 })
          .fromTo($('.shift-arrow', row), { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 0.3 }, 0.3)
          .fromTo($('.shift-to', row), { xPercent: -20, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.4 }, 0.5);
      });
      gsap.from('.svc-card', { opacity: 0, x: 80, duration: 1.2, ease: EASE, stagger: 0.07, scrollTrigger: { trigger: '.svc', start: 'top 75%', once: true } });
      gsap.from('.prac', { opacity: 0, y: 50, duration: 1.1, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: '.prac-grid', start: 'top 85%', once: true } });
      gsap.from('.client', { opacity: 0, duration: 0.8, ease: 'power2.out', stagger: { each: 0.04, from: 'random' }, scrollTrigger: { trigger: '.client-grid', start: 'top 85%', once: true } });
    } else {
      $$('.shift-from').forEach((el) => el.style.setProperty('--strike', 1));
    }

    // services carousel: drag + arrows
    const track = $('.svc-track');
    const vp = $('.svc-viewport');
    const cards = $$('.svc-card');
    const maxX = () => Math.min(0, vp.clientWidth - track.scrollWidth - parseFloat(getComputedStyle(vp).paddingLeft) * 2);
    let drag = null;
    if (window.Draggable) {
      drag = Draggable.create(track, { type: 'x', bounds: { minX: maxX(), maxX: 0 }, inertia: !!window.InertiaPlugin, edgeResistance: 0.85, dragClickables: true, allowNativeTouchScrolling: true })[0];
      addEventListener('resize', () => drag.applyBounds({ minX: maxX(), maxX: 0 }));
    }
    const stepW = () => cards[0].offsetWidth + 14;
    $$('.svc-arrow').forEach((b) => b.addEventListener('click', () => {
      const x = gsap.getProperty(track, 'x');
      const nx = gsap.utils.clamp(maxX(), 0, x - stepW() * Number(b.dataset.dir));
      gsap.to(track, { x: nx, duration: 0.9, ease: 'expo.out', onUpdate: () => drag?.update() });
    }));
  }

  /* ---------- Contact ---------- */
  function contact() {
    if (!reduce) gsap.from('.c-form', { opacity: 0, y: 40, duration: 1.2, ease: EASE, delay: 0.4 });
    const form = $('.c-form');
    const note = $('.c-note');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('is-bad', bad);
        ok = ok && !bad;
      });
      if (!ok) { note.textContent = 'Please fill in the required fields.'; return; }
      const fd = new FormData(form);
      const d = Object.fromEntries(fd);
      const btn = $('.c-submit', form);
      btn.disabled = true;
      note.textContent = 'Sending…';
      // Posts to contact.php (Hostinger). If that is unavailable (e.g. local preview), fall back to the mail app.
      fetch(form.getAttribute('action'), { method: 'POST', body: fd })
        .then((res) => res.json().then((j) => ({ status: res.status, j })))
        .then(({ status, j }) => {
          note.textContent = j.message || 'Something went wrong.';
          if (j.ok) form.reset();
          else if (status >= 500) throw new Error('server');
        })
        .catch(() => {
          const bodyTxt = `Name: ${d.name}\nOrganization: ${d.organization}\nEmail: ${d.email}\nHeard about us: ${d.source || '-'}\nBudget: ${d.budget || '-'}\n\n${d.message}`;
          location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent('Project enquiry — ' + d.organization)}&body=${encodeURIComponent(bodyTxt)}`;
          note.textContent = 'Opening your email app…';
        })
        .finally(() => { btn.disabled = false; });
    });
  }

  /* ---------- Case study ---------- */
  function caseStudy() {
    if (reduce) return;
    gsap.from('.cs-media img', { scale: 0.86, opacity: 0, y: 40, duration: 1.5, ease: EASE, delay: 0.15 });
    gsap.to('.cs-bg img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.cs-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.cs-meta > *', { opacity: 0, y: 24, duration: 1, ease: EASE, stagger: 0.08, scrollTrigger: { trigger: '.cs-grid', start: 'top 85%', once: true } });
    gsap.from('.next-name', { yPercent: 40, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: '.next', start: 'top 90%', once: true } });
  }

  /* ---------- Footer ---------- */
  function footer() {
    if (reduce || !$('.footer')) return;
    const byX = (a, b) => a.getBBox().x - b.getBBox().x;
    const svg = $('.footer-svg');
    gsap.timeline({ scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true } })
      .from($$('.lp[data-row="word"]', svg).sort(byX), { y: 110, duration: 1.4, ease: EASE, stagger: 0.05 })
      .from($$('.lp[data-row="brand"]', svg).sort(byX), { y: 70, duration: 1.2, ease: EASE, stagger: 0.04 }, 0.3);
    gsap.from('.footer-glow', { opacity: 0, yPercent: 30, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: '.footer', start: 'top 70%', once: true } });
  }

  /* ---------- Boot ---------- */
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    if (PAGE === 'home') return home();
    reveals();
    ({ work, about, contact, case: caseStudy })[PAGE]?.();
    footer();
    reveal();
    addEventListener('load', () => ScrollTrigger.refresh());
  });
})();
