import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const roomId = window.location.pathname.split("/").pop();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${roomId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(`chat_${roomId}`, JSON.stringify(messages));
  }, [messages, roomId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = { type: "user", text: inputText };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch("http://localhost:8000/api/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText, roomId }),
      });

      const data = await response.json();

      const botResponse = { type: "bot", text: data.response || "No response" };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Sorry, I couldn't process your message" },
      ]);
    }

    setInputText("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex-1 bg-[var(--background)] rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b bg-[var(--primary)] rounded-t-lg">
          <h2 className="text-xl font-bold text-[var(--background)]">
            AI Chat
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] break-words p-3 rounded-2xl ${
                  message.type === "user"
                    ? "bg-blue-500 text-white" // User messages (Right Side)
                    : "bg-gray-200 text-black" // AI messages (Left Side)
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
