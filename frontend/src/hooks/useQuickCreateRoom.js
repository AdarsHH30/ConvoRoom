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
      
      const tempRoomId = Math.random().toString(36).substring(2, 6).toUpperCase();
      navigate(`/room/${tempRoomId}`);

      const newRoom = {
        id: tempRoomId,
        timestamp: new Date().toISOString(),
        temporary: true,
      };

      const existingRooms = JSON.parse(
        localStorage.getItem("userRooms") || "[]"
      );
      localStorage.setItem(
        "userRooms",
        JSON.stringify([newRoom, ...existingRooms])
      );

      fetch(`${BACKEND_URL}api/create_room/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: tempRoomId }), // Optional: use same ID to avoid changing
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success || data.roomId) {
            const actualRoomId = data.roomId || tempRoomId;

            if (actualRoomId !== tempRoomId) {
              window.history.replaceState(null, "", `/room/${actualRoomId}`);

              window.dispatchEvent(
                new CustomEvent("roomIdUpdated", {
                  detail: { newRoomId: actualRoomId, tempRoomId },
                })
              );

              const rooms = JSON.parse(
                localStorage.getItem("userRooms") || "[]"
              );
              const updatedRooms = rooms.map((room) =>
                room.id === tempRoomId
                  ? { ...room, id: actualRoomId, temporary: false }
                  : room
              );
              localStorage.setItem("userRooms", JSON.stringify(updatedRooms));
            }
          }
        })
        .catch((error) => {
          console.error("Room creation API error:", error);
        });
    } catch (error) {
      console.error("Room creation failed:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return { createRoom, isCreating };
};
