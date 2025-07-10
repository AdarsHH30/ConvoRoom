import { useRef, useEffect, useCallback, useState } from 'react';

export const useWebSocket = (wsUrl, username, roomId, onMessage, onConnectionChange) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  const handleOpen = useCallback(() => {
    setIsConnected(true);
    setReconnectAttempts(0);
    onConnectionChange?.(true);
    
    if (wsRef.current?.readyState === WebSocket.OPEN && username && roomId) {
      wsRef.current.send(JSON.stringify({
        type: 'JOIN',
        username,
        roomId
      }));
    }
  }, [onConnectionChange, username, roomId, wsUrl]);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      onMessage?.(event); 
    }
  }, [onMessage]);

  const handleError = useCallback((error) => {
    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  const handleClose = useCallback((event) => {

    setIsConnected(false);
    onConnectionChange?.(false);
    
    if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {      
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        initializeWebSocket();
      }, RECONNECT_INTERVAL);
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
    }
  }, [onConnectionChange, reconnectAttempts]);

  const initializeWebSocket = useCallback(() => {
    if (!username || !roomId || !wsUrl) {
      return;
    }
        
    if (wsRef.current) {
      wsRef.current.removeEventListener("open", handleOpen);
      wsRef.current.removeEventListener("message", handleMessage);
      wsRef.current.removeEventListener("error", handleError);
      wsRef.current.removeEventListener("close", handleClose);
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("error", handleError);
      ws.addEventListener("close", handleClose);
    } catch (error) {
    }
  }, [wsUrl, username, roomId, handleOpen, handleMessage, handleError, handleClose]);

  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.removeEventListener("open", handleOpen);
        wsRef.current.removeEventListener("message", handleMessage);
        wsRef.current.removeEventListener("error", handleError);
        wsRef.current.removeEventListener("close", handleClose);
        
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, "Component unmounted");
        }
      }
    };
  }, [roomId, username, wsUrl, initializeWebSocket, handleOpen, handleMessage, handleError, handleClose]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageString);
        return true;
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        return false;
      }
    } else {
      console.warn(`Cannot send message, WebSocket is in state: ${wsRef.current ? wsRef.current.readyState : 'undefined'}`);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isConnected) 
    
      return;
    
    const pingInterval = setInterval(() => {
      sendMessage({ type: 'PING' });
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, sendMessage]);

  return { 
    isConnected, 
    sendMessage, 
    wsRef,
    reconnect: initializeWebSocket,
    reconnectAttempts,
    isReconnecting: reconnectAttempts > 0
  };
};
