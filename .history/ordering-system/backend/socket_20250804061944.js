const { Server } = require("socket.io");
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      // Use the FRONTEND_URL from your .env file
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      // This is the cruciala setting that allows cookies to be sent
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected with socket ID:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initSocket, getIO };
