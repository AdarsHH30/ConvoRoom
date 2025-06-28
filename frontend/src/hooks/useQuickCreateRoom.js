import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useQuickCreateRoom = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Generate temporary room ID for instant navigation
    const tempRoomId = `${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Navigate immediately
      navigate(`/room/${tempRoomId}`);

      // Create room in background
      const response = await fetch(`${BACKEND_URL}api/create_room/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.roomId) {
        // Update URL with real room ID
        window.history.replaceState(null, "", `/room/${data.roomId}`);

        // Store in localStorage
        const newRoom = {
          id: data.roomId,
          timestamp: new Date().toISOString(),
        };

        const existingRooms = JSON.parse(
          localStorage.getItem("userRooms") || "[]"
        );
        localStorage.setItem(
          "userRooms",
          JSON.stringify([newRoom, ...existingRooms])
        );

        // Notify room component
        window.dispatchEvent(
          new CustomEvent("roomIdUpdated", {
            detail: { newRoomId: data.roomId, tempRoomId },
          })
        );
      }
    } catch (error) {
      console.error("Room creation failed:", error);
      // Navigate back to home if creation failed
      navigate("/");
    } finally {
      setIsCreating(false);
    }
  };

  return { createRoom, isCreating };
};
