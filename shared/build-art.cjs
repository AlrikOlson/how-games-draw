// usage: PLAYWRIGHT=... node shared/build-art.cjs
// Screenshots each lesson's first demo picture (as the dashboard shows it) into art/<slug>.jpg for the hub's cards.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs'), path = require('path');
(async () => {
  fs.mkdirSync('art', { recursive: true });
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  for (const f of fs.readdirSync('pages').filter(f => f.endsWith('.html')).sort()) {
    const slug = f.replace(/\.html$/, '');
    await p.goto('file://' + path.resolve('pages', f), { waitUntil: 'load' }); await p.waitForTimeout(700);
    const first = await p.evaluate(() => { const ids = (window.RLShell && RLShell.panels) || []; const id = ids.find(i => document.getElementById(i) && document.getElementById(i).classList.contains('stage')); if (id) RLShell.show(id); return id; });
    await p.waitForTimeout(500);
    const el = await p.$('.dash-main > section.cur .dash-picin');
    if (!el) { console.log(slug.padEnd(30), 'no picture'); continue; }
    await el.screenshot({ path: 'art/' + slug + '.jpg', type: 'jpeg', quality: 82 });
    console.log(slug.padEnd(30), first, Math.round(fs.statSync('art/' + slug + '.jpg').size / 1024) + ' KB');
  }
  await b.close();
})();
