/* ==========================================================================
   Service-stage icons in real-time 3D (Three.js) — one per branding stage.
   Same material language as the 3D mark: brushed bronze + champagne gold +
   warm frosted glass.
   Each icon's move is SCRUBBED by position, never by hover:
     desktop — by vertical scroll as the Services section comes into view
               (cards further right play a beat later)
     phones  — by horizontal swipe: the card nearest the centre plays its move
   Idle motion is slow and continuous on top of that.
   One shared WebGL renderer draws every visible card into that card's own
   2D canvas, so eight icons cost one GPU context.
   ========================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildMark } from './mark3d.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
const hosts = [...document.querySelectorAll('[data-stage]')];
const IDLE = 0.35; // idle speed factor — keep motion calm

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
} catch (e) { renderer = null; }

if (renderer && hosts.length) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.65;
  const key = new THREE.DirectionalLight(0xffcf8f, 3.6);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0xe0a866, 2.2);
  rim.position.set(4, -2, -3);
  const fill = new THREE.DirectionalLight(0xffe7c7, 1.2);
  fill.position.set(1, 0.5, 6);
  scene.add(key, rim, fill, new THREE.AmbientLight(0x6b4a2c, 0.8));
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.1, 6.7);

  // ---------- shared materials ----------
  const metal = (color, roughness) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.72, roughness, clearcoat: 0.35, clearcoatRoughness: 0.3 });
  const M = {
    gold: metal(0xE4B888, 0.28),
    bronze: metal(0xC09060, 0.34),
    deep: metal(0x8C6644, 0.4),
    cream: new THREE.MeshPhysicalMaterial({ color: 0xF1E6D6, metalness: 0.05, roughness: 0.55, clearcoat: 0.3 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xF5E4CC, metalness: 0, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.2,
      transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false,
      emissive: 0x3a2814, emissiveIntensity: 0.35,
    }),
  };
  const facet = (mat) => Object.assign(mat.clone(), { flatShading: true });
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  // a spur gear outline, extruded (Execution)
  function gearGeometry(teeth, rOuter, rInner, rHole, depth) {
    const s = new THREE.Shape();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      const pts = [[rInner, a], [rOuter, a + step * 0.18], [rOuter, a + step * 0.5], [rInner, a + step * 0.68]];
      pts.forEach(([r, ang], k) => {
        const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
        if (i === 0 && k === 0) s.moveTo(x, y); else s.lineTo(x, y);
      });
    }
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, rHole, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2, curveSegments: 24 });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  // ---------- the eight stages: update(t, p) — t = slow idle clock, p = scroll progress 0..1 ----------
  const STAGES = {
    // 01 Discovery — frosted orb, a faceted bronze shard inside; progress turns the orb and brings the shard forward
    1() {
      const g = new THREE.Group();
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), M.glass);
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), facet(M.bronze));
      g.add(shard, orb);
      return { group: g, update(t, p) {
        const k = ease(p);
        shard.rotation.set(0.3 + Math.sin(t) * 0.15, t * 0.5 + k * Math.PI, 0.2);
        shard.scale.set(0.8, 1.35, 0.7).multiplyScalar(0.85 + k * 0.3);
        orb.rotation.y = t * 0.2 + k * 1.4;
      } };
    },
    // 02 Brand Platform — three slabs; progress lifts them apart and settles them into one foundation
    2() {
      const g = new THREE.Group();
      const geo = new RoundedBoxGeometry(1.7, 0.26, 1.15, 4, 0.06);
      const slabs = [M.deep, M.glass, M.gold].map((m) => { const s = new THREE.Mesh(geo, m); g.add(s); return s; });
      g.rotation.set(0.45, -0.6, 0);
      return { group: g, update(t, p) {
        const open = Math.sin(Math.PI * clamp01(p)); // apart mid-way, together at the end
        slabs.forEach((s, i) => { s.position.y = (i - 1) * (0.3 + open * 0.36) + Math.sin(t + i) * 0.015; s.rotation.y = (i - 1) * open * 0.4; });
        g.rotation.y = -0.6 + Math.sin(t * 0.6) * 0.12;
      } };
    },
    // 03 Brand Architecture — modular blocks; progress lowers the top block into place
    3() {
      const g = new THREE.Group();
      const geo = new RoundedBoxGeometry(0.56, 0.56, 0.56, 3, 0.04);
      [[-0.3, -0.58, 0.3, 'glass'], [0.3, -0.58, 0.3, 'bronze'], [0.3, -0.58, -0.3, 'glass'], [-0.3, -0.58, -0.3, 'bronze'], [0, 0, 0, 'bronze']]
        .forEach(([x, y, z, m]) => { const c = new THREE.Mesh(geo, M[m]); c.position.set(x, y, z); g.add(c); });
      const top = new THREE.Mesh(geo, M.gold);
      g.add(top);
      g.rotation.set(0.4, 0.7, 0);
      return { group: g, update(t, p) {
        const k = ease(p);
        top.position.set(0, 0.58 + (1 - k) * (0.45 + Math.sin(t * 1.2) * 0.04), 0);
        top.rotation.y = (1 - k) * 0.6;
        g.rotation.y = 0.7 + Math.sin(t * 0.5) * 0.15;
      } };
    },
    // 04 Brand Naming — a bronze signet presses the Crossover mark into a glass seal
    4() {
      const g = new THREE.Group();
      const seal = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 72), M.glass);
      seal.add(disc);
      const svg = document.querySelector('.mark3d-fallback');
      let emboss = null;
      if (svg) {
        emboss = buildMark(svg).group;
        emboss.scale.setScalar(0.0085);
        emboss.rotation.x = -Math.PI / 2;
        emboss.position.y = 0.08;
        emboss.traverse((o) => { if (o.isMesh) o.material = M.gold; });
        seal.add(emboss);
      }
      seal.position.y = -0.55;
      g.add(seal);
      const stamp = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.34, 0.9, 48), M.bronze);
      handle.position.y = 0.45;
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.3, 48, 32), M.gold);
      knob.position.y = 1.02;
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 64), M.deep);
      stamp.add(face, handle, knob);
      g.add(stamp);
      g.rotation.set(0.5, 0, 0);
      g.position.y = -0.05;
      return { group: g, update(t, p) {
        const k = ease(clamp01(p * 1.15));
        stamp.position.y = lerp(0.55, -0.37, k) + (1 - k) * Math.sin(t * 1.3) * 0.03;
        stamp.rotation.y = (1 - k) * 0.8 + t * 0.1;
        if (emboss) emboss.scale.setScalar(0.0085 * (0.6 + 0.4 * k));
        seal.rotation.y = t * 0.15;
      } };
    },
    // 05 Visual Expression — a palette fan of swatch cards that spreads open
    5() {
      const g = new THREE.Group();
      const mats = [M.deep, M.bronze, M.gold, M.cream, M.glass, M.gold];
      const geo = new RoundedBoxGeometry(0.34, 1.5, 0.04, 3, 0.03);
      geo.translate(0, 0.62, 0); // pivot near the bottom, like a real swatch fan
      const cards = mats.map((m, i) => {
        const c = new THREE.Mesh(geo, m);
        c.position.z = i * 0.045;
        g.add(c);
        return c;
      });
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 32), M.gold);
      pin.rotation.x = Math.PI / 2;
      pin.position.set(0, 0, 0.12);
      g.add(pin);
      g.position.y = -0.55;
      g.rotation.set(-0.15, -0.35, 0);
      return { group: g, update(t, p) {
        const k = ease(p);
        const n = cards.length - 1;
        cards.forEach((c, i) => { c.rotation.z = lerp(0.04 * (i - n / 2), (i - n / 2) * -0.3, k) + Math.sin(t + i * 0.4) * 0.01; });
        g.rotation.y = -0.35 + Math.sin(t * 0.5) * 0.12;
      } };
    },
    // 06 Brand Execution — two interlocking bronze gears; progress drives them
    6() {
      const g = new THREE.Group();
      const big = new THREE.Mesh(gearGeometry(12, 0.72, 0.58, 0.18, 0.22), M.bronze);
      const small = new THREE.Mesh(gearGeometry(8, 0.5, 0.37, 0.12, 0.22), M.gold);
      big.position.set(-0.36, -0.12, 0);
      small.position.set(0.72, 0.36, 0.02);
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 32), M.glass);
      axle.rotation.x = Math.PI / 2;
      axle.position.copy(big.position);
      const axle2 = axle.clone();
      axle2.position.copy(small.position);
      g.add(big, small, axle, axle2);
      g.rotation.set(0.3, -0.45, 0);
      return { group: g, update(t, p) {
        const turn = p * Math.PI * 1.1 + t * 0.12;           // meshing ratio 12:8
        big.rotation.z = turn;
        small.rotation.z = -turn * 1.5 + Math.PI / 8;
        g.rotation.y = -0.45 + Math.sin(t * 0.5) * 0.12;
      } };
    },
    // 07 Brand Alignment — gyroscope rings; progress swings them into alignment
    7() {
      const g = new THREE.Group();
      const rings = [[1, 0.05, M.bronze], [0.76, 0.045, M.gold], [0.52, 0.04, M.glass]].map(([r, tube, m]) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 24, 96), m);
        g.add(ring);
        return ring;
      });
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 24), M.bronze));
      return { group: g, update(t, p) {
        const k = ease(p);
        rings[0].rotation.set(lerp(0.9 + Math.sin(t) * 0.15, 0, k), lerp(0.5 + t * 0.2, 0, k), 0);
        rings[1].rotation.set(lerp(-0.6, 0, k), lerp(0.8 + Math.sin(t * 1.3) * 0.2, 0, k), 0);
        rings[2].rotation.set(lerp(0.4 + t * 0.3, 0, k), lerp(-0.9, 0, k), lerp(0.4, 0, k));
        g.rotation.set(0.15, Math.sin(t * 0.5) * 0.12, 0);
      } };
    },
    // 08 Brand Extension — the Crossover mark growing new shards outward
    8() {
      const g = new THREE.Group();
      const svg = document.querySelector('.mark3d-fallback');
      if (!svg) return { group: g, update() {} };
      const { group, shards } = buildMark(svg);
      group.scale.setScalar(0.0125);
      g.add(group);
      const extra = shards.map((s) => { const c = s.clone(true); c.scale.setScalar(0.42); group.add(c); return c; });
      return { group: g, update(t, p) {
        const k = ease(p);
        extra.forEach((c, i) => {
          const d = c.userData.dir || { x: 1, y: 0 };
          const r = lerp(0, 80, k);
          c.position.set(d.x * r, d.y * r, -10 + k * 30);
          c.rotation.z = t * 0.4 + i * 2.1 + k * 1.2;
          c.visible = k > 0.02;
        });
        group.rotation.set(Math.sin(t * 0.6) * 0.15, -0.4 + t * 0.25, 0);
      } };
    },
  };

  // ---------- mount: one 2D canvas per card, the shared renderer draws into it ----------
  const items = hosts.map((host) => {
    const n = +host.dataset.stage;
    const icon = STAGES[n]?.();
    if (!icon) return null;
    icon.group.visible = false;
    scene.add(icon.group);
    const cv = document.createElement('canvas');
    host.appendChild(cv);
    host.classList.add('is-3d');
    return { host, card: host.closest('.svc-card') || host, cv, ctx: cv.getContext('2d'), icon, p: 0, visible: false, seed: n * 1.7 };
  }).filter(Boolean);

  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    const it = items.find((x) => x.host === en.target);
    if (it) it.visible = en.isIntersecting;
  }));
  items.forEach((it) => io.observe(it.host));

  // scroll / swipe progress for one card, 0..1
  const phone = () => innerWidth < 810 || touch;
  function progressOf(it) {
    const r = it.card.getBoundingClientRect();
    const vw = innerWidth, vh = innerHeight;
    // vertical: from the card top entering the bottom of the screen to the card sitting in the upper-middle
    const v = clamp01((vh - r.top) / (vh * 0.75));
    if (phone()) {
      // horizontal: the card centred in the carousel plays its move fully
      const cx = r.left + r.width / 2;
      const hz = clamp01(1 - Math.abs(cx - vw / 2) / (vw * 0.55));
      return Math.min(v, hz);
    }
    // desktop: cards further right play a beat later as you scroll
    const lag = clamp01(r.left / vw) * 0.35;
    return clamp01((v - lag) / (1 - lag));
  }

  function draw(it, t) {
    const w = it.host.clientWidth, hgt = it.host.clientHeight;
    if (!w || !hgt) return;
    const dpr = renderer.getPixelRatio();
    if (it.cv.width !== Math.round(w * dpr) || it.cv.height !== Math.round(hgt * dpr)) {
      it.cv.width = Math.round(w * dpr);
      it.cv.height = Math.round(hgt * dpr);
    }
    renderer.setSize(w, hgt, false);
    camera.aspect = w / hgt;
    camera.updateProjectionMatrix();
    items.forEach((x) => (x.icon.group.visible = x === it));
    it.icon.update(t + it.seed, it.p);
    renderer.render(scene, camera);
    it.ctx.clearRect(0, 0, it.cv.width, it.cv.height);
    it.ctx.drawImage(renderer.domElement, 0, 0, it.cv.width, it.cv.height);
  }

  if (reduce) {
    const once = () => items.forEach((it) => { it.p = 1; draw(it, 0); });
    once();
    addEventListener('resize', once);
  } else {
    const t0 = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (document.hidden) return;
      const t = ((now - t0) / 1000) * IDLE;
      items.forEach((it) => {
        if (!it.visible) return;
        it.p += (progressOf(it) - it.p) * 0.06; // soft follow so scrubbing never jerks
        it.card.style.setProperty('--h', it.p.toFixed(3));
        draw(it, t);
      });
    };
    requestAnimationFrame(loop);
  }
}
