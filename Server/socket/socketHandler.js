const WORLD_WIDTH = 40 * 32;
const WORLD_HEIGHT = 30 * 32;

const roomPlayers = new Map();
const roomRevisions = new Map();

const getSpawnPoint = (playerCount) => {
  const spawnOffsets = [
    { x: 0, y: 0 },
    { x: 64, y: 0 },
    { x: 0, y: 64 },
    { x: 64, y: 64 },
    { x: -64, y: 0 },
    { x: 0, y: -64 },
  ];
  const baseX = 5 * 32 + 16;
  const baseY = 5 * 32 + 16;
  const offset = spawnOffsets[playerCount % spawnOffsets.length];

  return {
    x: Math.max(32, Math.min(WORLD_WIDTH - 32, baseX + offset.x)),
    y: Math.max(32, Math.min(WORLD_HEIGHT - 32, baseY + offset.y)),
  };
};

const ensureRoom = (roomId) => {
  if (!roomPlayers.has(roomId)) {
    roomPlayers.set(roomId, new Map());
  }

  if (!roomRevisions.has(roomId)) {
    roomRevisions.set(roomId, 0);
  }

  return roomPlayers.get(roomId);
};

const emitRoomState = (io, roomId) => {
  if (!roomId || !roomPlayers.has(roomId)) return;

  roomRevisions.set(roomId, (roomRevisions.get(roomId) || 0) + 1);
  io.to(roomId).emit("room-state", {
    roomId,
    revision: roomRevisions.get(roomId),
    players: Array.from(roomPlayers.get(roomId).values()),
  });
};

const removePlayerFromRoom = (io, socket, roomId) => {
  if (!roomId || !roomPlayers.has(roomId)) return;

  const players = roomPlayers.get(roomId);
  const removed = players.delete(socket.id);

  if (!removed) return;

  socket.leave(roomId);

  if (players.size === 0) {
    roomPlayers.delete(roomId);
    roomRevisions.delete(roomId);
    return;
  }

  emitRoomState(io, roomId);
};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`[CONNECTED] ${socket.id} connected`);

    // Handle user joining a room
    socket.on('join-room', async (roomId) => {
      const requestedRoomId = roomId;
      if (!requestedRoomId || typeof requestedRoomId !== "string") return;

      const normalizedRoomId = requestedRoomId.trim().toLowerCase();
      if (!normalizedRoomId) return;

      if (socket.data.roomId && socket.data.roomId !== normalizedRoomId) {
        removePlayerFromRoom(io, socket, socket.data.roomId);
      }

      const players = ensureRoom(normalizedRoomId);
      const existingPlayer = players.get(socket.id);
      const spawnPoint = existingPlayer || getSpawnPoint(players.size);

      const player = {
        socketId: socket.id,
        x: spawnPoint.x,
        y: spawnPoint.y,
        flipX: false,
      };

      players.set(socket.id, player);
      socket.data.roomId = normalizedRoomId;

      await socket.join(normalizedRoomId);
      console.log(`[ROOM] ${socket.id} joined room: ${normalizedRoomId}`);

      emitRoomState(io, normalizedRoomId);
    });

    // Handle user leaving a room
    socket.on('leave-room', (roomId) => {
      const normalizedRoomId = (roomId || socket.data.roomId || "").trim().toLowerCase();
      if (!normalizedRoomId) return;

      removePlayerFromRoom(io, socket, normalizedRoomId);
      if (socket.data.roomId === normalizedRoomId) {
        socket.data.roomId = null;
      }

      console.log(`[ROOM] ${socket.id} left room: ${normalizedRoomId}`);
    });

    socket.on("player-move", (data = {}) => {
      const roomId = (data.roomId || socket.data.roomId || "").trim().toLowerCase();
      if (!roomId || !roomPlayers.has(roomId)) return;

      const players = roomPlayers.get(roomId);
      const player = players.get(socket.id);
      if (!player) return;

      player.x = Math.max(0, Math.min(WORLD_WIDTH, Number(data.x) || player.x));
      player.y = Math.max(0, Math.min(WORLD_HEIGHT, Number(data.y) || player.y));
      player.flipX = Boolean(data.flipX);

      socket.to(roomId).emit("player-moved", {
        socketId: socket.id,
        x: player.x,
        y: player.y,
        flipX: player.flipX,
      });
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { roomId, message, username } = data;
      
      // Broadcast message to all users in the room
      io.to(roomId).emit('chat-message', {
        userId: socket.id,
        username,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      removePlayerFromRoom(io, socket, socket.data.roomId);

      console.log(`[DISCONNECTED] ${socket.id} disconnected`);
    });
  });
};

module.exports = socketHandler;
