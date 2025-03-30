"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CirclePlus, UsersRound } from "lucide-react";
import { FloatingPaper } from "@/components/floating-paper";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Hero() {
  const [roomId, setRoomId] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const createRoom = () => {
    fetch(`${BACKEND_URL}api/create_room/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.roomId) {
          navigate(`/room/${data.roomId}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Something went wrong. Please try again.");
      });
  };

  const joinRoom = () => {
    setIsJoiningRoom(true);
  };

  const handleJoinRoom = () => {
    if (!roomId) {
      setErrorMessage("Please enter a Room ID");
      return;
    }
    setErrorMessage("");

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
          navigate(`/room/${roomId}`);
        } else {
          setErrorMessage(data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Something went wrong. Please try again.");
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleJoinRoom();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center w-full py-4 sm:py-8 px-2 sm:px-4">
      {/* <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={6} />
      </div> */}
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-2 sm:px-4"
          >
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
              Connecting team with AI
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-black-600 block sm:inline">
                {" "}
                ConvoRoom
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed"
          >
            Collaborate with your friends and let AI assist you for your group
            work.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-4 max-w-lg mx-auto"
          >
            <Button
              size="lg"
              onClick={createRoom}
              variant="solid"
              className="w-full sm:w-auto bg-green-800 hover:bg-green-900 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg shadow-lg text-sm sm:text-base min-w-[140px]"
            >
              <CirclePlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create Room
            </Button>
            {isJoiningRoom ? (
              <div className="relative w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Room ID"
                  className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 bg-transparent text-white text-sm sm:text-base min-w-[140px]"
                />
                <Button
                  onClick={handleJoinRoom}
                  className="w-full sm:w-auto bg-transparent text-purple-600 border border-purple-600 hover:bg-purple-600/20 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg shadow-lg text-sm sm:text-base min-w-[140px]"
                  size="lg"
                  variant="outline"
                >
                  Join
                </Button>
                {errorMessage && (
                  <p className="absolute text-red-500 left-0 right-0 -bottom-6 text-xs sm:text-sm text-center">
                    {errorMessage}
                  </p>
                )}
              </div>
            ) : (
              <Button
                onClick={joinRoom}
                className="w-full sm:w-auto bg-transparent text-green-800 border border-green-800 hover:bg-green-600/20 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg shadow-lg text-sm sm:text-base min-w-[140px]"
                size="lg"
                variant="outline"
              >
                <UsersRound className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Join Room
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
