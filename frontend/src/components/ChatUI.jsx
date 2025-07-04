"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { flushSync } from "react-dom";
import { getUserIdentity } from "../utils/userIdentification";

// Custom hooks
import { useWebSocket } from "../hooks/useWebSocket";
import { useMessageDeduplication } from "../hooks/useMessageDeduplication";
import { useChatHistory } from "../hooks/useChatHistory";
import { useRecentRooms } from "../hooks/useRecentRooms";
import { createMessageObject } from "../utils/messageUtils";

// Components
import LoadingSpinner from "./chat/LoadingSpinner";
import ToastManager from "./chat/ToastManager";
import MessageSender from "./chat/MessageSender";

// Lazy load components
const ChatHeader = lazy(() =>
  import("./chat/ChatHeader").then((module) => ({ default: module.ChatHeader }))
);
const MessageList = lazy(() =>
  import("./chat/MessageList").then((module) => ({
    default: module.MessageList,
  }))
);
const ChatInput = lazy(() =>
  import("./chat/ChatInput").then((module) => ({ default: module.ChatInput }))
);

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_WS_API = import.meta.env.VITE_WS_API;
const MESSAGE_DEDUPE_WINDOW = 5000;

function ChatUI({ roomId: propRoomId, onConnectionChange }) {
  // State management
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showRecentRooms, setShowRecentRooms] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [username, setUsername] = useState("");

  // Refs
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const messageSenderRef = useRef(null);

  // Memoized values
  const roomId = useMemo(
    () => propRoomId || window.location.pathname.split("/").pop(),
    [propRoomId]
  );

  const wsUrl = useMemo(() => {
    let url = VITE_WS_API;
    if (!url.endsWith("/")) url += "/";
    return `${url}ws/room/${roomId}/`;
  }, [roomId]);

  // Custom hooks
  const { checkDuplicate } = useMessageDeduplication();
  const { recentRooms } = useRecentRooms(roomId);
  const { messages, setMessages, isLoadingHistory } = useChatHistory(
    roomId,
    username,
    BACKEND_URL
  );

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type !== "chat_message") return;

        const messageSender = data.username || "Unknown";

        // Skip messages from current user (already handled locally)
        if (messageSender === username) return;

        // Skip AI messages (they're handled by the MessageSender component)
        if (messageSender === "AI") return;

        const messageKey = `${messageSender}-${data.message}`;
        if (checkDuplicate(messageKey)) return;

        const newMessage = createMessageObject(messageSender, data.message);

        setMessages((prev) => {
          const isDuplicate = prev.some(
            (msg) =>
              msg.sender === messageSender &&
              msg.text === data.message &&
              Math.abs(new Date(msg.timestamp).getTime() - Date.now()) <
                MESSAGE_DEDUPE_WINDOW
          );

          if (isDuplicate) return prev;
          return [...prev, newMessage];
        });

        if (!showScrollButton) {
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          });
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    },
    [username, checkDuplicate, setMessages, showScrollButton]
  );

  // WebSocket connection
  const { isConnected, wsRef: hookWsRef } = useWebSocket(
    wsUrl,
    username,
    roomId,
    handleWebSocketMessage,
    onConnectionChange
  );

  // Use the wsRef from the hook
  wsRef.current = hookWsRef.current;

  // Initialize username
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { username: storedUsername } = getUserIdentity();
        setUsername(storedUsername);
      } catch (error) {
        console.error("Error loading user identity:", error);
      }
    };
    initializeUser();
  }, []);

  // Message handlers
  const handleMessageSent = useCallback(
    (message) => {
      setMessages((prev) => [...prev, message]);
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    },
    [setMessages]
  );

  const handleSendError = useCallback(
    (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    },
    [setMessages]
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !isConnected || !username) return;

    const messageText = inputText;

    flushSync(() => {
      setInputText("");
      setIsSending(true);
    });

    try {
      await messageSenderRef.current?.sendMessage(messageText);
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, isConnected, username]);

  // Copy function
  const copyToClipboard = useCallback(async (text) => {
    try {
      const cleanedText = text.replace(/^```[\w]*\n|\n```$/g, "");
      await navigator.clipboard.writeText(cleanedText);
      window.showToast?.("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      window.showToast?.("Failed to copy to clipboard");
    }
  }, []);

  // Navigation helper
  const navigateToRoom = useCallback((id) => {
    window.location.pathname = `/room/${id}`;
  }, []);

  // Memoized props
  const chatHeaderProps = useMemo(
    () => ({
      isConnected,
      username,
      recentRooms,
      showRecentRooms,
      setShowRecentRooms,
      navigateToRoom,
    }),
    [isConnected, username, recentRooms, showRecentRooms, navigateToRoom]
  );

  const messageListProps = useMemo(
    () => ({
      messages,
      isTyping,
      username,
      copyToClipboard,
      showScrollButton,
      setShowScrollButton,
    }),
    [messages, isTyping, username, copyToClipboard, showScrollButton]
  );

  const chatInputProps = useMemo(
    () => ({
      inputText,
      setInputText,
      sendMessage: handleSendMessage,
      isSending,
      isConnected,
      username,
      isEmpty: messages.length === 0,
    }),
    [
      inputText,
      handleSendMessage,
      isSending,
      isConnected,
      username,
      messages.length,
    ]
  );

  if (isLoadingHistory) {
    return <LoadingSpinner text="Loading chat history..." />;
  }

  return (
    <>
      {/* {!isConnected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LoadingSpinner text="Connecting to chat server..." />
        </div>
      )} */}
      <div className="w-full max-w-5xl mx-auto p-1 sm:p-2 md:p-4 h-[calc(100vh-8rem)] sm:h-[90vh] flex flex-col">
        <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col overflow-hidden w-full min-h-0">
          <Suspense fallback={<LoadingSpinner />}>
            <ChatHeader {...chatHeaderProps} />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <MessageList {...messageListProps} />
            <div ref={messagesEndRef} />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <ChatInput {...chatInputProps} />
          </Suspense>
        </div>
      </div>

      <MessageSender
        ref={messageSenderRef}
        backendUrl={BACKEND_URL}
        roomId={roomId}
        username={username}
        wsRef={wsRef}
        onMessageSent={handleMessageSent}
        onTypingChange={setIsTyping}
        onError={handleSendError}
      />

      <ToastManager />
    </>
  );
}

export default ChatUI;
