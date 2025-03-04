import express from "express";
import { createServer } from "node:http";
// import { fileURLToPath } from "node:url";
// import { dirname, join } from "node:path";
import { Server, ServerOptions } from "socket.io";
import { setupSocket } from "./socket";

const app = express();
const server = createServer(app);
setupSocket(server as unknown as Partial<ServerOptions>);

// const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.send({ message: "Hello, world!" });
});

server.listen(3002, () => {
  console.log("server running at http://localhost:3002");
});
