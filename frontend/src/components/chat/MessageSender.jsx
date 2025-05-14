import React from "react";

function MessageSender({ name = "Unknown", isAI = false }) {
  const containerClass = `flex items-center mb-1 ${
    isAI ? "justify-start" : "justify-end"
  }`;

  const badgeClass = `text-sm font-medium px-2 py-0.5 rounded-md ${
    isAI
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
  }`;

  return (
    <div className={containerClass}>
      <div className={badgeClass}>{name}</div>
    </div>
  );
}

export default React.memo(MessageSender);
