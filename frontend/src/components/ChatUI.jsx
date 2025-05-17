"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { getUserIdentity } from "../utils/userIdentification";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_WS_API = import.meta.env.VITE_WS_API;

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [showRecentRooms, setShowRecentRooms] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const messageTracker = useRef(new Set());
  const roomId = window.location.pathname.split("/").pop();
  // const roomName = `Room ${roomId}`; // Unused variable

  useEffect(() => {
    const { username: storedUsername } = getUserIdentity();
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const loadRecentRooms = () => {
      const rooms = JSON.parse(localStorage.getItem("recentRooms")) || [];
      setRecentRooms(rooms);
    };

    loadRecentRooms();
  }, []);

  useEffect(() => {
    const saveRoomToRecent = () => {
      let rooms = JSON.parse(localStorage.getItem("recentRooms")) || [];
      rooms = rooms.filter((room) => room.id !== roomId);
      rooms.unshift({ id: roomId, name: `Room ${roomId}` });
      if (rooms.length > 5) {
        rooms.pop();
      }
      localStorage.setItem("recentRooms", JSON.stringify(rooms));
      setRecentRooms(rooms);
    };

    if (roomId) {
      saveRoomToRecent();
    }
  }, [roomId]);

  const navigateToRoom = (roomIdToNavigate) => {
    window.location.href = `/room/${roomIdToNavigate}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const extractLanguage = (text) => {
    if (!text.startsWith("```")) return null;
    const firstLine = text.split("\n")[0];
    return firstLine.slice(3).trim() || null;
  };

  const parseMessageContent = (text) => {
    if (!text) return [{ type: "text", content: "" }];

    const regex = /```([\w]*)\n([\s\S]*?)\n```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      parts.push({
        type: "code",
        language: match[1] || "jsx",
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }];
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}api/get_chat_history/${roomId}/`
        );
        if (!response.ok) throw new Error("Failed to fetch chat history");

        const data = await response.json();

        const formattedMessages = data.messages.map((msg) => ({
          id: `${msg.sender}-${msg.timestamp}`,
          sender: msg.sender,
          text: msg.message,
          timestamp: msg.timestamp,
          isCode:
            msg.sender === "AI" &&
            msg.message.startsWith("```") &&
            msg.message.endsWith("```"),
          language: msg.sender === "AI" ? extractLanguage(msg.message) : null,
          hasCodeBlocks: msg.sender === "AI" && msg.message.includes("```"),
          parsedContent:
            msg.sender === "AI" ? parseMessageContent(msg.message) : null,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [roomId]);

  const handleWebSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "chat_message") return;

        const messageSender = data.username || "Unknown";

        const contentId = `${messageSender}-${data.message}`;
        if (messageTracker.current.has(contentId)) return;
        messageTracker.current.add(contentId);

        setMessages((prev) => [
          ...prev,
          {
            id: `${contentId}-${Date.now()}`,
            sender: messageSender,
            text: data.message,
            timestamp: new Date().toISOString(),
            isCode:
              messageSender === "AI" &&
              data.message.startsWith("```") &&
              data.message.endsWith("```"),
            language:
              messageSender === "AI" ? extractLanguage(data.message) : null,
            hasCodeBlocks:
              messageSender === "AI" && data.message.includes("```"),
            parsedContent:
              messageSender === "AI" ? parseMessageContent(data.message) : null,
          },
        ]);

        if (!showScrollButton) {
          scrollToBottom();
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    },
    [showScrollButton, extractLanguage, parseMessageContent, scrollToBottom]
  );

  useEffect(() => {
    if (!username) return;

    const ws = new WebSocket(`${VITE_WS_API}ws/room/${roomId}/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [roomId, handleWebSocketMessage, username]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !isConnected || !username) return;

    const messageToSend = inputText;

    flushSync(() => {
      setInputText("");
    });

    setIsSending(true);

    const contentId = `${username}-${messageToSend}`;
    const messageData = {
      id: `${contentId}-${Date.now()}`,
      sender: username,
      text: messageToSend,
      timestamp: new Date().toISOString(),
      isCode: false,
    };

    if (!messageTracker.current.has(contentId)) {
      messageTracker.current.add(contentId);
      setMessages((prev) => [...prev, messageData]);
      scrollToBottom();
    }

    try {
      wsRef.current?.send(
        JSON.stringify({
          type: "chat_message",
          message: messageToSend,
          roomId,
          username,
        })
      );

      setIsTyping(true);

      const response = await fetch(`${BACKEND_URL}api/data/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          roomId,
          username,
        }),
      });

      if (!response.ok) throw new Error("API response not OK");

      const data = await response.json();
      const aiResponse = data?.response;

      setIsTyping(false);

      if (aiResponse) {
        const aiContentId = `AI-${aiResponse}`;
        if (!messageTracker.current.has(aiContentId)) {
          messageTracker.current.add(aiContentId);
          setMessages((prev) => [
            ...prev,
            {
              id: `${aiContentId}-${Date.now()}`,
              sender: "AI",
              text: aiResponse,
              timestamp: new Date().toISOString(),
              isCode:
                aiResponse.startsWith("```") && aiResponse.endsWith("```"),
              language: extractLanguage(aiResponse),
              hasCodeBlocks: aiResponse.includes("```"),
              parsedContent: parseMessageContent(aiResponse),
            },
          ]);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Message sending failed:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageData.id));
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  }, [
    inputText,
    isSending,
    isConnected,
    roomId,
    username,
    extractLanguage,
    parseMessageContent,
    scrollToBottom,
  ]);

  const copyToClipboard = (text) => {
    const cleanedText = text.replace(/^```[\w]*\n|\n```$/g, "");
    navigator.clipboard.writeText(cleanedText);

    const toast = document.createElement("div");
    toast.textContent = "Copied to clipboard!";
    toast.className =
      "fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-md z-50 animate-fade-in";
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("animate-fade-out");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4 h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col overflow-hidden w-full">
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
