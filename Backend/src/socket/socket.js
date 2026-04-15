import { Server } from "socket.io";

let io;
const userSocketMap = {}; // { userId: socketId }

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
        origin: "*",
        },
    });

    io.on("connection", (socket) => {

        const userId = socket.handshake.query.userId;
        console.log("User connected:", userId);

        // ================= STORE USER =================
        if (userId) {
        userSocketMap[userId] = socket.id;
        }

        // ================= SEND ONLINE USERS =================
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // ================= DISCONNECT =================
        socket.on("disconnect", () => {
        console.log("User disconnected:", userId);

        if (userId) {
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
};

export { initSocket, io, userSocketMap };