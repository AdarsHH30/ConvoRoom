import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

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
          `http://127.0.0.1:7680/api/get_chat_history/${roomId}/`
        );
        if (!response.ok) throw new Error("Failed to fetch chat history");

        const data = await response.json();
        console.log("Fetched Messages:", data.messages);

        const formattedMessages = data.messages.map((msg) => ({
          id: `${msg.sender}-${msg.timestamp}`,
          sender: msg.sender,
          text: msg.message,
          timestamp: msg.timestamp,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [roomId]);

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
        },
      ]);
    } catch (error) {
      console.error("WebSocket message parsing error:", error);
    }
  }, []);

  // WebSocket Connection
  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:7680/ws/room/${roomId}/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = handleWebSocketMessage;
    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => ws.close(1000, "Component unmounted");
  }, [roomId, handleWebSocketMessage]);

  // Send Message
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !isConnected) return;
    setIsSending(true);

    const contentId = `User-${inputText}`;
    const messageData = {
      id: `${contentId}-${Date.now()}`,
      sender: "User",
      text: inputText,
      timestamp: new Date().toISOString(),
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

      const response = await fetch("http://127.0.0.1:7680/api/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, roomId }),
      });

      if (!response.ok) throw new Error("API response not OK");

      const { response: aiResponse } = await response.json();
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Scroll to bottom button function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 h-[90vh] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col border overflow-hidden">
        <div className="p-3 border-b bg-[var(--primary)] rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--background)]">
            Chat Room
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

        {/* Chat Messages - Fixed height container with guaranteed scrolling */}
        <div
          ref={chatContainerRef}
          style={{
            height: "calc(90vh - 140px)",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            padding: "12px",
          }}
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
                        ? "bg-green-800 text-white"
                        : "bg-gray-100 text-black"
                    } shadow-sm`}
                  >
                    <p className="break-words text-sm">{message.text}</p>
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

        {/* Floating scroll to bottom button */}
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 bg-blue-500 text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
          aria-label="Scroll to bottom"
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        <div className="p-3 border-t bg-[var(--background)]">
          <div className="flex gap-2 items-center">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 rounded-full text-sm h-10"
              disabled={isSending || !isConnected}
            />
            <Button
              onClick={sendMessage}
              className="px-4 py-2 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              disabled={isSending || !isConnected}
            >
              {isSending ? "..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
