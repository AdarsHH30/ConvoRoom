"use client";
import React, { useRef, useEffect, useState } from "react";
import { MessageDisplay } from "./MessageDisplay";
import { TypingIndicator } from "./TypingIndicator";
import { ChevronUp } from "lucide-react";

export function MessageList({
  messages,
  isTyping,
  username,
  copyToClipboard,
  showScrollButton,
  setShowScrollButton,
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [messages, setShowScrollButton]);

  useEffect(() => {
    if (!showScrollButton && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto p-3 h-[calc(100%-56px)] w-full scrollbar-hide relative"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-gray-400 mb-4">No messages yet</div>
        </div>
      ) : (
        <div className="space-y-3 min-h-full">
          {messages.map((message) => (
            <MessageDisplay
              key={message.id}
              message={message}
              username={username}
              copyToClipboard={copyToClipboard}
            />
          ))}

          {isTyping && (
            <div className="flex items-end justify-start">
              <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-2xl">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-4 md:right-8 bg-gray-800 dark:bg-zinc-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-zinc-600 transition-all z-10"
          aria-label="Scroll to bottom"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
