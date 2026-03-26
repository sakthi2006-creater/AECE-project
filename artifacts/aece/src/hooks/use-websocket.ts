import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSystemStatusQueryKey, getGetHistoryQueryKey } from "@workspace/api-client-react";

export function useAppWebSocket() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: number;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[WS] Connected to AECE Stream");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === "system_update") {
            queryClient.setQueryData(getGetSystemStatusQueryKey(), message.data);
          } 
          else if (message.type === "new_decision") {
            // Invalidate history to fetch the newly added decision
            queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey() });
            // Also invalidate system status as stats likely changed
            queryClient.invalidateQueries({ queryKey: getGetSystemStatusQueryKey() });
          }
        } catch (error) {
          console.error("[WS] Failed to parse message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Exponential backoff or simple reconnect
        reconnectTimer = window.setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return { isConnected };
}
