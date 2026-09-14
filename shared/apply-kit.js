// usage: node shared/apply-kit.js [pages/x.html ...]
// Pastes shared/lesson-kit.js and shared/shell.js into each page's <script> (between the "// lesson-kit start/end" markers,
// replacing an older copy, or just before the page's main "(() => {" if the page has none yet).
const fs = require('fs');
const kit = fs.readFileSync('shared/lesson-kit.js', 'utf8').trim();
const shell = fs.readFileSync('shared/shell.js', 'utf8').trim();
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync('pages').map(f => 'pages/' + f);
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  const a = html.indexOf('// lesson-kit start'), b = html.indexOf('// lesson-kit end');
  if (a >= 0 && b > a) html = html.slice(0, a) + kit + html.slice(b + '// lesson-kit end'.length);
  else { const i = html.indexOf('\n(() => {'); if (i < 0) { console.log(f.padEnd(40), 'no main IIFE, skipped'); continue; } html = html.slice(0, i) + '\n' + kit + html.slice(i); }
  // the shell goes after the page's main script, so every demo and lesson exists before it rebuilds the page
  const sa = html.indexOf('// lesson-shell start'), sb = html.indexOf('// lesson-shell end');
  if (sa >= 0 && sb > sa) html = html.slice(0, sa) + shell + html.slice(sb + '// lesson-shell end'.length);
  else { const j = html.lastIndexOf('</script>'); html = html.slice(0, j) + shell + '\n' + html.slice(j); }
  fs.writeFileSync(f, html); console.log(f.padEnd(40), a >= 0 ? 'kit replaced' : 'kit inserted', sa >= 0 ? '· shell replaced' : '· shell inserted');
}
