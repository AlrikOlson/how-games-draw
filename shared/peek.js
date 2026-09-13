// usage: node shared/peek.js pages/foo.html out.png [width] [css-selector]
// Screenshots just the element matched by the selector (default: first section) at the given width.
// With selector "overflow" it instead lists elements wider than the viewport.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright'); const fs = require('fs');
(async () => {
  const [,, file, out, w, sel] = process.argv;
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: +(w || 1600), height: 1000 } });
  const html = fs.readFileSync(file, 'utf8');
  const doc = /^\s*<!doctype/i.test(html) ? html : '<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>';
  await p.setContent(doc, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  if (sel === 'overflow') {
    const vw = +(w || 1600);
    const list = await p.evaluate((vw) => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > vw + 0.5 && !(function(a){for(a=a.parentElement;a&&a!==document.body;a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==='auto'||o==='scroll'||o==='hidden')return true;}return false;})(e)).slice(0, 15).map(e => e.tagName + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' right=' + Math.round(e.getBoundingClientRect().right) + ' w=' + Math.round(e.getBoundingClientRect().width)), vw);
    console.log(list.join('\n') || 'no overflow');
  } else {
    const el = await p.$(sel || 'section');
    await el.screenshot({ path: out });
    console.log('saved', out);
  }
  await b.close();
})();
