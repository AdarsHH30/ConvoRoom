import React from "react";

function MessageSender({ name, isAI }) {
  return (
    <div
      className={`flex items-center mb-1 ${
        isAI ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`text-sm font-medium px-2 py-0.5 rounded-md 
        ${
          isAI
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        }`}
      >
        {name}
      </div>
    </div>
  );
}

export default MessageSender;
