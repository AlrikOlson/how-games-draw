// usage: PLAYWRIGHT=... node shared/stages.cjs pages/x.html
// For each section.stage, reports whether the picture, the step card and the controls fit in one viewport at
// 1440x900 and 1280x720 (the foot may fall below on the smaller one), plus page errors and horizontal overflow.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
(async () => {
  const file = process.argv[2];
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  let bad = 0;
  for (const [w, h] of [[1440, 900], [1280, 720], [400, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(file), { waitUntil: 'load' }); await p.waitForTimeout(800);
    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    const rows = [];
    const ids = await p.evaluate(() => [...document.querySelectorAll('section.stage')].map(s => s.id));
    for (const id of ids) {
      await p.evaluate(id => document.getElementById(id).scrollIntoView(), id); await p.waitForTimeout(100);
      const r = await p.evaluate(id => { const s = document.getElementById(id), vh = innerHeight, bot = e => e ? Math.round(e.getBoundingClientRect().bottom) : 0;
        const core = Math.max(...[...s.querySelectorAll('canvas, .step, .controls, .tiles')].filter(e => !e.hidden && e.offsetParent && !e.closest('details:not([open])')).map(bot));
        return { core, whole: Math.round(s.getBoundingClientRect().height), vh }; }, id);
      const ok = w <= 400 ? true : r.core <= r.vh;
      if (!ok) bad++;
      rows.push(`  ${ok ? 'ok  ' : 'OVER'} ${id.padEnd(14)} demo+steps end at ${r.core}px of ${r.vh}, whole stage ${r.whole}px`);
    }
    console.log(`${w}x${h}${sw > w ? ' HORIZONTAL OVERFLOW ' + sw : ''}\n${rows.join('\n')}\n  errors ${JSON.stringify(errs)}`);
    if (sw > w || errs.length) bad++;
    await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
