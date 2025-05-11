"use client";
import React, { useRef, useEffect } from "react";

export function ChatHeader({ 
  isConnected, 
  username, 
  recentRooms, 
  showRecentRooms, 
  setShowRecentRooms, 
  navigateToRoom 
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
      <div className="flex flex-col relative">
        <h2
          className="text-lg font-bold text-[var(--background)] cursor-pointer"
          onClick={() => setShowRecentRooms(!showRecentRooms)}
        >
          ConvoRoom <span className="ml-2 text-xs opacity-70">↓</span>
        </h2>
        {showRecentRooms && recentRooms.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-10 w-48"
          >
            <ul className="py-1">
              <li className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                Recent Rooms
              </li>
              {recentRooms.map((room) => (
                <li
                  key={room.id}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer text-sm flex items-center"
                  onClick={() => navigateToRoom(room.id)}
                >
                  <span className="w-full truncate">
                    {room.name} (#{room.id})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
          <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
            You: {username}
          </div>
        )}
      </div>
    </div>
  );
}