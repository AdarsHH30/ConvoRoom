import React from "react";
import { useParams } from "react-router-dom";
import FetchRoomId from "../components/fetchRoomId";
import ChatUI from "../components/ChatUI";

const Room = () => {
  const { roomId } = useParams();

  const handleCopyInvite = () => {
    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        alert("Room ID copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={handleCopyInvite}
          style={{
            padding: "8px 20px",
            backgroundColor: "#ffffff",
            color: "#333333",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            outline: "none",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#f5f5f5";
            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#ffffff";
            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "translateY(1px)";
          }}
          onMouseUp={(e) => {
            e.target.style.transform = "translateY(0)";
          }}
        >
          Invite
        </button>
      </div>
      <ChatUI roomId={roomId} />
    </div>
  );
};

export default Room;
