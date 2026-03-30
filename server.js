const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const MIME = { html:'text/html', css:'text/css', js:'text/javascript', png:'image/png', jpg:'image/jpeg', svg:'image/svg+xml' };
http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const f = path.join(ROOT, url);
  try {
    const d = fs.readFileSync(f);
    const ext = path.extname(f).slice(1);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(d);
  } catch(e) {
    res.writeHead(404); res.end('404');
  }
}).listen(3001, () => console.log('Server running on http://localhost:3001'));
