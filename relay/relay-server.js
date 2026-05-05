// Alpha Brawl WebSocket relay.
//
// Forwards game messages between two clients in a named room. Stateless apart
// from the in-memory room table; if the process restarts every match drops and
// reconnects. Designed to drop-in replace a PeerJS DataChannel — clients send
// the same {t: ...} JSON they used over WebRTC, the server forwards verbatim.
//
// Control protocol (out-of-band, prefixed __ to never collide with game msgs):
//   client -> server: { t: '__join', code: 'ABC123', role: 'host'|'guest' }
//   server -> client: { t: '__joined', role, peer: bool } (bool = peer present)
//   server -> client: { t: '__peer',   joined: bool }     (peer arrived/left)
//   server -> client: { t: '__error',  reason: '...' }
// Anything else is opaque payload, forwarded to the other party verbatim.

import { WebSocketServer } from 'ws';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';

// Map<roomCode, { host: WebSocket|null, guest: WebSocket|null }>
const rooms = new Map();

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on('connection', (ws, req) => {
  ws.room = null;
  ws.role = null;
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (data, isBinary) => {
    // Peek for control messages. Game messages are JSON too but never have
    // a '__' prefixed t — try-parse, dispatch on shape.
    let msg = null;
    if (!isBinary) {
      try { msg = JSON.parse(data.toString()); } catch (e) { /* binary or malformed: just forward */ }
    }

    if (msg && typeof msg.t === 'string' && msg.t.startsWith('__')) {
      handleControl(ws, msg);
      return;
    }

    // Forward to the other party in the room.
    if (!ws.room) return;
    const room = rooms.get(ws.room);
    if (!room) return;
    const dest = ws.role === 'host' ? room.guest : room.host;
    if (dest && dest.readyState === 1 /* OPEN */) {
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
  if (msg.t !== '__join') return; // unknown control
  const code = String(msg.code || '').toUpperCase().slice(0, 32);
  const role = msg.role === 'host' ? 'host' : 'guest';
  if (!code) {
    return safeSend(ws, { t: '__error', reason: 'missing-code' });
  }
  if (ws.room) {
    return safeSend(ws, { t: '__error', reason: 'already-joined' });
  }

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

  // role === 'guest'
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

// Heartbeat: drop dead connections every 30s. Fly proxies idle WSS for 60s,
// so 30s ping keeps tunnels warm and frees rooms whose tab was closed
// without a clean close handshake.
const HEARTBEAT_MS = 30_000;
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) { try { ws.terminate(); } catch (e) {} return; }
    ws.isAlive = false;
    try { ws.ping(); } catch (e) {}
  });
}, HEARTBEAT_MS);

console.log(`alphafight relay listening on ${HOST}:${PORT}`);
