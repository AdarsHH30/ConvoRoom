import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import FetchRoomId from "../components/fetchRoomId";
import ChatUI from "../components/ChatUI";
import { ArrowBigLeft, PersonStanding } from "lucide-react";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const handleCopyInvite = () => {
    if (!roomId) {
      console.error("No room ID found!");
      return;
    }

    navigator.clipboard
      .writeText(roomId)
      .then(() => alert("Room ID copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-[var(--background)] border-b">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <ArrowBigLeft size={24} />
        </button>
        <button
          onClick={handleCopyInvite}
          className="p-2 flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
        >
          <PersonStanding size={15} />
          Invite
        </button>
      </div>

      {/* Chat UI */}
      <div className="flex-1 flex items-center justify-center">
        <ChatUI roomId={roomId} />
      </div>
    </div>
  );
};

export default Room;
