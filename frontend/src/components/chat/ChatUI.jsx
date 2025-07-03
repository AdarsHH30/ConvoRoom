"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { flushSync } from "react-dom";
import { getUserIdentity } from "../../utils/userIdentification";
import { BoxesLoader } from "react-awesome-loaders";
// Lazy load components
const ChatHeader = lazy(() =>
  import("./ChatHeader").then((module) => ({ default: module.ChatHeader }))
);
const MessageList = lazy(() =>
  import("./MessageList").then((module) => ({ default: module.MessageList }))
);
const ChatInput = lazy(() =>
  import("./ChatInput").then((module) => ({ default: module.ChatInput }))
);

// Constants
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_WS_API = import.meta.env.VITE_WS_API;
const NEW_ROOM_THRESHOLD = 2000;
const TOAST_DURATION = 1500;
const TOAST_FADE_DURATION = 300;
const MESSAGE_DEDUPE_WINDOW = 5000;
const MESSAGE_CLEANUP_INTERVAL = 10000;

// Memoized utility functions
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

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

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
  const recentMessagesRef = useRef(new Map());
  const cleanupTimerRef = useRef(null);

  // Memoized values
  const roomId = useMemo(
    () => propRoomId || window.location.pathname.split("/").pop(),
    [propRoomId]
  );

  const wsUrl = useMemo(() => {
    let url = VITE_WS_API;
    if (!url.endsWith("/")) {
      url += "/";
    }
    return `${url}ws/room/${roomId}/`;
  }, [roomId]);

  const apiUrl = useMemo(() => {
    return `${BACKEND_URL}${
      BACKEND_URL.endsWith("/") ? "" : "/"
    }api/get_chat_history/${roomId}/`;
  }, [roomId]);

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

  // Load recent rooms with debouncing
  useEffect(() => {
    const loadRecentRooms = () => {
      try {
        const currentRooms = JSON.parse(
          localStorage.getItem("recentRooms") || "[]"
        );
        setRecentRooms(currentRooms.filter((room) => room.id !== roomId));
      } catch (error) {
        console.error("Error loading recent rooms:", error);
        setRecentRooms([]);
      }
    };

    const timeoutId = setTimeout(loadRecentRooms, 100);
    return () => clearTimeout(timeoutId);
  }, [roomId]);

  // Cleanup old message deduplication entries
  useEffect(() => {
    const cleanupOldEntries = () => {
      const now = Date.now();
      for (const [key, timestamp] of recentMessagesRef.current.entries()) {
        if (now - timestamp > MESSAGE_CLEANUP_INTERVAL) {
          recentMessagesRef.current.delete(key);
        }
      }
    };

    cleanupTimerRef.current = setInterval(
      cleanupOldEntries,
      MESSAGE_CLEANUP_INTERVAL
    );
    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, []);

  // Optimized chat history fetch
  const fetchChatHistory = useCallback(async () => {
    if (!roomId || !username || roomId.startsWith("temp_")) {
      return;
    }

    try {
      const userRooms = JSON.parse(localStorage.getItem("userRooms") || "[]");
      const thisRoom = userRooms.find((room) => room.id === roomId);

      if (thisRoom) {
        const creationTime = new Date(thisRoom.timestamp).getTime();
        const now = new Date().getTime();
        const isNewRoom = now - creationTime < NEW_ROOM_THRESHOLD;

        if (isNewRoom) {
          return;
        }
      }

      setIsLoadingHistory(true);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.messages || !Array.isArray(data.messages)) {
        console.warn("Invalid chat history format received");
        return;
      }

      // Batch process messages
      const formattedMessages = data.messages.map((msg) =>
        createMessageObject(msg.sender, msg.message, {
          id: generateMessageId(msg.sender, msg.message),
          timestamp: msg.timestamp,
        })
      );

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [roomId, username, apiUrl]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Optimized WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type !== "chat_message") {
          return;
        }

        const messageSender = data.username || "Unknown";

        if (messageSender === username) {
          return;
        }

        const messageKey = `${messageSender}-${data.message}`;
        const now = Date.now();

        const lastSeenTime = recentMessagesRef.current.get(messageKey);
        if (lastSeenTime && now - lastSeenTime < MESSAGE_DEDUPE_WINDOW) {
          return;
        }

        recentMessagesRef.current.set(messageKey, now);

        const newMessage = createMessageObject(messageSender, data.message);

        setMessages((prev) => {
          // Prevent duplicate messages in state
          const isDuplicate = prev.some(
            (msg) =>
              msg.sender === messageSender &&
              msg.text === data.message &&
              Math.abs(new Date(msg.timestamp).getTime() - now) <
                MESSAGE_DEDUPE_WINDOW
          );

          if (isDuplicate) {
            return prev;
          }

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
    [showScrollButton, username]
  );

  // Optimized WebSocket connection
  useEffect(() => {
    if (!username || !roomId) {
      return;
    }

    const ws = new WebSocket(wsUrl);
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

    const handleClose = () => {
      setIsConnected(false);
      onConnectionChange?.(false);
    };

    ws.addEventListener("open", handleOpen);
    ws.addEventListener("message", handleWebSocketMessage);
    ws.addEventListener("error", handleError);
    ws.addEventListener("close", handleClose);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounted");
      }
    };
  }, [roomId, handleWebSocketMessage, username, wsUrl, onConnectionChange]);

  // Optimized send message function
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !isConnected || !username) {
      return;
    }

    const messageToSend = inputText.trim();
    const userMessage = createMessageObject(username, messageToSend);

    flushSync(() => {
      setInputText("");
      setMessages((prev) => [...prev, userMessage]);
    });

    setIsSending(true);

    // Auto-scroll
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    try {
      setIsTyping(true);

      // Send via WebSocket
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

      // Send to API
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

      if (aiResponse) {
        const aiMessageKey = `AI-${aiResponse}`;
        const now = Date.now();

        const lastAiTime = recentMessagesRef.current.get(aiMessageKey);
        if (!lastAiTime || now - lastAiTime >= MESSAGE_DEDUPE_WINDOW) {
          recentMessagesRef.current.set(aiMessageKey, now);

          const aiMessage = createMessageObject("AI", aiResponse);
          setMessages((prev) => [...prev, aiMessage]);

          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          });
        }
      }
    } catch (error) {
      console.error("Message sending failed:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      showToast("Failed to send message. Please try again.");
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }, [inputText, isSending, isConnected, roomId, username]);

  // Optimized copy function
  const copyToClipboard = useCallback(async (text) => {
    try {
      const cleanedText = text.replace(/^```[\w]*\n|\n```$/g, "");
      await navigator.clipboard.writeText(cleanedText);
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
      messagesEndRef,
    }),
    [messages, isTyping, username, copyToClipboard, showScrollButton]
  );

  const chatInputProps = useMemo(
    () => ({
      inputText,
      setInputText,
      sendMessage,
      isSending,
      isConnected,
      username,
      isEmpty: messages.length === 0,
    }),
    [inputText, sendMessage, isSending, isConnected, username, messages.length]
  );

  // Loading state
  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <BoxesLoader
          boxColor={"#4ade80"}
          shadowColor={"#999999"}
          desktopSize={"150px"}
          mobileSize={"80px"}
          background={"transparent"}
          text="Connecting ..."
          textColor="#4ade80"
        />{" "}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-1 sm:p-2 md:p-4 h-[calc(100vh-8rem)] sm:h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col overflow-hidden w-full min-h-0">
        <Suspense fallback={<LoadingSpinner />}>
          <ChatHeader {...chatHeaderProps} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <MessageList {...messageListProps} />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <ChatInput {...chatInputProps} />
        </Suspense>
      </div>
    </div>
  );
}

export default ChatUI;
