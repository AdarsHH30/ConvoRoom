"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CirclePlus, UsersRound, History, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Hero() {
  const [roomId, setRoomId] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [userRooms, setUserRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserRooms = () => {
      try {
        const storedRooms = localStorage.getItem("userRooms");

        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms);

          const validRooms = parsedRooms.filter((room) => {
            if (!room || !room.id) {
              return false;
            }
            return true;
          });

          validRooms.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          setUserRooms(validRooms);
        }
      } catch (_error) {
        //console.error("Error loading user rooms:", _error);
      }
    };

    loadUserRooms();
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

  const navigateToRoom = (roomIdToNavigate) => {
    navigate(`/room/${roomIdToNavigate}`);
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
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center w-full py-4 sm:py-8 px-2 sm:px-4">
      {!isSidePanelOpen && (
        <div className="fixed top-4 left-4 z-30 group">
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="p-2 rounded-md transition-all duration-300"
            aria-label="Toggle history panel"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
                stroke="white"
                strokeWidth="2"
              />
              <rect x="8" y="4" width="4" height="16" fill="white" />
            </svg>
          </button>

          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Recent Rooms
          </div>
        </div>
      )}

      <div
        className={`fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-[#0a0a0a] to-[#121212] border-r border-green-800/40 z-20 transition-all duration-300 overflow-y-auto shadow-xl scrollbar-hide ${
          isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-green-700 font-semibold text-lg flex items-center gap-2">
              <History size={20} className="text-green-500" />
              Past Rooms
            </h3>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-green-800/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {userRooms && userRooms.length > 0 ? (
            <div className="space-y-2">
              {userRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigateToRoom(room.id)}
                  className="py-3 px-3 rounded-md cursor-pointer hover:bg-zinc-800/70 transition-all text-gray-300 truncate"
                >
                  {room.id}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 mb-3"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="text-gray-400">No rooms history found</p>
              <p className="text-gray-500 text-xs mt-2">
                Create a room to get started
              </p>
            </div>
          )}
        </div>
      </div>

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
            {isJoiningRoom ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md mx-auto"
              >
                <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-green-800/40 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      Join a Room
                    </h3>
                    <button
                      onClick={cancelJoin}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-green-800/20 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UsersRound className="h-5 w-5 text-green-600/70" />
                      </div>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter Room ID"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-green-800/50 bg-black/50 text-white placeholder-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-transparent transition-all duration-200"
                        autoFocus
                      />
                    </div>

                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-md text-sm"
                      >
                        {errorMessage}
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleJoinRoom}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-lg shadow-lg text-base font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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

                    <p className="text-gray-500 text-xs text-center mt-3">
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
                  className="w-full sm:w-auto bg-green-800 hover:bg-green-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg shadow-lg text-sm sm:text-base min-w-[140px]"
                >
                  <CirclePlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {isLoading ? "Creating..." : "Create Room"}
                </Button>
                <Button
                  onClick={joinRoom}
                  className="w-full sm:w-auto bg-transparent text-green-500 border border-green-600 hover:bg-green-600/20 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg shadow-lg text-sm sm:text-base min-w-[140px]"
                  size="lg"
                  variant="outline"
                >
                  <UsersRound className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
