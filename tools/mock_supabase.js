const http = require('http'), fs = require('fs'), path = require('path');
const BUCKET = process.argv[2]; const rows = new Map(); let tick = 0;
const USER = { id: '11111111-1111-1111-1111-111111111111', email: 'me@example.com' };
const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const u = new URL(req.url, 'http://x'); let body = ''; req.on('data', c => body += c); req.on('end', () => {
    if (u.pathname === '/auth/v1/token') { const b = JSON.parse(body || '{}'); if (b.password && b.password !== 'pw') return send(res, 400, { error_description: 'Invalid login credentials' }); return send(res, 200, { access_token: 'tok', refresh_token: 'ref', expires_in: 3600, user: USER }); }
    if (req.headers.authorization !== 'Bearer tok') return send(res, 401, { message: 'no auth' });
    if (u.pathname === '/rest/v1/kv' && req.method === 'GET') { const since = (u.searchParams.get('server_at') || '').replace('gt.', ''); const out = [...rows.values()].filter(r => !since || r.server_at > since).sort((a, b) => a.server_at.localeCompare(b.server_at)); return send(res, 200, out); }
    if (u.pathname === '/rest/v1/kv' && req.method === 'POST') { for (const r of JSON.parse(body)) { const t = new Date(Date.now() + (tick++)).toISOString(); rows.set(r.key, { key: r.key, value: r.value, updated_at: r.updated_at, server_at: t }); } return send(res, 201, ''); }
    if (u.pathname === '/rest/v1/rpc/kv_put') { const out = { saved: {}, conflicts: [] }; for (const it of JSON.parse(body).items) { const cur = rows.get(it.key); if (cur && cur.server_at !== it.base) { out.conflicts.push(it.key); continue; } const t = new Date(Date.now() + (tick++)).toISOString(); rows.set(it.key, { key: it.key, value: it.value, updated_at: it.updated_at, server_at: t }); out.saved[it.key] = t; } return send(res, 200, out); }
    const m = u.pathname.match(/^\/storage\/v1\/object\/authenticated\/lessons\/(.+)$/);
    if (m) { const f = path.join(BUCKET, decodeURIComponent(m[1])); if (fs.existsSync(f)) return send(res, 200, fs.readFileSync(f), 'application/octet-stream'); return send(res, 404, { message: 'not found' }); }
    if (u.pathname === '/__rows') return send(res, 200, [...rows.keys()]);
    send(res, 404, {});
  });
}).listen(8790, () => console.log('mock up'));
