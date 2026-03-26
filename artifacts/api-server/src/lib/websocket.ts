import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "./logger.js";

let wss: WebSocketServer | null = null;
const startTime = Date.now();

export function getUptime(): number {
  return (Date.now() - startTime) / 1000;
}

export function setupWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    logger.info({ ip: req.socket.remoteAddress }, "WebSocket client connected");

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        logger.info({ msg }, "WebSocket message received");
      } catch {
        logger.warn("Invalid WebSocket message received");
      }
    });

    ws.on("close", () => {
      logger.info("WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      logger.error({ err }, "WebSocket error");
    });

    ws.send(JSON.stringify({ type: "connected", message: "AECE WebSocket connected" }));
  });

  logger.info("WebSocket server initialized on /ws");
  return wss;
}

export function broadcast(type: string, data: unknown): void {
  if (!wss) return;
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
