const { Server } = require("socket.io");
let io;

function initSocket(server) {
  const allowedOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("Socket.IO CORS allowed origins:", allowedOrigins);

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
