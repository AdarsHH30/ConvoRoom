"use client";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import { useEffect, useState } from "react";

export function ChatInput({
  inputText,
  setInputText,
  sendMessage,
  isSending,
  isConnected,
  username,
  isEmpty,
}) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    let initialViewportHeight = window.innerHeight;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // Keyboard is visible if viewport height decreased significantly
        const isVisible = heightDifference > 150; // Threshold for keyboard detection
        setIsKeyboardVisible(isVisible);
        setKeyboardHeight(isVisible ? heightDifference : 0);

        // Manage body scroll for mobile
        if (window.innerWidth <= 640) {
          if (isVisible) {
            document.body.classList.add('keyboard-active-body');
          } else {
            document.body.classList.remove('keyboard-active-body');
          }
        }
      }
    };

    const handleWindowResize = () => {
      // Update initial height on orientation change
      if (!isKeyboardVisible) {
        initialViewportHeight = window.innerHeight;
      }
    };

    const handleInputFocus = (e) => {
      if (window.innerWidth <= 640 && e.target.tagName === 'INPUT') {
        // Small delay to ensure keyboard is shown
        setTimeout(() => {
          if (window.visualViewport) {
            // Scroll to keep input visible above keyboard
            const inputRect = e.target.getBoundingClientRect();
            const viewportHeight = window.visualViewport.height;
            const scrollTarget = inputRect.top + window.scrollY - (viewportHeight * 0.3);
            
            window.scrollTo({
              top: Math.max(0, scrollTarget),
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    };

    const handleInputBlur = () => {
      // Reset scroll position and body class when input loses focus
      if (window.innerWidth <= 640) {
        setTimeout(() => {
          document.body.classList.remove('keyboard-active-body');
          if (isKeyboardVisible) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Use visual viewport API when available
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.addEventListener('resize', handleWindowResize);
    }

    // Listen for input focus/blur events
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputBlur);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('resize', handleWindowResize);
      }
      document.removeEventListener('focusin', handleInputFocus);
      document.removeEventListener('focusout', handleInputBlur);
      
      // Clean up body class on unmount
      document.body.classList.remove('keyboard-active-body');
    };
  }, [isKeyboardVisible]);
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
    <div 
      className={`transition-all duration-300 bg-[var(--background)] w-full ${
        isKeyboardVisible 
          ? 'fixed bottom-0 left-0 right-0 pt-2 pb-2 px-1 z-50 border-t' 
          : 'pt-0 pb-0 px-1 sm:p-2 md:p-3'
      }`}
      style={{
        // Adjust position based on keyboard height on mobile
        transform: isKeyboardVisible && window.innerWidth <= 640 
          ? `translateY(-${Math.min(keyboardHeight * 0.1, 20)}px)` 
          : 'none'
      }}
    >
      <div
        className={`flex gap-1.5 sm:gap-2 items-center ${
          isEmpty ? "justify-center" : ""
        }`}
      >
        <PlaceholdersAndVanishInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onKeyDown={handleKeyDown}
          className={`flex-1 rounded-full text-sm px-3 sm:px-4 w-full auto-resize-input transition-all duration-300 ${
            isEmpty ? "max-w-xs sm:max-w-md" : ""
          }`}
          disabled={isSending || !isConnected || !username}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendClick}
          disabled={!inputText.trim() || isSending || !isConnected || !username}
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
      {!isKeyboardVisible && (
        <div className="mt-1 sm:mt-1.5 md:mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      )}
    </div>
  );
}
