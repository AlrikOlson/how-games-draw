// usage: node shared/build-site.js [--base /rendering-library]
// Builds the publishable site into dist/: rebuilds the hub, wraps every page fragment in a
// full HTML document, rewrites links to absolute paths under --base (moistfridge serves a folder
// at /slug with no trailing slash, so relative links would resolve against the site root), and
// adds previous / next navigation in hub order at the foot of every page.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const argBase = process.argv.indexOf('--base');
const base = (argBase > -1 ? process.argv[argBase + 1] : '/how-games-draw').replace(/\/$/, '');

execSync('node shared/build-index.js', { stdio: 'inherit' });

const hub = fs.readFileSync('index.html', 'utf8');
const order = [...hub.matchAll(/<a class="card" href="pages\/([^"]+)\.html"[^>]*>[\s\S]*?<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)]
  .map(m => ({ slug: m[1], title: m[2], blurb: m[3].replace(/<[^>]+>/g, '') }));
if (order.length !== 22) throw new Error('expected 22 hub entries, found ' + order.length);

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/pages', { recursive: true });

const stagesOf = slug => [...fs.readFileSync('pages/' + slug + '.html', 'utf8').matchAll(/<section id="([^"]+)" class="stage">/g)].map(m => m[1]);
const pagesTag = '<script>window.RL_PAGES=' + JSON.stringify(order.map((p, i) => ({ n: i + 1, slug: p.slug, title: p.title.replace(/&amp;/g, '&'), stages: stagesOf(p.slug) }))) + ';window.RL_BASE=' + JSON.stringify(base) + ';</script>';
// card art for the hub, made by shared/build-art.cjs
if (fs.existsSync('art')) { fs.mkdirSync('dist/art', { recursive: true }); for (const f of fs.readdirSync('art')) fs.copyFileSync('art/' + f, 'dist/art/' + f); }
fs.writeFileSync('dist/index.html', hub.replace(/href="pages\//g, 'href="' + base + '/pages/').replace(/src="art\//g, 'src="' + base + '/art/').replace('</head>', pagesTag + '\n</head>'));

const esc = s => s.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');
order.forEach((page, i) => {
  const src = fs.readFileSync('pages/' + page.slug + '.html', 'utf8');
  const cut = src.indexOf('</style>');
  if (cut < 0) throw new Error(page.slug + ': no </style>');
  let head = src.slice(0, cut + '</style>'.length).replace(/<title>(.*?)<\/title>/, (m, t) => '<title>' + esc(t) + ' · How Games Draw</title>');
  head += '\n<meta name="description" content="' + page.blurb.replace(/"/g, '&quot;') + '">';
  head += '\n' + pagesTag;
  let body = src.slice(cut + '</style>'.length).replace(/href="\.\.\/index\.html"/g, 'href="' + base + '"');

  const prev = order[i - 1], next = order[i + 1];
  const nav = '\n  <nav class="pagenav" aria-label="Previous and next page">'
    + (prev ? '<a href="' + base + '/pages/' + prev.slug + '.html"><span class="lab">← previous </span>' + prev.title + '</a>'
            : '<a href="' + base + '"><span class="lab">← </span>How Games Draw</a>')
    + '<span class="pos">' + String(i + 1).padStart(2, '0') + ' / ' + order.length + '</span>'
    + (next ? '<a class="next" href="' + base + '/pages/' + next.slug + '.html"><span class="lab">next </span>' + next.title + ' →</a>'
            : '<a class="next" href="' + base + '">back to all lessons →</a>')
    + '</nav>\n';
  const last = body.lastIndexOf('</section>');
  if (last < 0) throw new Error(page.slug + ': no sections');
  body = body.slice(0, last + '</section>'.length) + nav + body.slice(last + '</section>'.length);

  const doc = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + head + '\n</head>\n<body>\n' + body.trim() + '\n</body>\n</html>\n';
  fs.writeFileSync('dist/pages/' + page.slug + '.html', doc);
});

const files = fs.readdirSync('dist/pages').length + 1;
const bytes = fs.readdirSync('dist/pages').reduce((n, f) => n + fs.statSync('dist/pages/' + f).size, fs.statSync('dist/index.html').size);
console.log('dist/ written: ' + files + ' files, ' + (bytes / 1e6).toFixed(2) + ' MB, base ' + base);
