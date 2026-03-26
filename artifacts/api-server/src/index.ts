import http from "http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { setupWebSocket } from "./lib/websocket.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, () => {
  logger.info({ port }, "AECE Server listening with WebSocket support");
});
