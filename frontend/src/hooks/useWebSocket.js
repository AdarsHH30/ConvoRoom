import { useRef, useEffect, useCallback, useState } from 'react';

export const useWebSocket = (wsUrl, username, roomId, onMessage, onConnectionChange) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;
  const CONNECTION_TIMEOUT = 10000; // 10 seconds

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

  const handleOpen = useCallback(() => {
    cleanup();
    setIsConnected(true);
    setReconnectAttempts(0);
    onConnectionChange?.(true);
  }, [onConnectionChange, cleanup]);

  const handleMessage = useCallback((event) => {
    try {
      if (!event.data || event.data === 'undefined' || event.data.trim() === '') {
        return;
      }
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (error) {
      // Silently handle parse errors in production
    }
  }, [onMessage]);

  const handleError = useCallback((error) => {
    cleanup();
    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange, cleanup]);

  const handleClose = useCallback((event) => {
    cleanup();
    setIsConnected(false);
    onConnectionChange?.(false);
    
    // Only attempt reconnection for abnormal closures
    if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts); // Exponential backoff
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        initializeWebSocket();
      }, delay);
    }
  }, [onConnectionChange, reconnectAttempts, cleanup]);

  const initializeWebSocket = useCallback(() => {
    if (!username || !roomId || !wsUrl) {
      return;
    }

    cleanup();
        
    if (wsRef.current) {
      wsRef.current.removeEventListener("open", handleOpen);
      wsRef.current.removeEventListener("message", handleMessage);
      wsRef.current.removeEventListener("error", handleError);
      wsRef.current.removeEventListener("close", handleClose);
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          handleClose({ code: 1006 }); // Abnormal closure
        }
      }, CONNECTION_TIMEOUT);

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("error", handleError);
      ws.addEventListener("close", handleClose);
    } catch (error) {
      handleError(error);
    }
  }, [wsUrl, username, roomId, handleOpen, handleMessage, handleError, handleClose, cleanup]);

  useEffect(() => {
    initializeWebSocket();

    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.removeEventListener("open", handleOpen);
        wsRef.current.removeEventListener("message", handleMessage);
        wsRef.current.removeEventListener("error", handleError);
        wsRef.current.removeEventListener("close", handleClose);
        
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, "Component unmounted");
        }
        wsRef.current = null;
      }
    };
  }, [roomId, username, wsUrl, initializeWebSocket, handleOpen, handleMessage, handleError, handleClose, cleanup]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageString);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }, []);

  return { 
    isConnected, 
    sendMessage, 
    wsRef,
    reconnect: initializeWebSocket,
    reconnectAttempts,
    isReconnecting: reconnectAttempts > 0
  };
};