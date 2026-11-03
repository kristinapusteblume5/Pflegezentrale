'use strict';
// Lokaler Entwicklungsserver: dient public/ aus und ruft die api/-Funktionen wie Vercel auf.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function start(port = 3000) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice(5).replace(/[^a-z]/g, '');
      const file = path.join(ROOT, 'api', name + '.js');
      if (!name || name.startsWith('_') || !fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
      // wie Vercel: JSON-Body vorab einlesen
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const chunks = []; for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks).toString('utf8');
        if (raw && String(req.headers['content-type'] || '').includes('json')) { try { req.body = JSON.parse(raw); } catch (_) { req.body = raw; } }
      }
      return require(file)(req, res);
    }
    let p = url.pathname === '/' ? '/index.html' : url.pathname;
    const full = path.normalize(path.join(ROOT, 'public', p));
    if (!full.startsWith(path.join(ROOT, 'public')) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(full)] || 'application/octet-stream');
    fs.createReadStream(full).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
module.exports = { start };
if (require.main === module) start(Number(process.env.PORT || 3000)).then((s) => console.log('Lokal: http://localhost:' + s.address().port));
