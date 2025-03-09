import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const roomId = window.location.pathname.split("/").pop();
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/room/${roomId}/`);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket Message:", data);

      if (data.type === "chat_message") {
        setMessages((prev) => [
          ...prev,
          { text: data.message, sender: data.username },
        ]);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      ws.current.close();
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, sender: "User" };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText, roomId }),
      });

      const responseData = await response.json();
      if (response.ok && responseData.response) {
        const aiMessage = { text: responseData.response, sender: "AI" };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.error("Error fetching AI response:", responseData.error);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b bg-[var(--primary)] rounded-t-lg">
          <h2 className="text-xl font-bold text-[var(--background)]">
            Chat Room
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] break-words p-3 rounded-2xl ${
                  message.sender === "User"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                } shadow-sm`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-[var(--background)]">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={handleSendMessage}
              className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
