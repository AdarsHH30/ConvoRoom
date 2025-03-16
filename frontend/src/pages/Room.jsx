import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Room.css";
import FetchRoomId from "../components/fetchRoomId";
import ChatUI from "../components/ChatUI";
import { ArrowBigLeft, PersonStanding } from "lucide-react";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

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
      <div className="button-container">
        <button onClick={() => navigate("/")} className="button">
          <ArrowBigLeft size={24} />
        </button>
        <button onClick={handleCopyInvite} className="button">
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <PersonStanding size={15} />
            Invite
          </span>
        </button>
      </div>
      <ChatUI roomId={roomId} />
    </div>
  );
};

export default Room;
