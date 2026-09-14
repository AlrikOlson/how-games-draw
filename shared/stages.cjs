// usage: PLAYWRIGHT=... node shared/stages.cjs pages/x.html
// Dashboard fit check. For every stage: shows it through the shell, then checks that every canvas sits fully
// inside the picture area, that the step card is fully visible in the side panel without scrolling, and that
// the page itself never scrolls. Reports whether the side panel needs to scroll for controls (allowed) and any
// page errors. Runs at 1440x900, 1280x720, 1920x1080 and 400x800. Exit 1 on any hard failure.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
(async () => {
  const file = process.argv[2];
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  let bad = 0;
  for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080], [400, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(file), { waitUntil: 'load' }); await p.waitForTimeout(700);
    const shell = await p.evaluate(() => !!window.RLShell);
    if (!shell) { console.log(w + 'x' + h + '  NO SHELL on this page'); bad++; await p.close(); continue; }
    const ids = await p.evaluate(() => RLShell.panels);
    const rows = [];
    for (const id of ids) {
      const r = await p.evaluate(id => {
        RLShell.show(id); RLShell.fit();
        const s = document.getElementById(id); if (!s.classList.contains('stage')) return null;
        const vw = innerWidth, vh = innerHeight, box = e => e.getBoundingClientRect();
        const pic = box(s.querySelector('.dash-pic')), side = s.querySelector('.dash-side'), sb = box(side);
        const cv = [...s.querySelectorAll('.dash-pic canvas')].map(box);
        const phone = innerWidth <= 900;
        const cvOk = phone || cv.every(c => c.left >= pic.left - 1 && c.right <= pic.right + 1 && c.top >= pic.top - 1 && c.bottom <= pic.bottom + 1 && c.width >= 150);
        const step = s.querySelector('.step'), st = step ? box(step) : null;
        const stepOk = !st || innerWidth <= 500 || (st.top >= sb.top - 1 && st.bottom <= sb.bottom + 1);
        const ctl = [...s.querySelectorAll('.controls, .tiles')].filter(e => !e.hidden && e.offsetParent);
        const ctlBottom = Math.max(0, ...ctl.map(e => box(e).bottom));
        return { cvOk: cvOk || phone, cvMin: Math.round(Math.min(...cv.map(c => c.width))), stepOk, sideScroll: side.scrollHeight > side.clientHeight + 1, ctlVisible: ctlBottom <= sb.bottom + 1, pageScroll: document.documentElement.scrollWidth > vw || document.documentElement.scrollHeight > vh, big: Math.round(Math.max(...cv.map(c => c.width))) };
      }, id);
      if (!r) continue;
      const hard = !r.cvOk || !r.stepOk || r.pageScroll;
      if (hard) bad++;
      rows.push(`  ${hard ? 'FAIL' : 'ok  '} ${id.padEnd(14)} canvas ${r.cvOk ? 'inside' : 'CLIPPED'} (widest ${r.big}px, narrowest ${r.cvMin}px) · step card ${r.stepOk ? 'visible' : 'CUT'} · controls ${r.ctlVisible ? 'visible' : 'below fold'}${r.sideScroll ? ' · side panel scrolls' : ''}${r.pageScroll ? ' · PAGE SCROLLS' : ''}`);
    }
    console.log(`${w}x${h}\n${rows.join('\n')}\n  errors ${JSON.stringify(errs)}`);
    if (errs.length) bad++;
    await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
