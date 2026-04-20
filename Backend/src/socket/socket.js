import { Server } from "socket.io";

let io;
const userSocketMap = {}; // { userId: socketId }

// ================= INIT SOCKET =================
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.log("❌ No userId provided");
      return;
    }

    console.log("✅ User connected:", userId);

    // ================= STORE USER =================
    userSocketMap[userId] = socket.id;

    // ================= SEND ONLINE USERS =================
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ================= OPTIONAL: JOIN ROOM =================
    socket.join(userId);

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", userId);

      delete userSocketMap[userId];

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

// ================= GET IO INSTANCE =================
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// ================= GET SOCKET ID =================
const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { initSocket, getIO, userSocketMap, getReceiverSocketId };