import dotenv from "dotenv";
import http from "http";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initSocket } from "./socket/socket.js";

    dotenv.config({
    path: "./.env"
    })

    const PORT = process.env.PORT || 8000;

    // ================= START SERVER =================
    const startServer = async () => {
    try {
        //  CONNECT DB
        await connectDB();
        console.log(" MongoDB connected");

        //  CREATE HTTP SERVER
        const server = http.createServer(app);

        //  INIT SOCKET
        initSocket(server);

        //  START SERVER
        server.listen(PORT, () => {
        console.log(` Server running on port: ${PORT}`);
        });

    } catch (error) {
        console.error(" Server start failed:", error.message);
        process.exit(1);
    }
};

startServer();