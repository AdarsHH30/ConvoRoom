import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FetchRoomId from "../components/fetchRoomId";
import BallTrail from "@/components/ui/ballTrail";
import ChatUI from "../components/chat/ChatUI";
import {
  UserPlus,
  Link,
  ChevronLeft,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";
const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleCopyInvite = () => {
    if (!roomId) {
      console.error("No room ID found!");
      return;
    }

    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const handleCopyLink = () => {
    if (!roomId) {
      console.error("No room ID found!");
      return;
    }
    navigator.clipboard
      .writeText(`${window.location.origin}/room/${roomId}`)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 bg-[var(--background)] border-b">
        <button
          onClick={() => navigate("/")}
          className="p-2 flex items-center gap-2  text-white rounded-lg hover:bg-green-900 transition"
        >
          <ChevronLeft />
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="p-2 flex items-center gap-2  text-white rounded-lg hover:bg-green-900 transition"
          >
            {linkCopied ? <Check /> : <Link />}
          </button>
          <button
            onClick={handleCopyInvite}
            className="p-2 flex items-center gap- text-white rounded-lg hover:bg-green-900 transition"
          >
            {inviteCopied ? <Check /> : <Copy />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ChatUI roomId={roomId} />
      </div>
    </div>
  );
};

export default Room;
