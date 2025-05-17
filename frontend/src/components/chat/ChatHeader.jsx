"use client";
import React, { useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

export function ChatHeader({
  isConnected,
  username,
  recentRooms,
  showRecentRooms,
  setShowRecentRooms,
  navigateToRoom,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRecentRooms(false);
      }
    };

    if (showRecentRooms) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRecentRooms, setShowRecentRooms]);

  return (
    <div className="p-4 bg-[var(--primary)] rounded-t-lg flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col relative">
          <h2
            className="text-xl font-bold text-[var(--background)] cursor-pointer flex items-center"
            onClick={() => setShowRecentRooms(!showRecentRooms)}
          >
            <img
              src="/vite.svg"
              alt="Convoroom logo"
              className="w-6 h-6 mr-2"
            />
            ConvoRoom{" "}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span
            className={`text-sm px-3 py-1.5 rounded-full ${
              isConnected
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        {username && (
          <div className="text-sm px-3 py-1.5 rounded-full border border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-400 flex items-center gap-1">
            <span className="font-medium">You:</span> {username}
          </div>
        )}
      </div>
    </div>
  );
}
