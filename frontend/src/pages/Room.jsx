import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import FetchRoomId from "../components/fetchRoomId";
import ChatUI from "../components/ChatUI";
import { Boxes } from "../components/ui/background-boxes.jsx";
import { SparklesCore } from "../components/ui/sparkles";
import {
  ArrowBigLeft,
  PersonStanding,
  UserPlus,
  Link,
  ChevronLeft,
} from "lucide-react";
import { SparkleIcon } from "lucide-react";

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
  const handleCopyLink = () => {
    if (!roomId) {
      console.error("No room ID found!");
      return;
    }
    navigator.clipboard
      .writeText(`${window.location.origin}/room/${roomId}`)
      .then(() => alert("Room link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-[var(--background)] border-b">
        <button
          onClick={() => navigate("/")}
          className="p-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={handleCopyLink}
          className="p-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
        >
          <Link />
        </button>
        <button
          onClick={handleCopyInvite}
          className="p-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
        >
          <UserPlus size={20} />
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
