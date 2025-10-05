const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`[CONNECTED] ${socket.id} connected`);

    // Handle user joining a room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`[ROOM] ${socket.id} joined room: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', { userId: socket.id });
    });

    // Handle user leaving a room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`[ROOM] ${socket.id} left room: ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', { userId: socket.id });
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
      console.log(`[DISCONNECTED] ${socket.id} disconnected`);
    });
  });
};

module.exports = socketHandler;
