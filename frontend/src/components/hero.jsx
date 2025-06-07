"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CirclePlus, UsersRound, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PastRooms from "./PastRooms";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Hero() {
  const [roomId, setRoomId] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Check for tab=joinroom URL parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");

    if (tab === "joinroom") {
      setIsJoiningRoom(true);
      // Clean up URL by removing the parameter
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const createRoom = () => {
    setIsLoading(true);
    fetch(`${BACKEND_URL}api/create_room/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.roomId) {
          const newRoom = {
            id: data.roomId,
            timestamp: new Date().toISOString(),
          };

          const existingRooms = JSON.parse(
            localStorage.getItem("userRooms") || "[]"
          );

          localStorage.setItem(
            "userRooms",
            JSON.stringify([newRoom, ...existingRooms])
          );

          navigate(`/room/${data.roomId}`);
        }
      })
      .catch((_error) => {
        //console.error("Error:", _error);
        setErrorMessage("Something went wrong. Please try again.");
        setIsLoading(false);
      });
  };

  const joinRoom = () => {
    setIsJoiningRoom(true);
    setErrorMessage("");
  };

  const cancelJoin = () => {
    setIsJoiningRoom(false);
    setRoomId("");
    setErrorMessage("");
  };

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

          navigate(`/room/${roomId}`);
        } else {
          setErrorMessage(
            data.error || "Invalid room ID. Please check and try again."
          );
          setIsLoading(false);
        }
      })
      .catch((_error) => {
        //console.error("Error:", _error);
        setErrorMessage("Connection error. Please try again.");
        setIsLoading(false);
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleJoinRoom();
    }
  };

  const testLocalStorage = () => {
    try {
      localStorage.setItem("testKey", "testValue");
      const testValue = localStorage.getItem("testKey");

      if (testValue === "testValue") {
        return true;
      } else {
        return false;
      }
    } catch (_error) {
      return false;
    } finally {
      localStorage.removeItem("testKey");
    }
  };

  useEffect(() => {
    testLocalStorage();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center w-full py-2 sm:py-4 md:py-8 px-1 sm:px-2 md:px-4">
      {/* Past Rooms Component */}
      <PastRooms />

      <div className="container mx-auto relative z-10 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-1 sm:px-2 md:px-4"
          >
            <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
              Connecting team with AI
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 block sm:inline">
                ConvoRoom
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 max-w-2xl mx-auto px-1 sm:px-2 md:px-4 leading-relaxed"
          >
            Collaborate with your friends and let AI assist you for your group
            work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 px-1 sm:px-2 md:px-4 max-w-sm sm:max-w-lg mx-auto"
          >
            {isJoiningRoom ? (
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
                      onClick={cancelJoin}
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
                        onClick={cancelJoin}
                        className="text-green-500 hover:text-green-400"
                      >
                        Create a new room
                      </button>{" "}
                      instead.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={createRoom}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-green-800 hover:bg-green-700 text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg shadow-lg text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[140px]"
                >
                  <CirclePlus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
                <Button
                  onClick={joinRoom}
                  className="w-full sm:w-auto bg-transparent text-green-500 border border-green-600 hover:bg-green-600/20 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg shadow-lg text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[140px]"
                  size="lg"
                  variant="outline"
                >
                  <UsersRound className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  Join Room
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
