// lesson-shell start
// Rendering Library dashboard shell. Pasted into every page after the lesson kit. On load it rebuilds the
// page into a fixed, edge-to-edge app: a top bar (library, topic, stage position), a rail of stages on the
// left, the picture filling the middle, the step panel on the right. One stage shows at a time; nothing on
// the page scrolls except the step panel and the reference panels. Deep links (#stage-id) still work.
(function () {
  const wrap = document.querySelector('.wrap'); if (!wrap || document.documentElement.classList.contains('dash')) return;
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const header = wrap.querySelector('header'), back = wrap.querySelector('a.back'), pagenav = wrap.querySelector('.pagenav');
  const stages = $$('section.stage', wrap), refs = $$('section:not(.stage)', wrap);
  if (!stages.length) return;
  const title = (header && header.querySelector('h1') ? header.querySelector('h1').textContent : document.title).trim();
  const page = (location.pathname.split('/').pop() || 'page').replace(/\.html$/, '');
  const pages = window.RL_PAGES || null, base = window.RL_BASE || '';
  document.documentElement.classList.add('dash');
  document.title = title + ' · How Games Draw';

  // ---- panels: overview (the old header), one per stage, one per reference section
  const panels = [];
  const overview = el('section', 'dash-panel-ov'); overview.id = 'overview';
  if (header) overview.appendChild(header);
  overview.appendChild(el('p', 'dash-start', '<a href="#' + stages[0].id + '">Start with the first demo →</a>'));
  panels.push({ id: 'overview', label: 'Overview', node: overview, kind: 'ov' });
  stages.forEach((s, i) => {
    const h2 = s.querySelector('h2'), sub = s.querySelector('.sub'), cols = s.querySelector('.cols'), foot = s.querySelector('.foot');
    const head = el('div', 'dash-stagehead');
    if (h2) { h2.dataset.n = String(i + 1).padStart(2, '0'); head.appendChild(h2); }
    if (sub) head.appendChild(sub);
    const pic = el('div', 'dash-pic'), inner = el('div', 'dash-picin'), panel = el('div', 'dash-side');
    if (cols) { [...cols.children].forEach(c => (c.classList.contains('lesson') ? panel : inner).appendChild(c)); cols.remove(); }
    pic.appendChild(inner);
    if (foot) panel.appendChild(foot);
    // a picture that a page parked above its step card (.lesson-top) belongs with the other pictures
    $$('.lesson-top', panel).forEach(t => { const vps = [...t.children].filter(c => c.classList.contains('vp')); if (vps.length) { vps.forEach(v => inner.appendChild(v)); t.remove(); } else inner.appendChild(t); });
    // two or three .vp blocks straight from the old .cols sit side by side; a page's own wrapper keeps its own grid
    inner.classList.toggle('row', [...inner.children].filter(c => c.classList.contains('vp')).length > 1);
    s.innerHTML = ''; s.append(head, pic, panel);
    panels.push({ id: s.id, label: h2 ? h2.textContent.trim() : s.id, node: s, kind: 'stage', n: i + 1 });
  });
  refs.forEach(s => { s.classList.add('dash-ref'); panels.push({ id: s.id, label: (s.querySelector('h2') || {}).textContent || s.id, node: s, kind: 'ref' }); });

  // ---- chrome
  const app = el('div', 'dash-app');
  const top = el('div', 'dash-top');
  const homeHref = pages ? (base || '/') : (back ? back.getAttribute('href') : '../index.html');
  let topics = '';
  if (pages) topics = '<select class="dash-topics" aria-label="Topic">' + pages.map(p => `<option value="${p.slug}"${p.slug === page ? ' selected' : ''}>${String(p.n).padStart(2, '0')} · ${esc(p.title)}</option>`).join('') + '</select>';
  top.innerHTML = `<a class="dash-home">How Games Draw</a><span class="dash-sep">/</span>${topics || '<span class="dash-title">' + esc(title) + '</span>'}` +
    `<select class="dash-stagesel" aria-label="Stage"></select><span class="dash-grow"></span>` +
    `<button type="button" class="dash-prev" aria-label="Previous stage">‹</button><span class="dash-pos"></span><button type="button" class="dash-next" aria-label="Next stage">›</button>`;
  top.querySelector('.dash-home').href = homeHref;
  const rail = el('nav', 'dash-rail');
  const list = el('div', 'dash-list');
  panels.forEach(p => { const a = el('a', 'dash-item ' + p.kind, (p.n ? '<span class="n">' + String(p.n).padStart(2, '0') + '</span>' : '') + '<span class="t">' + esc(p.label) + '</span><span class="ok">✓</span>'); a.href = '#' + p.id; a.dataset.id = p.id; list.appendChild(a); });
  rail.appendChild(list);
  { const f = el('div', 'dash-railfoot'); if (pagenav) { const nx = pagenav.querySelector('a.next'), pv = pagenav.querySelector('a:not(.next)'); if (pv) f.appendChild(pv); if (nx) f.appendChild(nx); pagenav.remove(); } f.appendChild(el('span', 'dash-by', 'built by Alrik Olson with GPT-6 Astra and Claude Fable 5.1')); rail.appendChild(f); }
  const main = el('div', 'dash-main');
  panels.forEach(p => main.appendChild(p.node));
  app.append(top, rail, main); document.body.appendChild(app); wrap.remove();
  const sel = top.querySelector('.dash-stagesel'); panels.forEach(p => { const o = document.createElement('option'); o.value = p.id; o.textContent = (p.n ? String(p.n).padStart(2, '0') + ' · ' : '') + p.label; sel.appendChild(o); });
  if (pages) top.querySelector('.dash-topics').addEventListener('change', e => { location.href = base + '/pages/' + e.target.value + '.html'; });

  // ---- showing a panel
  const key = 'rl:' + page + ':stage';
  let cur = -1;
  function show(id, push) {
    let k = panels.findIndex(p => p.id === id); if (k < 0) k = 0;
    cur = k;
    panels.forEach((p, i) => p.node.classList.toggle('cur', i === k));
    $$('.dash-item', rail).forEach(a => a.classList.toggle('cur', a.dataset.id === panels[k].id));
    sel.value = panels[k].id;
    const p = panels[k];
    top.querySelector('.dash-pos').textContent = p.kind === 'stage' ? p.n + ' / ' + stages.length : p.label;
    top.querySelector('.dash-prev').disabled = k === 0; top.querySelector('.dash-next').disabled = k === panels.length - 1;
    try { localStorage.setItem(key, p.id); } catch (e) {}
    if (push !== false && location.hash !== '#' + p.id) history.replaceState(null, '', '#' + p.id);
    const side = p.node.querySelector('.dash-side'); if (side) side.scrollTop = 0;
    fit(); markDone();
    const a = $$('.dash-item', rail)[k]; if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
  }
  const step = d => { const k = Math.max(0, Math.min(panels.length - 1, cur + d)); show(panels[k].id); };
  top.querySelector('.dash-prev').addEventListener('click', () => step(-1));
  top.querySelector('.dash-next').addEventListener('click', () => step(1));
  sel.addEventListener('change', e => show(e.target.value));
  window.addEventListener('hashchange', () => show(location.hash.slice(1), false));
  document.addEventListener('keydown', e => { if (e.target.matches('input, select, textarea, button')) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') { step(1); e.preventDefault(); } if (e.key === 'ArrowLeft' || e.key === 'PageUp') { step(-1); e.preventDefault(); } });

  // ---- the picture block is sized so that its own layout (one canvas, or a page's row or grid of them) fits the middle
  function fit() {
    const p = panels[cur]; if (!p || p.kind !== 'stage') return;
    const pic = p.node.querySelector('.dash-pic'), inner = pic && pic.querySelector('.dash-picin'); if (!inner) return;
    const cs = getComputedStyle(pic), r = pic.getBoundingClientRect();
    const W = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), H = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (W <= 0 || H <= 0) return;
    const phone = window.matchMedia('(max-width: 900px)').matches;
    inner.classList.toggle('stack', inner.classList.contains('row') && W < 480);
    if (phone) { inner.style.width = W + 'px'; return; }
    // hover readouts under a picture change length as the mouse moves; lock each caption's height so the picture never jumps
    const caps = $$('.vp .cap', inner); const reserve = c => (parseFloat(getComputedStyle(c).lineHeight) || 19) * 2 * Math.max(1, c.children.length);
    caps.forEach(c => { c.style.minHeight = reserve(c) + 'px'; });
    let w = W;
    for (let i = 0; i < 3; i++) {
      inner.style.width = Math.max(160, w) + 'px';
      const h = inner.getBoundingClientRect().height;
      if (h <= H + 0.5) break;
      w = w * (H / h) * 0.985;
    }
    caps.forEach(c => { c.style.minHeight = Math.max(reserve(c), c.getBoundingClientRect().height) + 'px'; });
  }
  let raf = 0; const refit = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
  window.addEventListener('resize', refit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(main);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);

  // ---- progress ticks in the rail, from the lesson kit's saved state
  function markDone() {
    $$('.dash-item.stage', rail).forEach(a => { let done = false; try { const s = JSON.parse(localStorage.getItem('rl:' + page + '.html:' + a.dataset.id) || localStorage.getItem('rl:' + page + ':' + a.dataset.id) || 'null'); done = !!(s && s.finished); } catch (e) {} a.classList.toggle('done', done); });
  }
  document.addEventListener('rl:progress', markDone);

  // ---- start: the deep link, else where the reader left off, else the overview on a first visit
  let start = location.hash.slice(1); if (!panels.some(p => p.id === start)) { try { start = localStorage.getItem(key) || ''; } catch (e) {} }
  if (!panels.some(p => p.id === start)) start = 'overview';
  show(start, false);
  window.RLShell = { show, panels: panels.map(p => p.id), fit };
})();
// lesson-shell end
