"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { getUserIdentity } from "../../utils/userIdentification";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_WS_API = import.meta.env.VITE_WS_API;

// Constants
const NEW_ROOM_THRESHOLD = 2000;
const TOAST_DURATION = 1500;
const TOAST_FADE_DURATION = 300;

// Utility functions
const extractLanguage = (messageText) => {
  if (!messageText) return null;
  const match = messageText.match(/^```(\w*)\n/);
  return match ? match[1] : null;
};

const parseMessageContent = (messageText) => {
  if (!messageText || typeof messageText !== "string") {
    return [{ type: "text", content: "" }];
  }

  if (messageText.includes("```")) {
    const parts = messageText.split(/(```[\w]*\n[\s\S]*?\n```)/g);
    return parts
      .map((part) => {
        if (part.startsWith("```")) {
          const langMatch = part.match(/^```(\w*)\n/);
          const codeContent = part.replace(/^```[\w]*\n|\n```$/g, "");
          return {
            type: "code",
            content: codeContent,
            language: langMatch ? langMatch[1] : "plaintext",
          };
        }
        return { type: "text", content: part };
      })
      .filter((part) => part.content.trim() !== "");
  }

  return [{ type: "text", content: messageText }];
};

const generateMessageId = (sender, _content) => {
  return `${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createMessageObject = (sender, text, additionalProps = {}) => {
  const isAI = sender === "AI";
  const hasCodeBlocks = isAI && text.includes("```");

  return {
    id: generateMessageId(sender, text),
    sender,
    text,
    timestamp: new Date().toISOString(),
    isCode: isAI && text.startsWith("```") && text.endsWith("```"),
    language: isAI ? extractLanguage(text) : null,
    hasCodeBlocks,
    parsedContent: isAI ? parseMessageContent(text) : null,
    ...additionalProps,
  };
};

const showToast = (message, duration = TOAST_DURATION) => {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className =
    "fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-md z-50 animate-fade-in";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("animate-fade-out");
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, TOAST_FADE_DURATION);
  }, duration);
};

function ChatUI({ roomId: propRoomId, onConnectionChange }) {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [showRecentRooms, setShowRecentRooms] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const recentMessagesRef = useRef(new Map()); // Track recent messages to prevent duplicates

  // Get room ID from URL or props
  const roomId = propRoomId || window.location.pathname.split("/").pop();

  // Initialize username
  useEffect(() => {
    try {
      const { username: storedUsername } = getUserIdentity();
      setUsername(storedUsername);
    } catch (_error) {
      console.error("Error loading user identity:", _error);
    }
  }, []);

  // Load recent rooms
  useEffect(() => {
    const loadRecentRooms = () => {
      try {
        const currentRooms = JSON.parse(
          localStorage.getItem("recentRooms") || "[]"
        );
        setRecentRooms(currentRooms.filter((room) => room.id !== roomId));
      } catch (_error) {
        console.error("Error loading recent rooms:", _error);
        setRecentRooms([]);
      }
    };

    loadRecentRooms();
  }, [roomId]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!roomId || !username) {
        return;
      }

      try {
        const userRooms = JSON.parse(localStorage.getItem("userRooms") || "[]");
        const thisRoom = userRooms.find((room) => room.id === roomId);

        // Skip history fetch for new rooms
        if (thisRoom) {
          const creationTime = new Date(thisRoom.timestamp).getTime();
          const now = new Date().getTime();
          const isNewRoom = now - creationTime < NEW_ROOM_THRESHOLD;

          if (isNewRoom) {
            return;
          }
        }

        setIsLoadingHistory(true);

        const apiUrl = `${BACKEND_URL}${
          BACKEND_URL.endsWith("/") ? "" : "/"
        }api/get_chat_history/${roomId}/`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data?.messages || !Array.isArray(data.messages)) {
          console.warn("Invalid chat history format received");
          return;
        }

        const formattedMessages = data.messages.map((msg) =>
          createMessageObject(msg.sender, msg.message, {
            id: generateMessageId(msg.sender, msg.message),
            timestamp: msg.timestamp,
          })
        );

        setMessages(formattedMessages);
      } catch (_error) {
        console.error("Error fetching chat history:", _error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [roomId, username]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type !== "chat_message") {
          return;
        }

        const messageSender = data.username || "Unknown";

        // Skip messages from the current user to prevent duplicates
        // (since we already add user messages immediately in sendMessage)
        if (messageSender === username) {
          return;
        }

        const messageKey = `${messageSender}-${data.message}`;
        const now = Date.now();

        // Check if we've seen this exact message recently (within 5 seconds)
        const lastSeenTime = recentMessagesRef.current.get(messageKey);
        if (lastSeenTime && now - lastSeenTime < 5000) {
          return; // Skip duplicate message
        }

        // Record this message
        recentMessagesRef.current.set(messageKey, now);

        // Clean up old entries (older than 10 seconds)
        for (const [key, timestamp] of recentMessagesRef.current.entries()) {
          if (now - timestamp > 10000) {
            recentMessagesRef.current.delete(key);
          }
        }

        const newMessage = createMessageObject(messageSender, data.message);
        setMessages((prev) => [...prev, newMessage]);

        // Auto-scroll if user is at bottom
        if (!showScrollButton) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } catch (_error) {
        console.error("WebSocket message parsing error:", _error);
      }
    },
    [showScrollButton, username]
  );

  // WebSocket connection management
  useEffect(() => {
    if (!username || !roomId) {
      return;
    }

    let wsUrl = VITE_WS_API;
    if (!wsUrl.endsWith("/")) {
      wsUrl += "/";
    }

    const ws = new WebSocket(`${wsUrl}ws/room/${roomId}/`);
    wsRef.current = ws;

    const handleOpen = () => {
      setIsConnected(true);
      onConnectionChange?.(true);
    };

    const handleError = (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
      onConnectionChange?.(false);
    };

    const handleClose = (event) => {
      setIsConnected(false);
      onConnectionChange?.(false);
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleWebSocketMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [roomId, handleWebSocketMessage, username]);

  // Send message function
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !isConnected || !username) {
      return;
    }

    const messageToSend = inputText.trim();

    // Clear input immediately
    flushSync(() => {
      setInputText("");
    });

    setIsSending(true);

    // Add user message to UI - always add, no deduplication for user messages
    const userMessage = createMessageObject(username, messageToSend);

    flushSync(() => {
      setMessages((prev) => [...prev, userMessage]);
    });

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      setIsTyping(true);

      // Send via WebSocket for real-time broadcasting to other users
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "chat_message",
            message: messageToSend,
            roomId,
            username,
          })
        );
      }

      // Send to API for AI response
      const response = await fetch(`${BACKEND_URL}api/data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${username}: ${messageToSend}`,
          roomId,
          username,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      const aiResponse = apiData?.response;

      setIsTyping(false);

      // Add AI response
      if (aiResponse) {
        const aiMessageKey = `AI-${aiResponse}`;
        const now = Date.now();

        // Check if we've seen this AI response recently (within 5 seconds)
        const lastAiTime = recentMessagesRef.current.get(aiMessageKey);
        if (!lastAiTime || now - lastAiTime >= 5000) {
          // Record this AI response
          recentMessagesRef.current.set(aiMessageKey, now);

          const aiMessage = createMessageObject("AI", aiResponse);
          setMessages((prev) => [...prev, aiMessage]);

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    } catch (error) {
      console.error("Message sending failed:", error);

      // Remove user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));

      showToast("Failed to send message. Please try again.");
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }, [inputText, isSending, isConnected, roomId, username]);

  // Copy to clipboard function
  const copyToClipboard = useCallback((text) => {
    try {
      const cleanedText = text.replace(/^```[\w]*\n|\n```$/g, "");
      navigator.clipboard.writeText(cleanedText);
      showToast("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      showToast("Failed to copy to clipboard");
    }
  }, []);

  // Navigation helper
  const navigateToRoom = useCallback((id) => {
    window.location.pathname = `/room/${id}`;
  }, []);

  // Loading state
  if (isLoadingHistory) {
    return (
      <div className="w-full max-w-5xl mx-auto p-2 md:p-4 h-[90vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-1 sm:p-2 md:p-4 h-[calc(100vh-8rem)] sm:h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col overflow-hidden w-full min-h-0">
        <ChatHeader
          isConnected={isConnected}
          username={username}
          recentRooms={recentRooms}
          showRecentRooms={showRecentRooms}
          setShowRecentRooms={setShowRecentRooms}
          navigateToRoom={navigateToRoom}
        />

        <MessageList
          messages={messages}
          isTyping={isTyping}
          username={username}
          copyToClipboard={copyToClipboard}
          showScrollButton={showScrollButton}
          setShowScrollButton={setShowScrollButton}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          isSending={isSending}
          isConnected={isConnected}
          username={username}
          isEmpty={messages.length === 0}
        />
      </div>
    </div>
  );
}

export default ChatUI;
