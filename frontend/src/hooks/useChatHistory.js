import { useState, useEffect } from 'react';
import { createMessageObject, generateMessageId } from '../utils/messageUtils';

const NEW_ROOM_THRESHOLD = 2000;

export const useChatHistory = (roomId, username, backendUrl) => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!roomId || !username || roomId.startsWith("temp_")) {
        return;
      }

      try {
        const userRooms = JSON.parse(localStorage.getItem("userRooms") || "[]");
        const thisRoom = userRooms.find((room) => room.id === roomId);

        if (thisRoom) {
          const creationTime = new Date(thisRoom.timestamp).getTime();
          const now = new Date().getTime();
          const isNewRoom = now - creationTime < NEW_ROOM_THRESHOLD;

          if (isNewRoom) return;
        }

        setIsLoadingHistory(true);

        const apiUrl = `${backendUrl}${backendUrl.endsWith("/") ? "" : "/"}api/get_chat_history/${roomId}/`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data?.messages || !Array.isArray(data.messages)) {
          console.warn("Invalid chat history format received");
          return;
        }

        const formattedMessages = data.messages.map((msg) =>
          createMessageObject(msg.sender, msg.message, {
            id: generateMessageId(msg.sender, msg.message),
            timestamp: msg.timestamp,
          })
        );

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [roomId, username, backendUrl]);

  return { messages, setMessages, isLoadingHistory };
};
