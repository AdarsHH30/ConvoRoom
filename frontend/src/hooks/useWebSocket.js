import { useRef, useEffect, useCallback, useState } from 'react';

export const useWebSocket = (wsUrl, username, roomId, onMessage, onConnectionChange) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;
  const CONNECTION_TIMEOUT = 10000;

  // Keep refs updated
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectionChangeRef.current = onConnectionChange;
  }, [onMessage, onConnectionChange]);

  const cleanup = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const initializeWebSocket = useCallback(() => {
    if (!username || !roomId || !wsUrl) {
      return;
    }

    cleanup();

    // Close existing connection properly
    if (wsRef.current) {
      const oldWs = wsRef.current;
      wsRef.current = null;
      if (oldWs.readyState === WebSocket.OPEN || oldWs.readyState === WebSocket.CONNECTING) {
        oldWs.close(1000, "Reinitializing");
      }
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
        }
      }, CONNECTION_TIMEOUT);

      ws.onopen = () => {
        cleanup();
        setIsConnected(true);
        setReconnectAttempts(0);
        setConnectionError(null);
        onConnectionChangeRef.current?.(true);
      };

      ws.onmessage = (event) => {
        try {
          if (!event.data || event.data === 'undefined' || event.data.trim() === '') {
            return;
          }
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch {
          // Silently handle parse errors
        }
      };

      ws.onerror = () => {
        cleanup();
        setIsConnected(false);
        setConnectionError("Unable to connect to server. The server may be down or unreachable.");
        onConnectionChangeRef.current?.(false);
      };

      ws.onclose = (event) => {
        cleanup();
        setIsConnected(false);
        onConnectionChangeRef.current?.(false);

        // Only reconnect for abnormal closures and if we haven't exceeded max attempts
        if (event.code !== 1000 && event.code !== 1001) {
          setReconnectAttempts((prev) => {
            const newAttempts = prev + 1;
            if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
              setConnectionError("Connection failed after multiple attempts. Please refresh the page.");
            } else {
              setConnectionError("Connection lost. Attempting to reconnect...");
              const delay = RECONNECT_INTERVAL * Math.pow(1.5, prev);
              reconnectTimeoutRef.current = setTimeout(() => {
                initializeWebSocket();
              }, delay);
            }
            return newAttempts;
          });
        }
      };
    } catch {
      setConnectionError("Failed to create WebSocket connection.");
    }
  }, [wsUrl, username, roomId, cleanup]);

  // Initialize only once when dependencies actually change
  useEffect(() => {
    if (!username || !roomId || !wsUrl) {
      return;
    }

    // Prevent double initialization in strict mode
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    initializeWebSocket();

    return () => {
      isInitializedRef.current = false;
      cleanup();
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, "Component unmounted");
        }
        wsRef.current = null;
      }
    };
  }, [roomId, username, wsUrl, initializeWebSocket, cleanup]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageString);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, []);

  const manualReconnect = useCallback(() => {
    setReconnectAttempts(0);
    setConnectionError(null);
    isInitializedRef.current = false;
    initializeWebSocket();
    isInitializedRef.current = true;
  }, [initializeWebSocket]);

  return {
    isConnected,
    sendMessage,
    wsRef,
    reconnect: manualReconnect,
    reconnectAttempts,
    isReconnecting: reconnectAttempts > 0 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS,
    connectionError,
    clearError: () => setConnectionError(null)
  };
};