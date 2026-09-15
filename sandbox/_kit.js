// How Games Draw · 3D sandbox kit. Every sandbox page imports this. It builds the page chrome (top bar, control
// panel, full-bleed canvas), sets up three.js with orbit controls, and offers the shared low-poly world (ground,
// trees, a house, a knight, a campfire, lamps, crates, walls) so every chapter's playground is the same camp.
//
//   import { boot } from './_kit.js';
//   const sb = boot({ slug: 'rasterization', title: 'Rasterization & Depth', blurb: '…', camera: { pos: [9, 6, 12], target: [0, 1, 0] } });
//   const camp = sb.world.camp();                     // the standard scene, returns { ground, trees, house, knight, fire }
//   const sec = sb.panel.section('Pixels', 'note');  // sections hold sliders, toggles, segments, readouts, notes, keys
//   sec.slider('Screen width', { min: 24, max: 640, step: 8, value: 160, unit: ' px' }, v => sb.view.pixelate(v));
//   sb.onFrame((dt, t) => { … });                     // called every frame before render
//
// View helpers: sb.view.mode('shaded' | 'wireframe' | 'depth' | 'normals'), sb.view.pixelate(n | 0), sb.view.grid(px | 0),
// sb.view.overdraw(bool), sb.label(text, object3D | Vector3, colour?), sb.hud(text) for the bottom-left strip.
import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/addons/OrbitControls.js';
export { THREE, OrbitControls };

export const PAL = { grass: 0x1f3a2a, grassLite: 0x2a4d37, dirt: 0x3b2f25, stone: 0x4c5563, stoneLite: 0x6b7585, wood: 0x7a4f2a, woodLite: 0xa06a38,
  leaf: 0x3f8f4a, leafLite: 0x5ab562, roof: 0xa5433a, wall: 0xc9c2b2, window: 0xf5d67a, skin: 0xe8b98a, shirt: 0x4aa3ff, pants: 0x2f3a55,
  metal: 0x8d95a3, flame: 0xf2a341, sky: 0x0b0e13, amber: 0xf2a341, blue: 0x4aa3ff, white: 0xffffff, green: 0x5ad48a, red: 0xef5d5d };

