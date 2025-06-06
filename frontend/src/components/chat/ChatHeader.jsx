"use client";
import { useRef, useEffect } from "react";

export function ChatHeader({
  isConnected,
  username,
  _recentRooms,
  showRecentRooms,
  setShowRecentRooms,
  _navigateToRoom,
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
    <div className="p-2 sm:p-4 bg-[var(--primary)] rounded-t-lg">
      {/* Professional username display */}
      <div className="flex items-center justify-center">
        {username && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User avatar/icon */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {username.charAt(0).toUpperCase()}
            </div>

            {/* Username with professional styling */}
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
  );
}
