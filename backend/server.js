import http from 'node:http';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT || 3000);
const users = new Map();
const rooms = new Map();
const sockets = new Map();

function id(prefix) { return `${prefix}_${crypto.randomUUID().slice(0, 8)}`; }
function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' }); res.end(JSON.stringify(body)); }
function safeUser(user) { return { id: user.id, username: user.username, level: user.level, coins: user.coins, wins: user.wins, kills: user.kills }; }
function roomView(room) { return { code: room.code, privacy: room.privacy, ownerId: room.ownerId, status: room.status, players: room.players.map((player) => ({ ...player, level: users.get(player.id)?.level ?? 0 })) }; }
function findRoom(code) { return rooms.get(String(code || '').toUpperCase()); }
function parseBody(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', (chunk) => { raw += chunk; if (raw.length > 1000000) req.destroy(); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('invalid_json')); } }); req.on('error', reject); }); }
function broadcast(room) { const message = JSON.stringify({ type: 'room:update', room: roomView(room) }); (sockets.get(room.code) || new Set()).forEach((socket) => { if (socket.readyState === 1) socket.send(message); }); }
function makeBots(room) { while (room.players.filter((player) => !player.isBot).length < 2 && room.players.length < 4) room.players.push({ id: id('bot'), username: `AI-${['偵察兵', '狙擊手', '突擊手'][room.players.length % 3]}`, isBot: true }); while (room.players.length < 4) room.players.push({ id: id('bot'), username: `AI-對手${room.players.length}`, isBot: true }); }

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' }); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'qiangzhan-backend', time: new Date().toISOString() });
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await parseBody(req); const username = String(body.username || '').trim().slice(0, 20); if (!username) return json(res, 400, { error: 'username_required' });
      let user = [...users.values()].find((candidate) => candidate.username.toLowerCase() === username.toLowerCase());
      if (!user) { user = { id: id('user'), username, level: 0, coins: 0, wins: 0, kills: 0 }; users.set(user.id, user); }
      return json(res, 200, { user: safeUser(user), isNew: user.level === 0 && user.wins === 0 });
    }
    const playerMatch = url.pathname.match(/^\/api\/players\/([^/]+)$/);
    if (req.method === 'GET' && playerMatch) { const user = users.get(playerMatch[1]); return user ? json(res, 200, { user: safeUser(user) }) : json(res, 404, { error: 'player_not_found' }); }
    if (req.method === 'POST' && url.pathname === '/api/rooms') {
      const body = await parseBody(req); const owner = users.get(body.ownerId); if (!owner) return json(res, 401, { error: 'owner_not_found' });
      const room = { code: `QZ-${Math.floor(1000 + Math.random() * 9000)}`, privacy: body.privacy === 'private' ? 'private' : 'public', ownerId: owner.id, status: 'waiting', players: [{ id: owner.id, username: owner.username, isBot: false }] };
      rooms.set(room.code, room); return json(res, 201, { room: roomView(room) });
    }
    const roomMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)$/);
    if (req.method === 'GET' && roomMatch) { const room = findRoom(roomMatch[1]); return room ? json(res, 200, { room: roomView(room) }) : json(res, 404, { error: 'room_not_found' }); }
    const joinMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/join$/);
    if (req.method === 'POST' && joinMatch) {
      const room = findRoom(joinMatch[1]); const body = await parseBody(req); const user = users.get(body.playerId); if (!room) return json(res, 404, { error: 'room_not_found' }); if (!user) return json(res, 401, { error: 'player_not_found' });
      if (room.status !== 'waiting') return json(res, 409, { error: 'room_already_started' }); if (room.players.length >= 5) return json(res, 409, { error: 'room_full' });
      if (!room.players.some((player) => player.id === user.id)) room.players.push({ id: user.id, username: user.username, isBot: false }); broadcast(room); return json(res, 200, { room: roomView(room) });
    }
    const startMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/start$/);
    if (req.method === 'POST' && startMatch) {
      const room = findRoom(startMatch[1]); if (!room) return json(res, 404, { error: 'room_not_found' }); if (room.status !== 'waiting') return json(res, 409, { error: 'match_already_started' });
      makeBots(room); room.status = 'in_match'; broadcast(room); return json(res, 200, { room: roomView(room), botsAdded: room.players.filter((player) => player.isBot).length });
    }
    const finishMatch = url.pathname.match(/^\/api\/rooms\/([^/]+)\/finish$/);
    if (req.method === 'POST' && finishMatch) {
      const room = findRoom(finishMatch[1]); const body = await parseBody(req); if (!room) return json(res, 404, { error: 'room_not_found' });
      const winner = users.get(body.playerId || room.ownerId); if (winner) { winner.level = Math.max(1, winner.level + 1); winner.wins += 1; winner.coins += 300; }
      room.status = 'finished'; broadcast(room); return json(res, 200, { user: winner ? safeUser(winner) : null, room: roomView(room) });
    }
    return json(res, 404, { error: 'not_found' });
  } catch (error) { return json(res, 400, { error: error.message || 'bad_request' }); }
});

const wsServer = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); if (url.pathname !== '/ws') return socket.destroy();
  wsServer.handleUpgrade(req, socket, head, (client) => { const room = findRoom(url.searchParams.get('room')); if (!room) return client.close(1008, 'room_not_found'); const bucket = sockets.get(room.code) || new Set(); bucket.add(client); sockets.set(room.code, bucket); client.send(JSON.stringify({ type: 'room:update', room: roomView(room) })); client.on('close', () => bucket.delete(client)); });
});

server.listen(port, () => console.log(`槍戰後端啟動：http://localhost:${port}`));
