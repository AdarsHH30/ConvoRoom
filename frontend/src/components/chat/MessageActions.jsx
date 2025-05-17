"use client";
import { useState } from "react";

export function MessageActions({ message, copyToClipboard }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {(showActions || window.innerWidth < 768) && message.sender === "AI" && (
        <div className="absolute -top-8 right-0 flex space-x-2 bg-white dark:bg-zinc-800 p-1 rounded-md shadow-md z-10"></div>
      )}
    </div>
  );
}
