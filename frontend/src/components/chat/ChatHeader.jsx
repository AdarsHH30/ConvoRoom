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
    <div className="p-3 bg-[var(--primary)] rounded-t-lg flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="flex flex-col relative">
          <h2
            className="text-lg font-bold text-[var(--background)] cursor-pointer flex items-center"
            onClick={() => setShowRecentRooms(!showRecentRooms)}
          >
            <img
              src="/vite.svg"
              alt="Convoroom logo"
              className="w-5 h-5 mr-2"
            />
            ConvoRoom{" "}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isConnected
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        {username && (
          <div className="text-xs px-2 py-1 rounded-full border border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-400 flex items-center gap-1">
            <span className="font-medium">You:</span> {username}
          </div>
        )}
      </div>
    </div>
  );
}
