import React, { useCallback, forwardRef, useImperativeHandle } from "react";
import { createMessageObject } from "../../utils/messageUtils";

const MessageSender = forwardRef(
  (
    {
      backendUrl,
      roomId,
      username,
      wsRef,
      onMessageSent,
      onTypingChange,
      onError,
    },
    ref
  ) => {
    const sendMessage = useCallback(
      async (messageText) => {
        if (!messageText.trim() || !username) return;

        const messageToSend = messageText.trim();
        const userMessage = createMessageObject(username, messageToSend);

        // Add user message immediately
        onMessageSent(userMessage);

        try {
          onTypingChange(true);

          // Send via WebSocket
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "chat_message",
                message: messageToSend,
                roomId,
                username,
              })
            );
          }

          // Send to API
          const response = await fetch(`${backendUrl}api/data/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: `${username}: ${messageToSend}`,
              roomId,
              username,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `API Error: ${response.status} ${response.statusText}`
            );
          }

          const apiData = await response.json();
          const aiResponse = apiData?.response;

          if (aiResponse) {
            const aiMessage = createMessageObject("AI", aiResponse);
            onMessageSent(aiMessage);
          }
        } catch (error) {
          console.error("Message sending failed:", error);
          onError(userMessage.id);
          window.showToast?.("Failed to send message. Please try again.");
        } finally {
          onTypingChange(false);
        }
      },
      [
        backendUrl,
        roomId,
        username,
        wsRef,
        onMessageSent,
        onTypingChange,
        onError,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        sendMessage,
      }),
      [sendMessage]
    );

    return null; // This is a logic-only component
  }
);

MessageSender.displayName = "MessageSender";

export default MessageSender;
