import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatUI from "../components/chat/ChatUI";
import PastRooms from "../components/PastRooms";
import { Link, ChevronLeft, Copy, Check, User } from "lucide-react";
import { getUserIdentity } from "../utils/userIdentification";
const Room = () => {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [actualRoomId, setActualRoomId] = useState(urlRoomId);

  useEffect(() => {
    const { username } = getUserIdentity();
    setUsername(username);
  }, []);

  // Listen for room ID updates (for optimistic room creation)
  useEffect(() => {
    const handleRoomIdUpdate = (event) => {
      const { newRoomId, tempRoomId } = event.detail;
      if (urlRoomId === tempRoomId) {
        setActualRoomId(newRoomId);
      }
    };

    window.addEventListener("roomIdUpdated", handleRoomIdUpdate);
    return () =>
      window.removeEventListener("roomIdUpdated", handleRoomIdUpdate);
  }, [urlRoomId]);

  // Use the actual room ID (which might be different from URL during optimistic creation)
  const roomId = actualRoomId || urlRoomId;

  useEffect(() => {
    const { username } = getUserIdentity();
    setUsername(username);
  }, []);

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
      {/* Past Rooms Component with action buttons */}
      <PastRooms showActionButtons={true} />

      <div className="flex justify-between items-center p-2 sm:p-4 bg-[var(--background)] border-b">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 text-white rounded-lg hover:bg-green-900 transition min-w-0"
        >
          {/* <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /> */}
        </button>

        {/* Logo in center with online status */}
        <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/vite.svg"
              alt="ConvoRoom logo"
              className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
            />
            <button
              onClick={() => navigate("/")}
              className="hidden sm:inline text-white font-semibold text-lg hover:text-green-400 transition-colors cursor-pointer"
            >
              ConvoRoom
            </button>
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

        <div className="flex gap-1 sm:gap-2 items-center">
          {/* Username display - only visible on desktop */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg mr-2">
            <div className="flex items-center justify-center">
              {username && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col items-start">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Logged in as
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                      {username}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 text-white rounded-lg hover:bg-green-900 transition min-w-0 relative group"
            title="Copy room link"
          >
            {linkCopied ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Link className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              Copy room link
            </span>
          </button>
          <button
            onClick={handleCopyInvite}
            className="p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 text-white rounded-lg hover:bg-green-900 transition min-w-0 relative group"
            title="Copy room ID"
          >
            {inviteCopied ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              Copy room ID
            </span>
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
