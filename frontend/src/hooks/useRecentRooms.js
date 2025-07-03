import { useState, useEffect } from 'react';

export const useRecentRooms = (roomId) => {
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    const loadRecentRooms = () => {
      try {
        const currentRooms = JSON.parse(localStorage.getItem("recentRooms") || "[]");
        setRecentRooms(currentRooms.filter((room) => room.id !== roomId));
      } catch (error) {
        console.error("Error loading recent rooms:", error);
        setRecentRooms([]);
      }
    };

    const timeoutId = setTimeout(loadRecentRooms, 100);
    return () => clearTimeout(timeoutId);
  }, [roomId]);

  return { recentRooms };
};
