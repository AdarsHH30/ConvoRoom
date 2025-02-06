// Example React component (e.g., DataSender.js)
// import { Input } from "postcss";
import React, { useState } from "react";
// import { useFormState } from "react-dom";
function Chat() {
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
