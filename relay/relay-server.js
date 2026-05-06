// Alpha Brawl: combined static file server + WebSocket relay.
//
// Serves index.html (and any other file in /public) over HTTP, and forwards
// game messages between two clients on the same port over WSS. One process,
// one Fly.io app, one URL — the game loads and plays from the same origin.
//
// Control protocol (out-of-band, prefixed __ to never collide with game msgs):
//   client -> server: { t: '__join', code: 'ABC123', role: 'host'|'guest' }
//   server -> client: { t: '__joined', role, peer: bool }
//   server -> client: { t: '__peer',   joined: bool }
//   server -> client: { t: '__error',  reason: '...' }
// Anything else is opaque payload, forwarded verbatim.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { WebSocketServer } from 'ws';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';
const PUBLIC_DIR = resolve(process.env.PUBLIC_DIR || './public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

// ---- HTTP: static files ------------------------------------------------------
const httpServer = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end('method not allowed');
    return;
  }
  // Trim querystring, default to index.html, prevent path traversal.
  let url = (req.url || '/').split('?')[0];
  if (url === '/' || url === '') url = '/index.html';
  const safe = normalize(url).replace(/^([./\\]+)/, '/');
  const filePath = join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) {
      // Try index.html inside that dir
      const idx = join(filePath, 'index.html');
      const buf = await readFile(idx);
      res.writeHead(200, { 'content-type': MIME['.html'] });
      res.end(buf);
      return;
    }
    const buf = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
    res.end(buf);
  } catch (e) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found: ' + url);
  }
});

// ---- WebSocket relay ---------------------------------------------------------
const wss = new WebSocketServer({ server: httpServer });

// Map<roomCode, { host: WebSocket|null, guest: WebSocket|null }>
const rooms = new Map();

wss.on('connection', (ws, req) => {
  ws.room = null;
  ws.role = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (data, isBinary) => {
    let msg = null;
    if (!isBinary) {
      try { msg = JSON.parse(data.toString()); } catch (e) {}
    }
    if (msg && typeof msg.t === 'string' && msg.t.startsWith('__')) {
      handleControl(ws, msg);
      return;
    }
    if (!ws.room) return;
    const room = rooms.get(ws.room);
    if (!room) return;
    const dest = ws.role === 'host' ? room.guest : room.host;
    if (dest && dest.readyState === 1) {
      dest.send(data, { binary: isBinary });
    }
  });

  ws.on('close', () => {
    if (!ws.room) return;
    const room = rooms.get(ws.room);
    if (!room) return;
    const other = ws.role === 'host' ? room.guest : room.host;
    if (ws.role === 'host')  room.host  = null;
    if (ws.role === 'guest') room.guest = null;
    if (other && other.readyState === 1) {
      try { other.send(JSON.stringify({ t: '__peer', joined: false })); } catch (e) {}
    }
    if (!room.host && !room.guest) rooms.delete(ws.room);
    console.log(`[room ${ws.room}] ${ws.role} left (rooms=${rooms.size})`);
  });

  ws.on('error', (e) => { console.warn('ws error:', e && e.message); });
});

function handleControl(ws, msg) {
  if (msg.t !== '__join') return;
  const code = String(msg.code || '').toUpperCase().slice(0, 32);
  const role = msg.role === 'host' ? 'host' : 'guest';
  if (!code) return safeSend(ws, { t: '__error', reason: 'missing-code' });
  if (ws.room) return safeSend(ws, { t: '__error', reason: 'already-joined' });

  let room = rooms.get(code);

  if (role === 'host') {
    if (room && room.host && room.host.readyState === 1) {
      return safeSend(ws, { t: '__error', reason: 'room-taken' });
    }
    room = room || { host: null, guest: null };
    room.host = ws;
    rooms.set(code, room);
    ws.room = code; ws.role = 'host';
    const peer = !!(room.guest && room.guest.readyState === 1);
    safeSend(ws, { t: '__joined', role: 'host', peer });
    if (peer) safeSend(room.guest, { t: '__peer', joined: true });
    console.log(`[room ${code}] host joined (rooms=${rooms.size})`);
    return;
  }

  if (!room || !room.host || room.host.readyState !== 1) {
    return safeSend(ws, { t: '__error', reason: 'no-host' });
  }
  if (room.guest && room.guest.readyState === 1) {
    return safeSend(ws, { t: '__error', reason: 'room-full' });
  }
  room.guest = ws;
  ws.room = code; ws.role = 'guest';
  safeSend(ws, { t: '__joined', role: 'guest', peer: true });
  safeSend(room.host, { t: '__peer', joined: true });
  console.log(`[room ${code}] guest joined`);
}

function safeSend(ws, obj) {
  if (!ws || ws.readyState !== 1) return;
  try { ws.send(JSON.stringify(obj)); } catch (e) {}
}

// Heartbeat: drop dead connections every 30s.
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) { try { ws.terminate(); } catch (e) {} return; }
    ws.isAlive = false;
    try { ws.ping(); } catch (e) {}
  });
}, 30_000);

httpServer.listen(PORT, HOST, () => {
  console.log(`alphafight server listening on ${HOST}:${PORT} (static=${PUBLIC_DIR})`);
});
