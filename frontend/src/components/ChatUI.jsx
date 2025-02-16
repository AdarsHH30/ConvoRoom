import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Redo } from "lucide-react";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text: inputText }]);

    try {
      const response = await fetch("http://localhost:8000/api/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputText),
      });
      const data = await response.json();

      setMessages((prev) => [...prev, { type: "bot", text: data.Response }]);
      setInputText("");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Sorry, I couldn't process your message",
        },
      ]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="rounded-lg shadow" style={{ color: "var(--ring)" }}>
        <div className="p-4 border-b">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--primary)" }}
          >
            AI Chat
          </h2>
        </div>

        <div
          className="h-96 overflow-y-auto p-4"
          style={{ color: "var(--ring)" }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.type === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.type === "user"
                    ? "bg-[var(--ring)] "
                    : "bg-[var(--secondary)] text-[var(--primary)]"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatUI;
