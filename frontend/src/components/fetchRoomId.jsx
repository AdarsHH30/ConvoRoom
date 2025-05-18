import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const FetchRoomId = () => {
  const [roomId, setRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomId = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.VITE_BACKEND_URL}/api/room/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch room ID");
        }
        const data = await response.json();
        setRoomId(data.roomId);
        setError(null);
      } catch (error) {
        //console.error("Error fetching room ID:", error);
        setError("Failed to generate room ID. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomId();
  }, []);

  const handleCopyInvite = () => {
    if (!roomId) return;

    const inviteLink = `${window.location.origin}/chat/${roomId}`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        //console.error("Failed to copy: ", err);
      });
  };

  const inviteUrl = roomId ? `${window.location.origin}/chat/${roomId}` : "";

  return (
    <Card className="p-4 max-w-md mx-auto shadow-md">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Generating room ID...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 p-2">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Room ID:
            </label>
            <div className="flex items-center">
              <code className="bg-gray-100 px-3 py-2 rounded flex-1 truncate">
                {roomId}
              </code>
              <Button
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                {isCopied ? "Copied!" : "Copy ID"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Invitation Link:
            </label>
            <div className="flex items-center">
              <code className="bg-gray-100 px-3 py-2 rounded flex-1 truncate">
                {inviteUrl}
              </code>
              <Button
                className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleCopyInvite}
              >
                {isCopied ? "Copied!" : "Invite"}
              </Button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button
              onClick={() => window.open(`/chat/${roomId}`, "_blank")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Join Chat Room
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FetchRoomId;
