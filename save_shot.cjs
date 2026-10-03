/**
 * save_shot.cjs — local receiver for in-page canvas screenshots.
 * The browser page POSTs a data URL (text/plain, no preflight) to
 *   http://127.0.0.1:5199/s?name=<file>
 * and this writes tmp_classmate_check/<file>.png.
 * POST /done closes the server.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = 'tmp_classmate_check';
fs.mkdirSync(OUT, { recursive: true });

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const u = new URL(req.url, 'http://127.0.0.1');
  if (u.pathname === '/done') {
    res.writeHead(200); res.end('bye');
    setTimeout(() => { console.log('DONE'); process.exit(0); }, 200);
    return;
  }
  if (u.pathname !== '/s') { res.writeHead(404); res.end('nope'); return; }

  const name = (u.searchParams.get('name') || 'shot').replace(/[^\w.-]/g, '_');
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    const b64 = body.includes(',') ? body.slice(body.indexOf(',') + 1) : body;
    const data = Buffer.from(b64, 'base64');
    fs.writeFileSync(path.join(OUT, `${name}.png`), data);
    console.log(`wrote ${OUT}/${name}.png  ${data.length} bytes`);
    res.writeHead(200); res.end('ok');
  });
});

server.listen(5199, '127.0.0.1', () => console.log('listening on 127.0.0.1:5199'));
