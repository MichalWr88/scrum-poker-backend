import express from "express";
import http from "http";
import { setupSocket } from "./socket";
import { setRoutes } from "./routes/api";
import { initMongoDB } from "./mongo/mongoProvider";
import { ServerOptions } from "socket.io";

const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes setup
setRoutes(app);

// Socket.IO setup
setupSocket(server as unknown as Partial<ServerOptions>);

const PORT = process.env.PORT || 3002;

async function startServer() {
  try {
    await initMongoDB();
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
