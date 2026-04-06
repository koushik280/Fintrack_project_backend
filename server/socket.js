const { Server, Socket } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  //Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication Error"));
    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected :${socket.userId} (${socket.userRole})`);
    socket.join(`user:${socket.userId}`);
    if (socket.userRole === "admin") socket.join("admin-room");
    console.log(`Admin joined room: admin-room`);
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialised");
  return io;
}

module.exports = { initSocket, getIO };
