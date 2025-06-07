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
    <div className="p-2 sm:p-4 bg-[var(--primary)] rounded-t-lg">{/*  */}</div>
  );
}
