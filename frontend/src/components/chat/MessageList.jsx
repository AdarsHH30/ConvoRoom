"use client";
import React, { useRef, useEffect, useState } from "react";
import { MessageDisplay } from "./MessageDisplay";
import { TypingIndicator } from "./TypingIndicator";
import { History, X, MessageSquare, ChevronUp } from "lucide-react";

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
  const [showRecentPanel, setShowRecentPanel] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    // Load recent rooms from localStorage
    const loadRecentRooms = () => {
      try {
        const storedRooms = localStorage.getItem("recentRooms") || "[]";
        const rooms = JSON.parse(storedRooms);
        setRecentRooms(rooms);
      } catch (error) {
        console.error("Error loading recent rooms:", error);
        setRecentRooms([]);
      }
    };

    loadRecentRooms();
  }, []);

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

  const navigateToRoom = (roomId) => {
    window.location.pathname = `/room/${roomId}`;
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
        <>
          {/* Scroll to bottom button */}
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 md:right-8 bg-gray-800 dark:bg-zinc-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-zinc-600 transition-all z-10"
            aria-label="Scroll to bottom"
          >
            <ChevronUp className="h-5 w-5" />
          </button>

          {/* Recent rooms panel button */}
          <button
            onClick={() => setShowRecentPanel(!showRecentPanel)}
            className="fixed bottom-24 right-16 md:right-20 bg-gray-800 dark:bg-zinc-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-zinc-600 transition-all z-10"
            aria-label="Recent rooms"
          >
            <History className="h-5 w-5" />
          </button>

          {/* Recent rooms panel */}
          {showRecentPanel && (
            <div className="fixed bottom-40 right-4 md:right-8 bg-gray-900/95 dark:bg-zinc-800/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl border border-gray-700/50 z-20 w-64 md:w-72">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <History size={16} className="text-gray-400" />
                  Recent Rooms
                </h3>
                <button
                  onClick={() => setShowRecentPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {recentRooms && recentRooms.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => navigateToRoom(room.id)}
                      className="p-2 rounded bg-gray-800/50 dark:bg-zinc-700/50 cursor-pointer hover:bg-gray-700 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2"
                    >
                      <div className="p-1.5 rounded-full bg-gray-700 dark:bg-zinc-600">
                        <MessageSquare size={14} className="text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-200 font-medium truncate">
                          Room #{room.id}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(room.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <MessageSquare size={24} className="text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm">No recent rooms</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
