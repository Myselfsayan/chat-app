import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

// ================= START SERVER =================

const startServer = async () => {
  try {
    // CONNECT DATABASE
    await connectDB();
    console.log("MongoDB connected");

    // START EXPRESS SERVER
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });

  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();