const fetchChatHistory = async () => {
  try {
    // console.log("Fetching chat history for roomId:", roomId);
    const userRooms = JSON.parse(localStorage.getItem("userRooms") || "[]");
    // console.log("User rooms in localStorage:", userRooms);

    const thisRoom = userRooms.find((room) => room.id === roomId);
    // console.log("Found this room in localStorage:", thisRoom);

    if (thisRoom) {
      const creationTime = new Date(thisRoom.timestamp).getTime();
      const now = new Date().getTime();
      const isNewRoom = now - creationTime < 2000;

      if (isNewRoom) {
        // console.log("Skipping history fetch for new room created within the last 2 seconds");
        return;
      }
    }

    const apiUrl = `${BACKEND_URL}api/get_chat_history/${roomId}/`;
    // console.log("Fetching history from API endpoint:", apiUrl);
    // console.log("Complete API URL:", apiUrl);

    const response = await fetch(apiUrl);
    // console.log("API Response Status:", response.status);

    if (!response.ok) {
      // console.error("Chat history API response not OK:", response.status, response.statusText);
      // console.log("Trying alternate API endpoint format...");
      const altApiUrl = `${BACKEND_URL}api/chat_history/${roomId}/`;
      // console.log("Alternate API URL:", altApiUrl);

      const altResponse = await fetch(altApiUrl);
      // console.log("Alternate API Response Status:", altResponse.status);

      if (!altResponse.ok) {
        // console.error("Alternate API response also failed:", altResponse.status, altResponse.statusText);
        return;
      }

      const altData = await altResponse.json();
      // console.log("Chat history data received from alternate endpoint:", altData);
      processHistoryData(altData);
      return;
    }

    const data = await response.json();
    // console.log("Chat history data received:", data);
    processHistoryData(data);
  } catch (error) {
    // console.error("Error fetching chat history:", error);
  }
};

const processHistoryData = (data) => {
  try {
    // console.log("Processing history data type:", typeof data, Array.isArray(data));

    let formattedMessages = [];

    if (Array.isArray(data)) {
      // console.log("Data is an array, mapping directly");
      formattedMessages = data.map(formatMessage);
    } else if (data && data.messages && Array.isArray(data.messages)) {
      // console.log("Data has messages array property, mapping from data.messages");
      formattedMessages = data.messages.map(formatMessage);
    } else {
      // console.log("Data format not recognized:", data);
      return;
    }

    // console.log("Setting formatted messages:", formattedMessages);
    setMessages(formattedMessages);
  } catch (processError) {
    // console.error("Error processing history data:", processError);
  }
};

const formatMessage = (msg) => {
  // console.log("Formatting message:", msg);
  // console.log("Message properties:", Object.keys(msg));

  const text = msg.text || msg.message || "";
  const sender = msg.sender || "Unknown";

  return {
    id: msg.id || `${sender}-${Date.now()}`,
    sender: sender,
    text: text,
    timestamp: msg.timestamp || new Date().toISOString(),
    isCode: sender === "AI" && text.startsWith("```") && text.endsWith("```"),
    language: sender === "AI" ? extractLanguage(text) : null,
    hasCodeBlocks: sender === "AI" && text.includes("```"),
    parsedContent: sender === "AI" ? parseMessageContent(text) : null,
  };
};
