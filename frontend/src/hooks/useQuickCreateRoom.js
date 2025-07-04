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
      // Generate room ID in frontend
      const roomId = `${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      console.log("Generated Room ID:", roomId);
      navigate(`/room/${roomId}`);
      const response = await fetch(`${BACKEND_URL}api/create_room/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId })
      });

      const data = await response.json();

      if (data.success) {
        const newRoom = {
          id: roomId,
          timestamp: new Date().toISOString(),
        };

        const existingRooms = JSON.parse(
          localStorage.getItem("userRooms") || "[]"
        );
        localStorage.setItem(
          "userRooms",
          JSON.stringify([newRoom, ...existingRooms])
        );
      } else {
        console.error("Room creation failed:", data.error);
        navigate("/");
      }
    } catch (error) {
      console.error("Room creation failed:", error);
      navigate("/");
    } finally {
      setIsCreating(false);
    }
  };

  return { createRoom, isCreating };
};
