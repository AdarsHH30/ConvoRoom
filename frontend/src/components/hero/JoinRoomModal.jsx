import { motion } from "framer-motion";
import { UsersRound, X } from "lucide-react";
import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function JoinRoomModal({ onCancel, onSuccess }) {
  const [roomId, setRoomId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = () => {
    if (!roomId) {
      setErrorMessage("Please enter a Room ID");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    fetch(`${BACKEND_URL}api/join_room/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          const existingRooms = JSON.parse(
            localStorage.getItem("userRooms") || "[]"
          );

          if (!existingRooms.some((room) => room.id === roomId)) {
            const newRoom = {
              id: roomId,
              timestamp: new Date().toISOString(),
            };
            localStorage.setItem(
              "userRooms",
              JSON.stringify([newRoom, ...existingRooms])
            );
          }

          onSuccess(roomId);
        } else {
          setErrorMessage(
            data.error || "Invalid room ID. Please check and try again."
          );
          setIsLoading(false);
        }
      })
      .catch((_error) => {
        setErrorMessage("Connection error. Please try again.");
        setIsLoading(false);
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleJoinRoom();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative w-full max-w-xs sm:max-w-md mx-auto"
    >
      <div className="bg-black/40 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-green-800/40 shadow-lg">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Join a Room
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-green-800/20 transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
              <UsersRound className="h-4 w-4 sm:h-5 sm:w-5 text-green-600/70" />
            </div>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Room ID"
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg border border-green-800/50 bg-black/50 text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm"
            >
              {errorMessage}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinRoom}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white py-2.5 sm:py-3 rounded-lg shadow-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Joining...
              </>
            ) : (
              <>Enter Room</>
            )}
          </motion.button>

          <p className="text-gray-500 text-xs text-center mt-2 sm:mt-3">
            Don't have a room ID?{" "}
            <button
              onClick={onCancel}
              className="text-green-500 hover:text-green-400"
            >
              Create a new room
            </button>{" "}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
