"use client";
import { useState } from "react";

function Chat() {
  const [responseMessage, setResponseMessage] = useState("");
  const [data, setData] = useState("");

  const handleSendData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/room/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      setResponseMessage(result.message);
    } catch (_error) {
      //console.error("Error sending data:", _error);
      setResponseMessage("Error sending data");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter the message"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <button onClick={handleSendData}>Send Data to Django</button>

      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default Chat;
