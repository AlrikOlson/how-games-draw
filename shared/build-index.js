// usage: node shared/build-index.js
// Builds index.html from shared/index.template.html: inlines shared/theme.css and fills each
// entry's demo list from the section headings of pages/<slug>.html (Tradeoffs and
// "Where it shows up" sections are skipped).
const fs = require('fs');
let html = fs.readFileSync('shared/index.template.html', 'utf8');
html = html.replace('/*THEME*/', fs.readFileSync('shared/theme.css', 'utf8'));
const skip = /^(tradeoffs|where it shows up|where you|shipped)/i;
html = html.replace(/<ul class="demos" data-slug="([^"]+)"><\/ul>/g, (m, slug) => {
  const page = fs.readFileSync('pages/' + slug + '.html', 'utf8');
  const h2 = [...page.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)]
    .map(x => x[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(x => !skip.test(x));
  return '<ul class="demos">' + h2.map(x => '<li>' + x + '</li>').join('') + '</ul>';
});
fs.writeFileSync('index.html', html);
console.log('index.html written, ' + html.length + ' bytes');
