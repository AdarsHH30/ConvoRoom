import React, { useMemo } from "react";

function UserAvatar({ name = "Unknown", isAI = false, provider }) {
  const getInitials = (name) => {
    if (!name || name === "Unknown") return "U";
    return name
      .replace(/[^\w\s]/gi, "")
      .trim()
      .substring(0, 2)
      .toUpperCase();
  };

  const logoSrc = useMemo(() => {
    if (!isAI) return null;
    if (provider === "gemini") return "/logos/gemini.png";
    if (provider === "groq") return "/logos/groq.png";
    return "/vite.svg";
  }, [isAI, provider]);

  const getUserColor = useMemo(() => {
    if (isAI) return null;

    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash);
    };

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
    isAI ? "bg-transparent" : getUserColor + " dark:" + getUserColor
  }`;

  return (
    <div className={containerClass}>
      {!isAI && <div className={nameClass}>{name}</div>}
      <div className={avatarClass}>
        {isAI ? (
          <img
            src={logoSrc}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          getInitials(name)
        )}
      </div>
      {isAI && <div className={nameClass}>{name}</div>}
    </div>
  );
}

export default React.memo(UserAvatar);
