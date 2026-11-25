const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = new Map();
const MAX_PLAYERS = 10;

app.use(express.static('public'));
app.get('/health', (_req, res) => res.json({ ok: true, game: 'HULLBREACH' }));

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}
function publicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, ready: !!p.ready }))
  };
}
function broadcastRoom(room) {
  io.to(room.code).emit('room:updated', publicRoom(room));
}
function leaveCurrentRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  socket.leave(code);
  socket.data.roomCode = null;
  if (!room) return;
  room.players = room.players.filter(p => p.id !== socket.id);
  if (!room.players.length) rooms.delete(code);
  else {
    if (room.hostId === socket.id) room.hostId = room.players[0].id;
    broadcastRoom(room);
  }
}

io.on('connection', socket => {
  socket.on('room:create', ({ name, color } = {}, callback = () => {}) => {
    leaveCurrentRoom(socket);
    const code = makeCode();
    const room = { code, hostId: socket.id, players: [{ id: socket.id, name: String(name || 'Nova').slice(0, 10), color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#3e8ef7', ready: false }] };
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    callback({ ok: true, room: publicRoom(room), selfId: socket.id });
    broadcastRoom(room);
  });

  socket.on('room:join', ({ code, name, color } = {}, callback = () => {}) => {
    const roomCode = String(code || '').toUpperCase();
    const room = rooms.get(roomCode);
    if (!room) return callback({ ok: false, error: 'Room not found. Check the code and try again.' });
    if (room.players.length >= MAX_PLAYERS) return callback({ ok: false, error: 'This room is full.' });
    leaveCurrentRoom(socket);
    room.players.push({ id: socket.id, name: String(name || 'Nova').slice(0, 10), color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#3e8ef7', ready: false });
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    callback({ ok: true, room: publicRoom(room), selfId: socket.id });
    broadcastRoom(room);
  });

  socket.on('room:leave', () => leaveCurrentRoom(socket));

  // Relay each player's latest position to the other players in the same room.
  socket.on('player:move', data => {
    const code = socket.data.roomCode;
    if (!code || !rooms.has(code) || !data) return;
    const x = Number(data.x), y = Number(data.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    socket.to(code).emit('player:moved', {
      id: socket.id,
      x: Math.max(0, Math.min(1600, x)),
      y: Math.max(0, Math.min(1200, y)),
      face: data.face === -1 ? -1 : 1,
      moving: !!data.moving,
      walk: Number(data.walk) || 0
    });
  });

  socket.on('disconnect', () => leaveCurrentRoom(socket));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HULLBREACH server running on http://localhost:${PORT}`);
});
