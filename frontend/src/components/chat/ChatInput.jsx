"use client";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";

export function ChatInput({
  inputText,
  setInputText,
  sendMessage,
  isSending,
  isConnected,
  username,
  isEmpty,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        const _messageToSend = inputText;
        setInputText("");
        setTimeout(() => sendMessage(), 0);
      }
    }
  };

  const handleSendClick = () => {
    if (inputText.trim()) {
      setInputText("");
      setTimeout(() => sendMessage(), 0);
    }
  };

  return (
    <div className="p-3 bg-[var(--background)] w-full">
      <div
        className={`flex gap-2 items-center ${isEmpty ? "justify-center" : ""}`}
      >
        <PlaceholdersAndVanishInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onKeyDown={handleKeyDown}
          className={`flex-1 rounded-full text-sm px-4 w-full auto-resize-input ${
            isEmpty ? "max-w-md" : ""
          }`}
          disabled={isSending || !isConnected || !username}
        />
        <button
          onClick={handleSendClick}
          disabled={!inputText.trim() || isSending || !isConnected || !username}
          className="h-10 w-10 rounded-full bg-black dark:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
