const WORLD_WIDTH = 40 * 32;
const WORLD_HEIGHT = 30 * 32;

const roomPlayers = new Map();
const roomRevisions = new Map();

const normalizeRoomId = (roomId) =>
  typeof roomId === "string" ? roomId.trim().toLowerCase() : "";

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

const getSocketById = (io, socketId) => io.sockets.sockets.get(socketId);

const isSocketBusy = (socket, peerSocketId = null) => {
  if (!socket) return true;

  return [
    socket.data.activeCallPeerId,
    socket.data.pendingIncomingCallerId,
    socket.data.pendingOutgoingTargetId,
  ]
    .filter(Boolean)
    .some((id) => !peerSocketId || id !== peerSocketId);
};

const clearCallState = (socket) => {
  if (!socket) return;

  socket.data.activeCallPeerId = null;
  socket.data.pendingIncomingCallerId = null;
  socket.data.pendingOutgoingTargetId = null;
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

const getRoomStatePayload = (roomId) => ({
  roomId,
  revision: roomRevisions.get(roomId) || 0,
  players: Array.from(roomPlayers.get(roomId)?.values() || []),
});

const emitRoomState = (io, roomId) => {
  if (!roomId || !roomPlayers.has(roomId)) return;

  roomRevisions.set(roomId, (roomRevisions.get(roomId) || 0) + 1);
  io.to(roomId).emit("room-state", getRoomStatePayload(roomId));
};

const emitRoomStateToSocket = (socket, roomId) => {
  if (!roomId || !roomPlayers.has(roomId)) return;

  socket.emit("room-state", getRoomStatePayload(roomId));
};

const emitJoinedRoomState = (socket, roomId) => {
  if (!roomId || !roomPlayers.has(roomId)) return;

  roomRevisions.set(roomId, (roomRevisions.get(roomId) || 0) + 1);
  const payload = getRoomStatePayload(roomId);

  socket.emit("room-state", payload);
  socket.to(roomId).emit("room-state", payload);
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

const resetPeerRelationship = (socket, peerSocketId) => {
  if (!socket || !peerSocketId) return;

  if (socket.data.activeCallPeerId === peerSocketId) {
    socket.data.activeCallPeerId = null;
  }

  if (socket.data.pendingIncomingCallerId === peerSocketId) {
    socket.data.pendingIncomingCallerId = null;
  }

  if (socket.data.pendingOutgoingTargetId === peerSocketId) {
    socket.data.pendingOutgoingTargetId = null;
  }
};

const notifyPeerCallEnded = (peerSocket, socket, reason) => {
  if (!peerSocket) return;

  peerSocket.emit("call-end", {
    roomId: peerSocket.data.roomId || socket.data.roomId || null,
    fromSocketId: socket.id,
    reason,
  });
};

const cleanupCallState = (io, socket, reason = "hangup") => {
  const peerSocketIds = new Set(
    [
      socket.data.activeCallPeerId,
      socket.data.pendingIncomingCallerId,
      socket.data.pendingOutgoingTargetId,
    ].filter(Boolean)
  );

  peerSocketIds.forEach((peerSocketId) => {
    const peerSocket = getSocketById(io, peerSocketId);
    if (!peerSocket) return;

    resetPeerRelationship(peerSocket, socket.id);
    notifyPeerCallEnded(peerSocket, socket, reason);
  });

  clearCallState(socket);
};

const validateCallParticipants = (io, socket, roomId, targetSocketId) => {
  const normalizedRoomId = normalizeRoomId(roomId || socket.data.roomId);
  const targetSocket = getSocketById(io, targetSocketId);

  if (!normalizedRoomId || !targetSocket || targetSocket.id === socket.id) {
    return { normalizedRoomId, targetSocket: null };
  }

  const sourceRoomId = normalizeRoomId(socket.data.roomId);
  const targetRoomId = normalizeRoomId(targetSocket.data.roomId);
  if (sourceRoomId !== normalizedRoomId || targetRoomId !== normalizedRoomId) {
    return { normalizedRoomId, targetSocket: null };
  }

  return { normalizedRoomId, targetSocket };
};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`[CONNECTED] ${socket.id} connected`);
    clearCallState(socket);
    socket.data.roomId = null;

    // Handle user joining a room
    socket.on('join-room', async (roomId) => {
      const requestedRoomId = roomId;
      if (!requestedRoomId || typeof requestedRoomId !== "string") return;

      const normalizedRoomId = normalizeRoomId(requestedRoomId);
      if (!normalizedRoomId) return;

      if (socket.data.roomId && socket.data.roomId !== normalizedRoomId) {
        cleanupCallState(io, socket, "quit-room");
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

      emitJoinedRoomState(socket, normalizedRoomId);
    });

    socket.on("request-room-state", (roomId) => {
      const normalizedRoomId = normalizeRoomId(roomId || socket.data.roomId);
      if (!normalizedRoomId || socket.data.roomId !== normalizedRoomId) return;
      if (!roomPlayers.has(normalizedRoomId)) return;

      emitRoomStateToSocket(socket, normalizedRoomId);
    });

    // Handle user leaving a room
    socket.on('leave-room', (roomId) => {
      const normalizedRoomId = normalizeRoomId(roomId || socket.data.roomId);
      if (!normalizedRoomId) return;

      cleanupCallState(io, socket, "quit-room");
      removePlayerFromRoom(io, socket, normalizedRoomId);
      if (socket.data.roomId === normalizedRoomId) {
        socket.data.roomId = null;
      }

      console.log(`[ROOM] ${socket.id} left room: ${normalizedRoomId}`);
    });

    socket.on("player-move", (data = {}) => {
      const roomId = normalizeRoomId(data.roomId || socket.data.roomId);
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

    socket.on("call-request", ({ roomId, targetSocketId } = {}) => {
      if (!targetSocketId || typeof targetSocketId !== "string") return;

      const { normalizedRoomId, targetSocket } = validateCallParticipants(
        io,
        socket,
        roomId,
        targetSocketId
      );

      if (!normalizedRoomId || !targetSocket) {
        socket.emit("call-response", {
          roomId: normalizedRoomId || null,
          fromSocketId: targetSocketId,
          accepted: false,
          reason: "unavailable",
        });
        return;
      }

      if (socket.data.activeCallPeerId === targetSocket.id && targetSocket.data.activeCallPeerId === socket.id) {
        socket.emit("call-response", {
          roomId: normalizedRoomId,
          fromSocketId: targetSocket.id,
          accepted: true,
        });
        return;
      }

      if (targetSocket.data.pendingOutgoingTargetId === socket.id) {
        clearCallState(socket);
        clearCallState(targetSocket);

        socket.data.activeCallPeerId = targetSocket.id;
        targetSocket.data.activeCallPeerId = socket.id;

        socket.emit("call-response", {
          roomId: normalizedRoomId,
          fromSocketId: targetSocket.id,
          accepted: true,
        });
        targetSocket.emit("call-response", {
          roomId: normalizedRoomId,
          fromSocketId: socket.id,
          accepted: true,
        });
        return;
      }

      if (isSocketBusy(socket, targetSocket.id) || isSocketBusy(targetSocket, socket.id)) {
        socket.emit("call-response", {
          roomId: normalizedRoomId,
          fromSocketId: targetSocket.id,
          accepted: false,
          reason: "busy",
        });
        return;
      }

      if (socket.data.pendingOutgoingTargetId === targetSocket.id) {
        return;
      }

      socket.data.pendingOutgoingTargetId = targetSocket.id;
      targetSocket.data.pendingIncomingCallerId = socket.id;

      targetSocket.emit("call-request", {
        roomId: normalizedRoomId,
        fromSocketId: socket.id,
      });
    });

    socket.on("call-response", ({ roomId, targetSocketId, accepted, reason } = {}) => {
      if (!targetSocketId || typeof targetSocketId !== "string") return;

      const { normalizedRoomId, targetSocket } = validateCallParticipants(
        io,
        socket,
        roomId,
        targetSocketId
      );

      if (!normalizedRoomId || !targetSocket) return;
      if (socket.data.pendingIncomingCallerId !== targetSocket.id) return;
      if (targetSocket.data.pendingOutgoingTargetId !== socket.id) return;

      if (!accepted) {
        resetPeerRelationship(socket, targetSocket.id);
        resetPeerRelationship(targetSocket, socket.id);

        targetSocket.emit("call-response", {
          roomId: normalizedRoomId,
          fromSocketId: socket.id,
          accepted: false,
          reason: reason || "declined",
        });
        return;
      }

      clearCallState(socket);
      clearCallState(targetSocket);

      socket.data.activeCallPeerId = targetSocket.id;
      targetSocket.data.activeCallPeerId = socket.id;

      socket.emit("call-response", {
        roomId: normalizedRoomId,
        fromSocketId: targetSocket.id,
        accepted: true,
      });
      targetSocket.emit("call-response", {
        roomId: normalizedRoomId,
        fromSocketId: socket.id,
        accepted: true,
      });
    });

    socket.on("webrtc-description", ({ roomId, targetSocketId, description } = {}) => {
      if (!description || !targetSocketId || typeof targetSocketId !== "string") return;

      const { normalizedRoomId, targetSocket } = validateCallParticipants(
        io,
        socket,
        roomId,
        targetSocketId
      );

      if (!normalizedRoomId || !targetSocket) return;
      if (socket.data.activeCallPeerId !== targetSocket.id || targetSocket.data.activeCallPeerId !== socket.id) {
        return;
      }

      targetSocket.emit("webrtc-description", {
        roomId: normalizedRoomId,
        fromSocketId: socket.id,
        description,
      });
    });

    socket.on("webrtc-ice-candidate", ({ roomId, targetSocketId, candidate } = {}) => {
      if (!candidate || !targetSocketId || typeof targetSocketId !== "string") return;

      const { normalizedRoomId, targetSocket } = validateCallParticipants(
        io,
        socket,
        roomId,
        targetSocketId
      );

      if (!normalizedRoomId || !targetSocket) return;
      if (socket.data.activeCallPeerId !== targetSocket.id || targetSocket.data.activeCallPeerId !== socket.id) {
        return;
      }

      targetSocket.emit("webrtc-ice-candidate", {
        roomId: normalizedRoomId,
        fromSocketId: socket.id,
        candidate,
      });
    });

    socket.on("call-end", ({ targetSocketId, reason } = {}) => {
      const peerSocketIds = new Set(
        [targetSocketId, socket.data.activeCallPeerId, socket.data.pendingIncomingCallerId, socket.data.pendingOutgoingTargetId].filter(Boolean)
      );

      peerSocketIds.forEach((peerSocketId) => {
        const peerSocket = getSocketById(io, peerSocketId);
        if (!peerSocket) return;

        resetPeerRelationship(peerSocket, socket.id);
        notifyPeerCallEnded(peerSocket, socket, reason || "hangup");
      });

      clearCallState(socket);
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
      cleanupCallState(io, socket, "disconnect");
      removePlayerFromRoom(io, socket, socket.data.roomId);

      console.log(`[DISCONNECTED] ${socket.id} disconnected`);
    });
  });
};

module.exports = socketHandler;
module.exports.__testing = {
  clearCallState,
  cleanupCallState,
  emitRoomStateToSocket,
  getRoomStatePayload,
  getSpawnPoint,
  isSocketBusy,
  normalizeRoomId,
  resetPeerRelationship,
  validateCallParticipants,
};
