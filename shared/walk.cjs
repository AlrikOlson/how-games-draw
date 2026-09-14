// usage: PLAYWRIGHT=/path/to/node_modules/playwright node shared/walk.cjs pages/x.html
// Drives every lesson on a page: answers each quiz with its right option, runs each goal step's try(), and
// reports any step whose Continue button stays locked. Exit code 1 on any blocked step or page error.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
(async () => {
  const file = process.argv[2]; if (!file) { console.error('usage: walk.cjs pages/x.html'); process.exit(2); }
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|fonts/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto('file://' + path.resolve(file), { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; try { localStorage.clear(); } catch (e) {} });
  const ids = await p.evaluate(() => [...document.querySelectorAll('[data-lesson]')].map(e => e.dataset.lesson));
  if (!ids.length) { console.log('no lessons on this page'); process.exit(1); }
  let blocked = 0; const lines = [];
  for (const id of ids) {
    await p.evaluate(id => { if (window.RLShell) RLShell.show(id); }, id); await p.waitForTimeout(60);
    const n = await p.evaluate(id => RL.lessons[id].spec.steps.length, id);
    await p.evaluate(id => RL.lessons[id].go(0), id);
    for (let i = 0; i < n; i++) {
      const meta = await p.evaluate(([id, i]) => { const s = RL.lessons[id].spec.steps[i]; return { quiz: !!s.quiz, ok: s.quiz ? s.quiz.options.findIndex(o => o.ok) : -1, goal: !!s.goal, hasTry: !!s.try, say: (s.say || '').replace(/<[^>]+>/g, '').slice(0, 50) }; }, [id, i]);
      if (meta.quiz) {
        if (meta.ok < 0) { lines.push(`  ${id} step ${i + 1}: quiz has no ok option`); blocked++; }
        else { await p.click(`[data-lesson="${id}"] .quiz button:nth-of-type(${meta.ok + 1})`); await p.waitForTimeout(60); }
      }
      if (meta.goal) {
        if (!meta.hasTry) { lines.push(`  ${id} step ${i + 1}: goal step has no try()`); blocked++; }
        else { const err = await p.evaluate(([id, i]) => { try { RL.lessons[id].spec.steps[i].try(); RL.lessons[id].check(); return null; } catch (e) { return String(e); } }, [id, i]); if (err) { lines.push(`  ${id} step ${i + 1}: try() threw ${err}`); blocked++; } }
        await p.waitForTimeout(80);
      }
      const enabled = await p.$eval(`[data-lesson="${id}"] .next`, b => !b.disabled);
      const status = await p.$eval(`[data-lesson="${id}"] .status`, e => e.textContent.trim().slice(0, 70));
      lines.push(`  ${enabled ? 'ok     ' : 'BLOCKED'} ${id} step ${i + 1}/${n} · ${meta.say}${status ? ' → ' + status : ''}`);
      if (!enabled) blocked++;
      if (i < n - 1) await p.evaluate(id => RL.lessons[id].go(RL.lessons[id].step + 1), id);
      else await p.click(`[data-lesson="${id}"] .next`).catch(() => {});
      await p.waitForTimeout(60);
    }
  }
  console.log(lines.join('\n'));
  console.log(`${ids.length} lessons · ${blocked} blocked · errors ${JSON.stringify(errs)}`);
  await b.close();
  process.exit(blocked || errs.length ? 1 : 0);
})();
