"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_WS_API = import.meta.env.VITE_WS_API;

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg  w-16">
    {[1, 2, 3].map((dot) => (
      <motion.div
        key={dot}
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          delay: dot * 0.1,
        }}
      />
    ))}
  </div>
);

const MessageActions = ({ message, copyToClipboard }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {(showActions || window.innerWidth < 768) && message.sender === "AI" && (
        <div className="absolute -top-8 right-0 flex space-x-2 bg-white dark:bg-zinc-800 p-1 rounded-md shadow-md z-10">
          <button
            className="text-xs p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
            onClick={() => copyToClipboard(message.text)}
            title="Copy message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [showRecentRooms, setShowRecentRooms] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const wsRef = useRef(null);
  const messageTracker = useRef(new Set());
  const roomId = window.location.pathname.split("/").pop();
  const roomName = `Room ${roomId}`;

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
      rooms.unshift({ id: roomId, name: roomName });
      if (rooms.length > 5) {
        rooms.pop();
      }
      localStorage.setItem("recentRooms", JSON.stringify(rooms));
      setRecentRooms(rooms);
    };

    if (roomId) {
      saveRoomToRecent();
    }
  }, [roomId, roomName]);

  const navigateToRoom = (roomId) => {
    window.location.href = `/room/${roomId}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}api/get_chat_history/${roomId}/`
        );
        if (!response.ok) throw new Error("Failed to fetch chat history");

        const data = await response.json();
        console.log("Fetched Messages:", data.messages);

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

  const handleWebSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "chat_message") return;

        const contentId = `${data.username}-${data.message}`;
        if (messageTracker.current.has(contentId)) return;
        messageTracker.current.add(contentId);

        setMessages((prev) => [
          ...prev,
          {
            id: `${contentId}-${Date.now()}`,
            sender: data.username,
            text: data.message,
            timestamp: new Date().toISOString(),
            isCode:
              data.username === "AI" &&
              data.message.startsWith("```") &&
              data.message.endsWith("```"),
            language:
              data.username === "AI" ? extractLanguage(data.message) : null,
            hasCodeBlocks:
              data.username === "AI" && data.message.includes("```"),
            parsedContent:
              data.username === "AI" ? parseMessageContent(data.message) : null,
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
    const ws = new WebSocket(`${VITE_WS_API}ws/room/${roomId}/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => ws.close(1000, "Component unmounted");
  }, [roomId, handleWebSocketMessage]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !isConnected) return;
    setIsSending(true);

    const contentId = `User-${inputText}`;
    const messageData = {
      id: `${contentId}-${Date.now()}`,
      sender: "User",
      text: inputText,
      timestamp: new Date().toISOString(),
      isCode: false,
    };

    if (!messageTracker.current.has(contentId)) {
      messageTracker.current.add(contentId);
      setMessages((prev) => [...prev, messageData]);
      scrollToBottom();
    }

    const messageToSend = inputText;
    setInputText("");

    try {
      wsRef.current?.send(
        JSON.stringify({ type: "chat_message", message: messageToSend, roomId })
      );

      setIsTyping(true);

      const response = await fetch(`${BACKEND_URL}api/data/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, roomId }),
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
      setMessages((prev) => prev.filter((msg) => msg.id !== contentId));
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, isConnected, roomId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (!showScrollButton && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

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
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 1500);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`chat_${roomId}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4 h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col overflow-hidden w-full">
        <div className="p-3 bg-[var(--primary)] rounded-t-lg flex justify-between items-center">
          <div className="flex flex-col relative">
            <h2
              className="text-lg font-bold text-[var(--background)] cursor-pointer"
              onClick={() => setShowRecentRooms(!showRecentRooms)}
            >
              Chat [{roomId}]<span className="ml-2 text-xs opacity-70">↓</span>
            </h2>
            {showRecentRooms && recentRooms.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-10 w-48">
                <ul className="py-1">
                  <li className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                    Recent Rooms
                  </li>
                  {recentRooms.map((room) => (
                    <li
                      key={room.id}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer text-sm flex items-center"
                      onClick={() => navigateToRoom(room.id)}
                    >
                      <span className="w-full truncate">
                        {room.name} (#{room.id})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="text-xs px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              title="Clear chat history"
            >
              Clear
            </button>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isConnected
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-auto p-3 h-[calc(100%-56px)] w-full scrollbar-hide relative"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-gray-400 mb-4">No messages yet</div>
            </div>
          ) : (
            <div className="space-y-3 min-h-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end ${
                    message.sender === "User" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] md:max-w-[80%] p-2.5 rounded-2xl message-bubble ${
                      message.sender === "User"
                        ? "bg-green-800 text-white ml-auto"
                        : "bg-gray-100 text-black dark:bg-zinc-800 dark:text-white mr-auto"
                    } shadow-sm relative`}
                  >
                    <MessageActions
                      message={message}
                      copyToClipboard={copyToClipboard}
                    />

                    {message.sender === "AI" && message.hasCodeBlocks ? (
                      <div>
                        {message.parsedContent.map((part, index) => (
                          <React.Fragment key={index}>
                            {part.type === "text" ? (
                              <pre className="break-words text-sm whitespace-pre-wrap mb-2">
                                {part.content}
                              </pre>
                            ) : (
                              <div className="my-2 relative code-block-container">
                                <div className="absolute top-0 right-0 z-10">
                                  <button
                                    onClick={() =>
                                      copyToClipboard(part.content)
                                    }
                                    className="text-xs p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors code-copy-button"
                                    title="Copy code"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                </div>
                                <CodeBlock
                                  language={part.language || "jsx"}
                                  filename={`${part.language || "jsx"}`}
                                  code={part.content}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : message.isCode ? (
                      <div className="relative code-block-container">
                        <div className="absolute top-0 right-0 z-10">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                message.text.replace(/^```[\w]*\n|\n```$/g, "")
                              )
                            }
                            className="text-xs p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors code-copy-button"
                            title="Copy code"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                        <CodeBlock
                          language={message.language || "jsx"}
                          filename={`${message.language || "jsx"}`}
                          code={message.text.replace(/^```[\w]*\n|\n```$/g, "")}
                        />
                      </div>
                    ) : (
                      <pre className="break-words text-sm whitespace-pre-wrap">
                        {message.text}
                      </pre>
                    )}
                    <span
                      className="text-xs opacity-70 mt-1 inline-block hover:opacity-100 transition-opacity cursor-default message-timestamp"
                      title={new Date(message.timestamp).toLocaleString()}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-end justify-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-2xl">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 md:right-8 bg-gray-800 dark:bg-zinc-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-zinc-600 transition-colors z-10"
            aria-label="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        )}

        <div
          className={`p-3 bg-[var(--background)] w-full ${
            messages.length === 0 ? "mt-auto" : ""
          }`}
        >
          <div
            className={`flex gap-2 items-center ${
              messages.length === 0 ? "justify-center" : ""
            }`}
          >
            <PlaceholdersAndVanishInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSubmit={sendMessage}
              onKeyDown={handleKeyDown}
              className={`flex-1 rounded-full text-sm px-4 w-full auto-resize-input ${
                messages.length === 0 ? "max-w-md" : ""
              }`}
              disabled={isSending || !isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isSending || !isConnected}
              className="h-10 w-10 rounded-full bg-black dark:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