const $ = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function boot(cfg) {
  const slug = cfg.slug, title = cfg.title || document.title, base = window.RL_BASE || '', pages = window.RL_PAGES || null;
  document.title = title + ' · Sandbox · How Games Draw';

  // ---- chrome
  const app = $('div', 'sb-app');
  const top = $('div', 'sb-top');
  const topics = pages ? '<select class="topics" aria-label="Chapter">' + pages.map(p => `<option value="${p.slug}"${p.slug === slug ? ' selected' : ''}>${String(p.n).padStart(2, '0')} · ${esc(p.title)}</option>`).join('') + '</select>' : '<span class="title">' + esc(title) + '</span>';
  top.innerHTML = `<a class="home">How Games Draw</a><span class="sep">/</span>${topics}<span class="grow"></span><button type="button" class="sb-fold">controls</button><div class="sb-mode"><a class="guided">Guided</a><a class="on">Sandbox</a></div>`;
  top.querySelector('.home').href = pages ? (base || '/') : '../index.html';
  top.querySelector('.guided').href = '../pages/' + slug + '.html';
  if (pages) top.querySelector('.topics').addEventListener('change', e => { location.href = '../sandbox/' + e.target.value + '.html'; });
  top.querySelector('.sb-fold').addEventListener('click', () => app.classList.toggle('folded'));
  const panel = $('div', 'sb-panel');
  panel.appendChild($('h1', '', esc(title)));
  if (cfg.blurb) panel.appendChild($('p', 'blurb', cfg.blurb));
  const stage = $('div', 'sb-stage');
  const grid = $('div', 'sb-grid'); const hud = $('div', 'sb-hud'); const hint = $('div', 'sb-hint', cfg.hint || 'drag to orbit · scroll to zoom · right-drag to pan');
  const labels = $('div', 'sb-labels');
  app.append(top, panel, stage); stage.append(grid, hud, hint, labels); document.body.appendChild(app);

  // ---- panel builders
  function makeSection(host, name, note) {
    const sec = $('div', 'sb-sec'); if (name) sec.appendChild($('h2', '', esc(name))); if (note) sec.appendChild($('p', 'note', note)); host.appendChild(sec);
    const api = {
      el: sec,
      slider(label, o, fn) {
        const row = $('div', 'sb-row'), lab = $('div', 'lab'), name = $('span', '', esc(label)), val = $('span', 'val'); lab.append(name, val);
        const inp = $('input'); inp.type = 'range'; inp.min = o.min; inp.max = o.max; inp.step = o.step ?? 1; inp.value = o.value;
        const fmt = o.fmt || (v => (o.step && o.step < 1 ? (+v).toFixed(String(o.step).split('.')[1].length) : String(v)) + (o.unit || ''));
        const show = () => { val.textContent = fmt(+inp.value); };
        inp.addEventListener('input', () => { show(); fn(+inp.value); });
        row.append(lab, inp); sec.appendChild(row); show();
        return { get: () => +inp.value, set(v, fire) { inp.value = v; show(); if (fire !== false) fn(+inp.value); }, el: row };
      },
      toggle(label, value, fn) {
        const row = $('div', 'sb-row'), l = $('label', 'chk'), inp = $('input'); inp.type = 'checkbox'; inp.checked = !!value;
        l.append(inp, document.createTextNode(' ' + label)); inp.addEventListener('change', () => fn(inp.checked)); row.appendChild(l); sec.appendChild(row);
        return { get: () => inp.checked, set(v, fire) { inp.checked = !!v; if (fire !== false) fn(inp.checked); }, el: row };
      },
      segment(label, options, value, fn) {
        const row = $('div', 'sb-row'); if (label) { const lab = $('div', 'lab'); lab.appendChild($('span', '', esc(label))); row.appendChild(lab); }
        const seg = $('div', 'seg'); const opts = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
        const set = (v, fire) => { seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v)))); if (fire !== false) fn(v); };
        opts.forEach(o => { const b = $('button', '', esc(o.label)); b.type = 'button'; b.dataset.v = String(o.value); b.addEventListener('click', () => set(o.value)); seg.appendChild(b); });
        row.appendChild(seg); sec.appendChild(row); set(value, false);
        return { set, get: () => { const b = seg.querySelector('[aria-pressed="true"]'); return b ? b.dataset.v : null; }, el: row };
      },
      button(label, fn) { const row = $('div', 'sb-row'), b = $('button', 'btn', esc(label)); b.type = 'button'; b.addEventListener('click', fn); row.appendChild(b); sec.appendChild(row); return b; },
      readout(label, initial) { const r = $('div', 'sb-read'); const k = $('span', '', esc(label)), v = $('b', '', initial == null ? '—' : esc(initial)); r.append(k, v); sec.appendChild(r); return t => { v.innerHTML = t == null ? '—' : String(t); }; },
      note(text) { sec.appendChild($('p', 'note', text)); },
      key(items) { const k = $('div', 'sb-key'); items.forEach(([col, text]) => { const s = $('span', '', esc(text)); s.style.setProperty('--sw', col); k.appendChild(s); }); sec.appendChild(k); }
    };
    return api;
  }
  const panelApi = { el: panel, section: (name, note) => makeSection(panel, name, note) };

  // ---- three.js
  const renderer = new THREE.WebGLRenderer(Object.assign({ antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: !!cfg.logDepth }, cfg.renderer || {}));
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.insertBefore(renderer.domElement, grid);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(cfg.background ?? PAL.sky);
  const cam = cfg.camera || {}; const camera = new THREE.PerspectiveCamera(cam.fov || 55, 1, cam.near || 0.1, cam.far || 300);
  camera.position.set(...(cam.pos || [10, 7, 12]));
  const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(...(cam.target || [0, 1, 0])); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.49; controls.update();
  const lights = {};
  if (cfg.lights !== false) {
    lights.hemi = new THREE.HemisphereLight(0x8fa8c8, 0x2a3a2a, 0.55); scene.add(lights.hemi);
    lights.sun = new THREE.DirectionalLight(0xffe2b0, 1.6); lights.sun.position.set(14, 18, 8); lights.sun.castShadow = true;
    lights.sun.shadow.mapSize.set(2048, 2048); const sc = lights.sun.shadow.camera; sc.left = sc.bottom = -24; sc.right = sc.top = 24; sc.near = 1; sc.far = 80; lights.sun.shadow.bias = -0.0008;
    scene.add(lights.sun, lights.sun.target);
  }

  // ---- view helpers
  let pixelN = 0, rt = null, quadScene = null, quadCam = null, quadMat = null;
  // the depth picture: linear distance from the camera, white at the near plane, black at view.depthRange's far end
  const depthMat = new THREE.ShaderMaterial({ uniforms: { uNear: { value: camera.near }, uFar: { value: cfg.depthFar || 40 } },
    vertexShader: 'varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float uNear; uniform float uFar; varying float vD; void main(){ float d = clamp((vD - uNear) / (uFar - uNear), 0.0, 1.0); gl_FragColor = vec4(vec3(1.0 - d), 1.0); }' });
  const view = {
    mode(m) {
      scene.overrideMaterial = null; view._mode = m;
      if (m === 'wireframe') scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: PAL.amber, wireframe: true });
      else if (m === 'depth') scene.overrideMaterial = depthMat;
      else if (m === 'normals') scene.overrideMaterial = new THREE.MeshNormalMaterial();
    },
    pixelate(n) { pixelN = n | 0; if (!pixelN && rt) { rt.dispose(); rt = null; } view.grid(view._grid); },
    grid(on, px) { view._grid = on; view._gridPx = px; const w = stage.clientWidth; const size = px || (pixelN ? w / pixelN : 0); if (on && size) { grid.style.display = 'block'; grid.style.backgroundSize = size + 'px ' + size + 'px'; } else grid.style.display = 'none'; },
    overdraw(on) { view._over = on; if (on) { scene.overrideMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: !!view._overDepth }); } else view.mode(view._mode || 'shaded'); },
    overdrawDepthTest(b) { view._overDepth = b; if (view._over) view.overdraw(true); },
    depthRange(near, far) { depthMat.uniforms.uNear.value = near; depthMat.uniforms.uFar.value = far; },
    info: () => renderer.info
  };
  view._mode = 'shaded';

  // ---- labels and hud
  const labelList = [];
  function label(text, target, cls) { const e = $('div', 'sb-label' + (cls ? ' ' + cls : ''), esc(text)); labels.appendChild(e); const item = { el: e, target, off: new THREE.Vector3(0, 0.2, 0), set(t) { e.innerHTML = esc(t); }, hide(h) { e.style.display = h ? 'none' : ''; } }; labelList.push(item); return item; }
  const tmp = new THREE.Vector3();
  function placeLabels() {
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const l of labelList) { if (l.el.style.display === 'none') continue; const p = l.target.isObject3D ? l.target.getWorldPosition(tmp) : tmp.copy(l.target); p.add(l.off); p.project(camera); const vis = p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1; l.el.style.visibility = vis ? 'visible' : 'hidden'; l.el.style.left = ((p.x + 1) / 2 * w) + 'px'; l.el.style.top = ((1 - p.y) / 2 * h) + 'px'; }
  }
  const hudItems = new Map();
  function setHud(key, text) { let e = hudItems.get(key); if (!e) { e = $('span'); hudItems.set(key, e); hud.appendChild(e); } if (text == null) { e.remove(); hudItems.delete(key); } else e.textContent = text; }

  // ---- the world: low-poly props in the kit palette
  const mat = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const mesh = (g, m, x, y, z) => { const me = new THREE.Mesh(g, m); me.position.set(x || 0, y || 0, z || 0); me.castShadow = true; me.receiveShadow = true; return me; };
  const world = {
    ground(size = 40, color = PAL.grass) { const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 1, 1), mat(color)); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; g.name = 'ground'; g.userData.kind = 'ground'; scene.add(g); return g; },
    tree(x, z, h = 4, round = true) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.userData.kind = 'tree'; g.name = 'tree';
      g.add(mesh(new THREE.CylinderGeometry(h * 0.06, h * 0.08, h * 0.45, 7), mat(PAL.wood), 0, h * 0.225, 0));
      if (round) { g.add(mesh(new THREE.IcosahedronGeometry(h * 0.32, 1), mat(PAL.leaf), 0, h * 0.62, 0)); g.add(mesh(new THREE.IcosahedronGeometry(h * 0.2, 1), mat(PAL.leafLite), -h * 0.1, h * 0.8, h * 0.05)); }
      else { for (let i = 0; i < 3; i++) g.add(mesh(new THREE.ConeGeometry(h * (0.28 - i * 0.06), h * 0.32, 8), mat(i % 2 ? PAL.leafLite : PAL.leaf), 0, h * (0.42 + i * 0.2), 0)); }
      scene.add(g); return g;
    },
    house(x, z, w = 4, d = 3, h = 2.6, rotY = 0) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; g.userData.kind = 'house'; g.name = 'house';
      g.add(mesh(new THREE.BoxGeometry(w, h, d), mat(PAL.wall), 0, h / 2, 0));
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, w * 0.75, h * 0.7, 4, 1), mat(PAL.roof)); roof.rotation.y = Math.PI / 4; roof.scale.z = d / w; roof.position.y = h + h * 0.35; roof.castShadow = roof.receiveShadow = true; g.add(roof);
      g.add(mesh(new THREE.BoxGeometry(w * 0.2, h * 0.6, 0.06), mat(PAL.wood), w * 0.25, h * 0.3, d / 2 + 0.03));
      g.add(mesh(new THREE.BoxGeometry(w * 0.22, h * 0.28, 0.06), mat(PAL.window, { emissive: PAL.window, emissiveIntensity: 0.35 }), -w * 0.22, h * 0.6, d / 2 + 0.03));
      scene.add(g); return g;
    },
    knight(x, z, h = 1.8, rotY = 0) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; g.userData.kind = 'knight'; g.name = 'knight';
      g.add(mesh(new THREE.BoxGeometry(h * 0.3, h * 0.42, h * 0.2), mat(PAL.pants), 0, h * 0.21, 0));
      g.add(mesh(new THREE.BoxGeometry(h * 0.38, h * 0.38, h * 0.24), mat(PAL.shirt), 0, h * 0.6, 0));
      g.add(mesh(new THREE.SphereGeometry(h * 0.14, 12, 10), mat(PAL.skin), 0, h * 0.9, 0));
      const shield = mesh(new THREE.CylinderGeometry(h * 0.2, h * 0.2, 0.05, 16), mat(PAL.metal), -h * 0.28, h * 0.58, 0); shield.rotation.z = Math.PI / 2; g.add(shield);
      scene.add(g); return g;
    },
    fire(x, z, r = 0.5) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.userData.kind = 'fire'; g.name = 'fire';
      for (let i = 0; i < 3; i++) { const log = mesh(new THREE.CylinderGeometry(0.06, 0.06, r * 1.6, 6), mat(PAL.wood), 0, 0.06, 0); log.rotation.z = Math.PI / 2; log.rotation.y = i * 1.05; g.add(log); }
      const flame = new THREE.Mesh(new THREE.ConeGeometry(r * 0.5, r * 1.4, 7), new THREE.MeshBasicMaterial({ color: PAL.flame })); flame.position.y = r * 0.75; flame.name = 'flame'; g.add(flame);
      const light = new THREE.PointLight(0xffa040, 12, 12, 2); light.position.y = 0.8; light.name = 'firelight'; g.add(light);
      scene.add(g); return g;
    },
    lamp(x, z, h = 3, intensity = 20) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.userData.kind = 'lamp'; g.name = 'lamp';
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.07, h, 8), mat(PAL.metal), 0, h / 2, 0));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe2a0 }))).position.y = h;
      const light = new THREE.PointLight(0xffd27a, intensity, 18, 2); light.position.y = h; light.name = 'lamplight'; g.add(light);
      scene.add(g); return g;
    },
    crate(x, z, s = 0.9, rotY = 0) { const m = mesh(new THREE.BoxGeometry(s, s, s), mat(PAL.wood), x, s / 2, z); m.rotation.y = rotY; m.userData.kind = 'crate'; m.name = 'crate'; scene.add(m); return m; },
    wall(x1, z1, x2, z2, h = 2, t = 0.4) { const len = Math.hypot(x2 - x1, z2 - z1); const m = mesh(new THREE.BoxGeometry(len, h, t), mat(PAL.stone), (x1 + x2) / 2, h / 2, (z1 + z2) / 2); m.rotation.y = -Math.atan2(z2 - z1, x2 - x1); m.userData.kind = 'wall'; m.name = 'wall'; scene.add(m); return m; },
    rock(x, z, r = 0.6) { const m = mesh(new THREE.DodecahedronGeometry(r, 0), mat(PAL.stone), x, r * 0.6, z); m.userData.kind = 'rock'; scene.add(m); return m; },
    camp() {
      const c = { ground: world.ground(40) };
      c.trees = [world.tree(-6, -3, 4.5), world.tree(5, -8, 5), world.tree(-3, -11, 4, false), world.tree(9, 2, 3.6, false)];
      c.house = world.house(4, -4, 4, 3, 2.6, -0.35); c.knight = world.knight(-1.2, 1.5, 1.8, 0.4); c.fire = world.fire(1.2, 2.2);
      c.crates = [world.crate(-4.2, 2.6, 0.9, 0.3), world.crate(-4.9, 3.5, 0.7, -0.4)]; c.rocks = [world.rock(7, 5, 0.7), world.rock(-8, 6, 0.5)];
      return c;
    }
  };

  // ---- loop
  const frameFns = []; const clock = new THREE.Clock();
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); view.grid(view._grid, view._gridPx);
  }
  new ResizeObserver(resize).observe(stage); resize();
  function render() {
    if (pixelN) {
      const w = stage.clientWidth, h = stage.clientHeight; const ph = Math.max(1, Math.round(pixelN * h / w));
      if (!rt || rt.width !== pixelN || rt.height !== ph) { if (rt) rt.dispose(); rt = new THREE.WebGLRenderTarget(pixelN, ph, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true }); }
      renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null);
      if (!quadScene) { quadScene = new THREE.Scene(); quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); quadMat = new THREE.MeshBasicMaterial({ map: rt.texture }); quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat)); }
      quadMat.map = rt.texture; renderer.render(quadScene, quadCam);
    } else renderer.render(scene, camera);
  }
  let running = false;
  function tick() { if (!running) return; const dt = Math.min(0.1, clock.getDelta()), t = clock.elapsedTime; controls.update(); for (const f of frameFns) f(dt, t); render(); placeLabels(); requestAnimationFrame(tick); }
  const sb = { THREE, scene, camera, renderer, controls, lights, world, panel: panelApi, view, label, hud: setHud, stage, onFrame: f => frameFns.push(f), start() { if (!running) { running = true; clock.start(); tick(); } }, mat, mesh,
    snapshot() { render(); const gl = renderer.getContext(), w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px); let lit = 0; for (let i = 0; i < px.length; i += 16) if (px[i] + px[i + 1] + px[i + 2] > 60) lit++; return { w, h, litShare: lit / (px.length / 16) }; } };
  window.RLSandbox = sb;
  return sb;
}
