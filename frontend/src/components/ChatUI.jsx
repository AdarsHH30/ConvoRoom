import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const messageTracker = useRef(new Set());
  const roomId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/get_chat_history/${roomId}/`
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
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/room/${roomId}/`);
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

      const response = await fetch("http://127.0.0.1:8000/api/data/", {
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

  // Auto-scroll to the latest message
  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b bg-[var(--primary)] rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--background)]">
            Chat Room
          </h2>
          <span
            className={`text-sm ${
              isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end ${
                message.sender === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  message.sender === "User"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                } shadow-sm`}
              >
                <p className="break-words">{message.text}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 border-t bg-[var(--background)]">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 rounded-full"
              disabled={isSending || !isConnected}
            />
            <Button
              onClick={sendMessage}
              className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSending || !isConnected}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
