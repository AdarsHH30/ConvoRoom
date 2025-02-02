// Example React component (e.g., DataSender.js)
import React, { useState } from "react";

function Chat() {
  const [responseMessage, setResponseMessage] = useState("");

  const handleSendData = async () => {
    const data = { name: "John Doe", email: "john@example.com" };

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
    <div>
      <button onClick={handleSendData}>Send Data to Django</button>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}

export default Chat;
