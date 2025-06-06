import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatUI from "../components/chat/ChatUI";
import { Link, ChevronLeft, Copy, Check } from "lucide-react";
const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectionChange = (connected) => {
    setIsConnected(connected);
  };

  const handleCopyInvite = () => {
    if (!roomId) {
      //console.error("No room ID found!");
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
      //console.error("No room ID found!");
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

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex justify-between items-center p-2 sm:p-4 bg-[var(--background)] border-b">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 text-white rounded-lg hover:bg-green-900 transition min-w-0"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Logo in center with online status */}
        <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/vite.svg"
              alt="ConvoRoom logo"
              className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
            />
            <span className="hidden sm:inline text-white font-semibold text-lg">
              ConvoRoom
            </span>
            {/* Online status */}
            <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
              <span
                className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={isConnected ? "Online" : "Offline"}
              ></span>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isConnected ? "text-green-400" : "text-red-400"
                }`}
              >
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={handleCopyLink}
            className="p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 text-white rounded-lg hover:bg-green-900 transition min-w-0"
          >
            {linkCopied ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Link className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <button
            onClick={handleCopyInvite}
            className="p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 text-white rounded-lg hover:bg-green-900 transition min-w-0"
          >
            {inviteCopied ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ChatUI roomId={roomId} onConnectionChange={handleConnectionChange} />
      </div>
    </div>
  );
};

export default Room;
