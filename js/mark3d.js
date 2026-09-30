/* ==========================================================================
   Crossover mark in real-time 3D (Three.js)
   The three shards are extruded from the exact logo paths already in the page
   (the SVG inside each [data-mark3d] doubles as the no-WebGL fallback).
   Modes:  work    — drag to spin, momentum, shards part while held
           about   — slow turn, follows the pointer, shards part as you scroll away
           contact — turns with page scroll; the shards come together at the form
   ========================================================================== */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
const gsap = window.gsap;
const ST = window.ScrollTrigger;
const CENTER = new THREE.Vector2(204, 47.4); // centre of the mark in logo units
const COLORS = [0xE4B888, 0x8C6644, 0xC09060]; // gold, deep bronze, bronze — the brand's three shard tones

export function buildMark(svgEl) {
  const group = new THREE.Group();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${[...svgEl.querySelectorAll('path')].map((p) => `<path d="${p.getAttribute('d')}"/>`).join('')}</svg>`;
  const { paths } = new SVGLoader().parse(svg);
  const shards = paths.map((path, i) => {
    const geo = new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {
      depth: 14, curveSegments: 28, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.5, bevelSegments: 6,
    });
    geo.translate(-CENTER.x, -CENTER.y, -7);
    geo.scale(1, -1, -1); // SVG y points down; flipping z too keeps the faces' normals pointing out
    geo.computeBoundingBox();
    const c = new THREE.Vector3();
    geo.boundingBox.getCenter(c);
    const mat = new THREE.MeshPhysicalMaterial({
      color: COLORS[i % 3], metalness: 0.7, roughness: [0.32, 0.44, 0.36][i % 3],
      clearcoat: 0.5, clearcoatRoughness: 0.25,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const pivot = new THREE.Group(); // lets each shard fly out along its own direction
    pivot.add(mesh);
    pivot.userData.dir = new THREE.Vector3(c.x, c.y, 0).normalize();
    pivot.userData.spin = [new THREE.Vector3(0.6, -0.9, 0.4), new THREE.Vector3(-0.8, 0.5, -0.6), new THREE.Vector3(0.5, 0.7, 0.9)][i % 3];
    group.add(pivot);
    return pivot;
  });
  return { group, shards };
}

function mount(host) {
  const mode = host.dataset.mark3d;
  const fallback = host.querySelector('svg');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return; // no WebGL: the SVG fallback stays
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps the bronze saturated (ACES greys it out)
  renderer.toneMappingExposure = 0.95;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6; // keep the bronze from washing out to chrome
  const key = new THREE.DirectionalLight(0xffcf8f, 4.2);
  key.position.set(-60, 90, 120);
  const rim = new THREE.DirectionalLight(0xe0a866, 2.4);
  rim.position.set(90, -40, -80);
  const fill = new THREE.DirectionalLight(0xffe7c7, 1.6);
  fill.position.set(20, 10, 200); // front fill so the faces never go black
  scene.add(key, rim, fill, new THREE.AmbientLight(0x6b4a2c, 0.9));

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 2000);
  camera.position.set(0, 0, 250);
  const { group, shards } = buildMark(fallback);
  const rig = new THREE.Group(); // rig = position/float, group = spin
  rig.add(group);
  scene.add(rig);

  // state driven by pointer / scroll / tweens
  const s = { explode: 1, spinY: 0, vel: 0, tiltX: 0, tiltY: 0, tx: 0, ty: 0, scale: 0.6, auto: mode === 'contact' ? 0 : 0.0035 };

  function layout() {
    const w = host.clientWidth, h = host.clientHeight || w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(layout).observe(host);
  layout();

  function apply(t) {
    shards.forEach((p) => {
      const d = p.userData.dir, sp = p.userData.spin, e = s.explode;
      p.position.set(d.x * 38 * e, d.y * 38 * e, (sp.z * 30) * e);
      p.rotation.set(sp.x * 0.9 * e, sp.y * 0.9 * e, sp.z * 0.5 * e);
    });
    group.rotation.set(s.tiltX, s.spinY + s.tiltY, 0);
    rig.position.y = reduce ? 0 : Math.sin(t * 0.0011) * 3;
    rig.scale.setScalar(s.scale);
  }

  // render only while visible
  let visible = false, raf = 0, last = 0;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(48, t - (last || t)) / 16.67;
    last = t;
    s.spinY += (s.auto + s.vel) * dt;
    s.vel *= Math.pow(0.95, dt);
    s.tiltX += (s.tx - s.tiltX) * 0.06 * dt;
    s.tiltY += (s.ty - s.tiltY) * 0.06 * dt;
    apply(t);
    renderer.render(scene, camera);
  }
  const start = () => { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }, { rootMargin: '120px' }).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : visible && start()));

  host.classList.add('is-3d');
  (window.__mark3d ||= {})[mode] = { s, shards, renderer };

  if (reduce) {
    Object.assign(s, { explode: 0, scale: 1, spinY: -0.35, tiltX: 0.12 });
    apply(0);
    renderer.render(scene, camera);
    addEventListener('resize', () => renderer.render(scene, camera));
    return;
  }

  // intro: shards fly together
  gsap?.to(s, { explode: mode === 'contact' ? 0.85 : 0, scale: 1, duration: 2.2, ease: 'expo.out', delay: 0.35 });

  if (mode === 'work') {
    let down = null;
    host.addEventListener('pointerdown', (ev) => {
      down = { x: ev.clientX, y: ev.clientY };
      host.setPointerCapture(ev.pointerId);
      gsap?.to(s, { explode: 0.18, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      document.querySelector('.drag-hint') && gsap?.to('.drag-hint', { opacity: 0, duration: 0.3 });
    });
    host.addEventListener('pointermove', (ev) => {
      if (!down) return;
      s.vel += (ev.clientX - down.x) * 0.0016;
      s.tx = Math.max(-0.6, Math.min(0.6, s.tx + (ev.clientY - down.y) * 0.004));
      down = { x: ev.clientX, y: ev.clientY };
    });
    const up = () => {
      if (!down) return;
      down = null;
      gsap?.to(s, { explode: 0, tx: 0, duration: 1.4, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    };
    host.addEventListener('pointerup', up);
    host.addEventListener('pointercancel', up);
  }

  if (mode === 'about') {
    if (!touch) addEventListener('pointermove', (ev) => {
      s.ty = (ev.clientX / innerWidth - 0.5) * 0.9;
      s.tx = (ev.clientY / innerHeight - 0.5) * 0.5;
    });
    ST?.create({
      trigger: '.a-hero', start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: (st) => { s.explode = st.progress * 1.1; s.auto = 0.0035 + st.getVelocity() * 0.0000025; },
    });
  }

  if (mode === 'contact') {
    let focused = false;
    ST?.create({
      start: 0, end: 'max', scrub: 0.6,
      onUpdate: (st) => { s.spinY = st.progress * Math.PI * 2; if (!focused) s.explode = 0.85 * (1 - st.progress); },
    });
    // starting the form brings the pieces together — the "crossover" moment
    const form = document.querySelector('.c-form');
    form?.addEventListener('focusin', () => { focused = true; gsap?.to(s, { explode: 0, duration: 1.4, ease: 'expo.out', overwrite: 'auto' }); });
    form?.addEventListener('focusout', () => setTimeout(() => {
      if (form.contains(document.activeElement)) return;
      focused = false;
      gsap?.to(s, { explode: 0.85 * (1 - (ST?.getAll().at(-1)?.progress || 0)), duration: 1.4, ease: 'expo.out', overwrite: 'auto' });
    }, 0));
    // pages too short to scroll still get a slow idle turn
    if (document.documentElement.scrollHeight <= innerHeight + 40) s.auto = 0.003;
    if (!touch) addEventListener('pointermove', (ev) => {
      s.ty = (ev.clientX / innerWidth - 0.5) * 0.6;
      s.tx = (ev.clientY / innerHeight - 0.5) * 0.35;
    });
  }
}

document.querySelectorAll('[data-mark3d]').forEach(mount);
