import React, { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const roomId = window.location.pathname.split("/").pop();
  const wsRef = useRef(null);
  const messageTracker = useRef(new Set());
  const processingMessage = useRef(false);

  useEffect(() => {
    // Create WebSocket connection
    wsRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/room/${roomId}/`);

    wsRef.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket Message:", data);

      if (data.type === "chat_message") {
        // Create a content-based message identifier (ignoring timestamp)
        const contentId = `${data.username}-${data.message}`;

        // Only add the message if we haven't seen this content before
        if (!messageTracker.current.has(contentId)) {
          messageTracker.current.add(contentId);

          // Use a functional update to ensure we're working with the latest state
          setMessages((prevMessages) => {
            // Double-check that we don't already have this message in state
            if (!prevMessages.some((msg) => msg.contentId === contentId)) {
              return [
                ...prevMessages,
                {
                  text: data.message,
                  sender: data.username,
                  id: `${contentId}-${Date.now()}`,
                  contentId,
                },
              ];
            }
            return prevMessages;
          });
        }
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    // Cleanup function to close WebSocket connection
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || processingMessage.current) return;

    processingMessage.current = true;

    const contentId = `User-${inputText}`;

    // Only add the message if we haven't seen it before
    if (!messageTracker.current.has(contentId)) {
      messageTracker.current.add(contentId);
      const userMessage = {
        text: inputText,
        sender: "User",
        id: `${contentId}-${Date.now()}`,
        contentId,
      };

      setMessages((prevMessages) => {
        // Double-check we don't already have this message
        if (!prevMessages.some((msg) => msg.contentId === contentId)) {
          return [...prevMessages, userMessage];
        }
        return prevMessages;
      });
    }

    const currentInputText = inputText;
    setInputText("");

    // Send message through WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          message: currentInputText,
          roomId: roomId,
        })
      );
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInputText, roomId }),
      });

      const responseData = await response.json();
      if (response.ok && responseData.response) {
        const aiContentId = `AI-${responseData.response}`;

        // Only add AI response if we haven't seen it before
        if (!messageTracker.current.has(aiContentId)) {
          messageTracker.current.add(aiContentId);

          setMessages((prevMessages) => {
            // Double-check we don't already have this message
            if (!prevMessages.some((msg) => msg.contentId === aiContentId)) {
              return [
                ...prevMessages,
                {
                  text: responseData.response,
                  sender: "AI",
                  id: `${aiContentId}-${Date.now()}`,
                  contentId: aiContentId,
                },
              ];
            }
            return prevMessages;
          });
        }
      } else {
        console.error("Error fetching AI response:", responseData.error);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      processingMessage.current = false;
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
          {messages.map((message) => (
            <div
              key={message.id}
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
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !processingMessage.current &&
                handleSendMessage()
              }
              className="flex-1 rounded-full"
              disabled={processingMessage.current}
            />
            <Button
              onClick={handleSendMessage}
              className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={processingMessage.current}
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
