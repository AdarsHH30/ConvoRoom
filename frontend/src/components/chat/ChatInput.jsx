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
        sendMessage();
      }
    }
  };

  const handleSendClick = () => {
    if (inputText.trim()) {
      sendMessage();
    }
  };

  return (
    <div className="pt-6 pb-6 px-0 sm:p-2 md:p-3 bg-[var(--background)] w-full">
      <div className="flex items-center justify-center w-full px-4">
        <div className="flex items-center gap-2 w-full max-w-2xl">
          <div className="flex-1 relative">
            <PlaceholdersAndVanishInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
              }}
              onKeyDown={handleKeyDown}
              className="rounded-full text-sm px-3 sm:px-4 w-full auto-resize-input"
              style={{ width: "100%" }}
              disabled={isSending || !isConnected || !username}
            />
          </div>
          <button
            onClick={handleSendClick}
            disabled={
              !inputText.trim() || isSending || !isConnected || !username
            }
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black dark:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white sm:w-5 sm:h-5"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-1 sm:mt-1.5 md:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
