import React, { useMemo } from "react";

function MessageSender({ name = "Unknown", isAI = false }) {
  // Get initials for the avatar - take first two letters of the name
  const getInitials = (name) => {
    if (!name || name === "Unknown") return "U";

    // Remove any non-word characters and get first 2 characters
    return name
      .replace(/[^\w\s]/gi, "")
      .trim()
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate a deterministic color based on the username
  const getUserColor = useMemo(() => {
    if (isAI) return null;

    // Simple hash function to generate a number from a string
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    // Use a set of predefined professional colors
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-red-600",
      "bg-indigo-600",
      "bg-pink-600",
      "bg-purple-600",
      "bg-teal-600",
      "bg-orange-600",
      "bg-cyan-600",
    ];

    const colorIndex = hashCode(name) % colors.length;
    return colors[colorIndex];
  }, [name, isAI]);

  const containerClass = `flex items-center mb-1 ${
    isAI ? "justify-start" : "justify-end"
  }`;

  const nameClass = `text-sm font-medium px-2 py-0.5 ${
    isAI ? "ml-2" : "mr-2"
  } ${
    isAI
      ? "text-purple-700 dark:text-purple-300"
      : "text-blue-700 dark:text-blue-300"
  }`;

  const avatarClass = `flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium text-white ${
    isAI
      ? "bg-purple-700 dark:bg-purple-800"
      : getUserColor + " dark:" + getUserColor
  }`;

  return (
    <div className={containerClass}>
      {!isAI && <div className={nameClass}>{name}</div>}
      <div className={avatarClass}>{isAI ? "AI" : getInitials(name)}</div>
      {isAI && <div className={nameClass}>{name}</div>}
    </div>
  );
}

export default React.memo(MessageSender);
