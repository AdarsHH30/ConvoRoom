import { useRef, useEffect, useCallback, useState } from 'react';

export const useWebSocket = (wsUrl, username, roomId, onMessage, onConnectionChange) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const handleOpen = useCallback(() => {
    setIsConnected(true);
    onConnectionChange?.(true);
  }, [onConnectionChange]);

  const handleError = useCallback((error) => {
    console.error("WebSocket connection error:", error);
    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  const handleClose = useCallback(() => {
    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  useEffect(() => {
    if (!username || !roomId) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", onMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounted");
      }
    };
  }, [roomId, onMessage, username, wsUrl, handleOpen, handleError, handleClose]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { isConnected, sendMessage, wsRef };
};
