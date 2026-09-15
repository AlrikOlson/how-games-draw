// usage: node shared/serve.cjs [port] [dir]
// Serves a folder at http://localhost:<port>/how-games-draw/ (default: the repo root on 8770), which is the same
// base path the published site uses, so absolute and relative links both behave as they do live.
const http = require('http'), fs = require('fs'), path = require('path');
const port = +(process.argv[2] || 8770), root = path.resolve(process.argv[3] || '.'), base = '/how-games-draw';
const types = { html: 'text/html; charset=utf-8', js: 'text/javascript', mjs: 'text/javascript', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', woff2: 'font/woff2' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (p === base) p = base + '/index.html';
  if (!p.startsWith(base + '/')) { res.writeHead(404); return res.end('not under ' + base); }
  let f = path.join(root, p.slice(base.length + 1));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) || !f.startsWith(root)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': types[path.extname(f).slice(1)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('http://localhost:' + port + base + '/'));
