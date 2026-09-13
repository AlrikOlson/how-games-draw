// usage: node shot.js pages/foo.html shots/foo.png [width]
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const [,, file, out, w] = process.argv;
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: +(w||1100), height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|net::/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
  const html = fs.readFileSync(file, 'utf8');
  await p.setContent('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body>' + html + '</body></html>', { waitUntil: 'load' });
  await p.waitForTimeout(2000);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: out, fullPage: true });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log(JSON.stringify({ errors: errs, scrollWidth: sw, height: h }));
  await b.close();
})();
