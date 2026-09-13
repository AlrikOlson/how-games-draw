// usage: node shared/apply-theme.js
// Re-injects shared/theme.css into every page's <style> (replacing the old theme block and the
// old "Rewrite additions" block, keeping page-specific CSS), and inserts an "On this page"
// jump list after the header, adding section ids where a section has none.
const fs = require('fs');
const theme = fs.readFileSync('shared/theme.css', 'utf8').trim();

function stripOldTheme(css) {
  // old theme block: from the marker comment to the reduced-motion line (inclusive)
  css = css.replace(/\/\* Rendering Library shared theme[\s\S]*?@media \(prefers-reduced-motion: reduce\)[^\n]*\n?/, '');
  // old rewrite-additions block: marker through the .terms media line (inclusive)
  css = css.replace(/\n?\/\* Rewrite additions \*\/[\s\S]*?@media \(max-width: 480px\) \{ \.terms[^\n]*\n?/, '');
  return css;
}

function distanceFieldsPageCss(css) {
  // that page predates theme.css: keep only its page-specific rules
  const keep = [];
  for (const line of css.split('\n')) {
    if (/^\s*\.key \.k-|^\s*\.steps|^\s*\.step\b|^\s*\.step\.|^\s*\.step \.|^\s*@media \(max-width: 480px\) \{ \.steps/.test(line)) keep.push(line.trim());
  }
  return keep.join('\n');
}

const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&amp;/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);

for (const f of fs.readdirSync('pages')) {
  let html = fs.readFileSync('pages/' + f, 'utf8');
  html = html.replace(/<style>([\s\S]*?)<\/style>/, (m, css) => {
    let page = f === 'distance-fields.html' ? distanceFieldsPageCss(css) : stripOldTheme(css).trim();
    if (page && !/^\s*\/\*/.test(page)) page = '/* page-specific */\n' + page;
    return '<style>\n' + theme + '\n\n' + page + '\n</style>';
  });

  // remove a previous toc, then rebuild it
  html = html.replace(/\s*<ul class="toc">[\s\S]*?<\/ul>/, '');
  const used = new Set();
  const items = [];
  let n = 0;
  html = html.replace(/<section([^>]*)>([\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>)/g, (m, attrs, rest, h2) => {
    const title = h2.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    let id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    if (!id) { id = slug(title) || 'section'; let k = 2; const base = id; while (used.has(id)) id = base + '-' + k++; attrs += ' id="' + id + '"'; }
    used.add(id);
    const isDemo = !/^(tradeoffs|where it shows up)/i.test(title);
    if (isDemo) n++;
    items.push({ id, title, num: isDemo ? String(n).padStart(2, '0') : null });
    return '<section' + attrs + '>' + rest;
  });
  const toc = '\n  <ul class="toc"><li class="toc-lab">On this page</li>' + items.map(i =>
    '<li><a href="#' + i.id + '"' + (i.num ? '' : ' class="dim"') + '>' + (i.num ? '<span class="n">' + i.num + '</span>' : '') + i.title.replace(/:.*$/, '') + '</a></li>').join('') + '</ul>';
  html = html.replace(/<\/header>/, '</header>' + toc);
  fs.writeFileSync('pages/' + f, html);
  console.log(f.padEnd(34), items.length + ' sections');
}
