// usage: PLAYWRIGHT=... node shared/sandbox-check.cjs sandbox/x.html [--shot out.png]
// Serves the repo on a local port, opens the sandbox page, and checks: no page errors, the three.js scene
// renders something (a share of the frame is not background), the panel has controls, and every control can
// be exercised without throwing. Exit 1 on any failure.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { spawn } = require('child_process'); const path = require('path');
(async () => {
  const file = process.argv[2]; if (!file) { console.error('usage: sandbox-check.cjs sandbox/x.html'); process.exit(2); }
  const shotIdx = process.argv.indexOf('--shot'); const shot = shotIdx > -1 ? process.argv[shotIdx + 1] : null;
  const port = 8790 + Math.floor(Math.random() * 100);
  const srv = spawn(process.execPath, [path.join(__dirname, 'serve.cjs'), String(port), path.resolve(__dirname, '..')], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 400));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|favicon/.test(m.text())) errs.push('console: ' + m.text()); });
  const rel = path.relative(path.resolve(__dirname, '..'), path.resolve(file)).split(path.sep).join('/');
  const url = `http://localhost:${port}/how-games-draw/${rel}`;
  let bad = 0; const lines = [];
  try {
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    const ok = await p.evaluate(() => !!window.RLSandbox);
    if (!ok) { lines.push('  FAIL the kit never booted (no window.RLSandbox)'); bad++; }
    else {
      const snap = await p.evaluate(() => RLSandbox.snapshot());
      lines.push(`  ${snap.litShare > 0.04 ? 'ok  ' : 'FAIL'} frame ${snap.w}x${snap.h}, ${(snap.litShare * 100).toFixed(0)}% of pixels not background`); if (snap.litShare <= 0.04) bad++;
      const ctl = await p.$$('.sb-panel input, .sb-panel .seg button, .sb-panel .btn');
      lines.push(`  ${ctl.length >= 4 ? 'ok  ' : 'FAIL'} ${ctl.length} controls on the panel`); if (ctl.length < 4) bad++;
      const secs = await p.$$eval('.sb-sec h2', h => h.map(x => x.textContent)); lines.push('  sections: ' + secs.join(' · '));
      // exercise every control once: sliders to max then back, toggles on/off, each segment button, each button
      const before = errs.length;
      await p.evaluate(async () => {
        const fire = (el, ev) => el.dispatchEvent(new Event(ev, { bubbles: true }));
        for (const s of document.querySelectorAll('.sb-panel input[type=range]')) { const v = s.value; s.value = s.max; fire(s, 'input'); s.value = s.min; fire(s, 'input'); s.value = v; fire(s, 'input'); }
        for (const c of document.querySelectorAll('.sb-panel input[type=checkbox]')) { c.click(); c.click(); }
        for (const b of document.querySelectorAll('.sb-panel .seg button')) b.click();
        for (const b of document.querySelectorAll('.sb-panel .btn')) b.click();
      });
      await p.waitForTimeout(800);
      const snap2 = await p.evaluate(() => RLSandbox.snapshot());
      lines.push(`  ${errs.length === before ? 'ok  ' : 'FAIL'} controls exercised, ${(snap2.litShare * 100).toFixed(0)}% lit after`); if (errs.length !== before) bad++;
      if (shot) { await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(2000); await p.screenshot({ path: shot }); lines.push('  shot ' + shot); }
    }
  } catch (e) { lines.push('  FAIL ' + e.message.split('\n')[0]); bad++; }
  console.log(url + '\n' + lines.join('\n') + '\n  errors ' + JSON.stringify(errs));
  if (errs.length) bad++;
  await b.close(); srv.kill();
  process.exit(bad ? 1 : 0);
})();
