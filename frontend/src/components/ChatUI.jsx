import React, { useState } from "react";
import "../css/ChatUI.css";
import { Input } from "../components/ui/input";
import { Button } from "./ui/button";

function ChatUI() {
  const [responseMessage, setResponseMessage] = useState("");
  const [data, setData] = useState("");

  const handleSendData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error("Error sending data:", error);
      setResponseMessage("Error sending data");
    }
  };
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Chatbot</h2>
      </div>
      <div className="chat-body">
        <div className="chat-body flex flex-col space-y-4 p-4 overflow-y-auto h-96">
          <div className="Bot-message align-right">
            <p>Hello! How can I help you today?</p>
          </div>
          <div className="User-message align-right">
            I need help with my account
          </div>
        </div>
      </div>
      <div className="chat-footer flex flex-col">
        <Input
          type="text"
          placeholder="Type your message here..."
          className="chat-input"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        {/* <button className="send-button mix-blend-color-dodge">Send</button> */}
        <Button onClick={handleSendData}>Send</Button>
      </div>
    </div>
  );
}
export default ChatUI;
