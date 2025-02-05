import React, { useState } from "react";
import "../css/ChatUI.css";
import { Input } from "../components/ui/input";

function ChatUI() {
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
      <div className="chat-footer">
        <Input
          type="text"
          placeholder="Type your message here..."
          className="chat-input"
        />
        <button className="send-button mix-blend-color-dodge">Send</button>
      </div>
    </div>
  );
}
export default ChatUI;
