import { Server } from "socket.io";
import model from "../models/user.model.js";

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

  io.on("connection", async(socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.log("❌ No userId provided");
      return;
    }

    console.log("✅ User connected:", userId);
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
    });

    // ================= STORE USER =================
    userSocketMap[userId] = socket.id;

    // ================= SEND ONLINE USERS =================
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // ================= OPTIONAL: JOIN ROOM =================
    socket.join(userId);

    // ================= DISCONNECT =================
    socket.on("disconnect",async() => {
      console.log("❌ User disconnected:", userId);
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });

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