"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { getUserIdentity } from "../../utils/userIdentification";

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
  const roomName = `Room ${roomId}`;

  useEffect(() => {
    const { username: storedUsername } = getUserIdentity();
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const loadRecentRooms = () => {
      const currentRooms =
        JSON.parse(localStorage.getItem("recentRooms")) || [];
      setRecentRooms(currentRooms.filter((room) => room.id !== roomId));
    };
    loadRecentRooms();
  }, [roomId]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}api/chat_history/${roomId}/`
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          isCode:
            msg.sender === "AI" &&
            msg.text.startsWith("```") &&
            msg.text.endsWith("```"),
          language: msg.sender === "AI" ? extractLanguage(msg.text) : null,
          hasCodeBlocks: msg.sender === "AI" && msg.text.includes("```"),
          parsedContent:
            msg.sender === "AI" ? parseMessageContent(msg.text) : null,
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (roomId && username) {
      fetchChatHistory();
    }
  }, [roomId, username]);

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
    [showScrollButton]
  );

  useEffect(() => {
    if (!username) return;

    let wsUrl = VITE_WS_API;
    if (!wsUrl.endsWith("/")) wsUrl += "/";

    const ws = new WebSocket(`${wsUrl}ws/room/${roomId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    };
    ws.onclose = (event) => {
      setIsConnected(false);
    };

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
      hasCodeBlocks: false,
      parsedContent: null,
    };

    if (!messageTracker.current.has(contentId)) {
      messageTracker.current.add(contentId);
      flushSync(() => {
        setMessages((prev) => [...prev, messageData]);
      });
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

      const apiData = await response.json();
      const aiResponse = apiData?.response;

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
  }, [inputText, isSending, isConnected, roomId, username]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const extractLanguage = (messageText) => {
    const match = messageText.match(/^```(\w*)\n/);
    return match ? match[1] : null;
  };

  const parseMessageContent = (messageText) => {
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

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4 h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col overflow-hidden w-full">
        <ChatHeader
          isConnected={isConnected}
          username={username}
          recentRooms={recentRooms}
          showRecentRooms={showRecentRooms}
          setShowRecentRooms={setShowRecentRooms}
          navigateToRoom={(id) => (window.location.pathname = `/room/${id}`)}
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
