let io = null;

/**
 * Initialize the Socket.IO server instance.
 * @param {Server} server - The HTTP server instance.
 */
function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join_notification_room", (userId) => {
      socket.join(userId);
      // Send a confirmation back to the client
      socket.emit("room_joined", userId);
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

/**
 * Get the Socket.IO instance.
 * @returns {Server} The Socket.IO instance.
 */
function getSocket() {
  if (!io) {
    throw new Error(
      "Socket.IO instance is not available. Please initialize it first."
    );
  }
  return io;
}

module.exports = { initSocket, getSocket };
