"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const VITE_WS_API = import.meta.env.VITE_WS_API;
function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const wsRef = useRef(null);
  const messageTracker = useRef(new Set());
  const roomId = window.location.pathname.split("/").pop();

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

  const handleWebSocketMessage = useCallback((event) => {
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
        },
      ]);
    } catch (error) {
      console.error("WebSocket message parsing error:", error);
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${VITE_WS_API}ws/room/${roomId}/`);
    https: wsRef.current = ws;

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
    }

    const messageToSend = inputText;
    setInputText("");

    try {
      wsRef.current?.send(
        JSON.stringify({ type: "chat_message", message: messageToSend, roomId })
      );

      const response = await fetch(`${BACKEND_URL}api/data/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, roomId }),
      });

      if (!response.ok) throw new Error("API response not OK");

      const data = await response.json();
      const aiResponse = data?.response;
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
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Message sending failed:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== contentId));
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, isConnected, roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyToClipboard = (text) => {
    const cleanedText = text.replace(/^```[\w]*\n|\n```$/g, "");
    navigator.clipboard.writeText(cleanedText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col border overflow-hidden w-full">
        {/* Header */}
        <div className="p-3 border-b bg-[var(--primary)] rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--background)]">
            Chat [{roomId}]
            <br />
          </h2>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-auto p-3 h-[calc(100%-56px)] w-full"
        >
          <div className="space-y-3 min-h-full">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No messages yet
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end ${
                    message.sender === "User" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-2.5 rounded-2xl ${
                      message.sender === "User"
                        ? "bg-green-800 text-white ml-auto"
                        : message.isCode
                        ? "bg-gray-800 text-white font-mono relative mr-auto"
                        : "bg-gray-100 text-black mr-auto"
                    } shadow-sm`}
                  >
                    {message.isCode ? (
                      <CodeBlock
                        language={message.language || "jsx"}
                        filename={`${message.language || "jsx"}`}
                        code={message.text.replace(/^```[\w]*\n|\n```$/g, "")}
                      />
                    ) : (
                      <pre className="break-words text-sm whitespace-pre-wrap">
                        {message.text}
                      </pre>
                    )}
                    <span className="text-xs opacity-70 mt-1 inline-block">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Field */}
        <div className="p-3 border-t bg-[var(--background)] w-full">
          <div className="flex gap-2 items-center">
            <PlaceholdersAndVanishInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSubmit={sendMessage}
              className="flex-1 rounded-full text-sm h-12 px-4 w-full"
              disabled={isSending || !isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
