import { useState, useEffect } from "react";
import { CirclePlus, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const QuickCreateRoom = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Add keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        if (!isCreating) {
          handleQuickCreate();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCreating]);

  const handleQuickCreate = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Generate temporary room ID for instant navigation
      const tempRoomId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

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
      console.error("Quick room creation failed:", error);
      // Navigate back to home if creation failed
      navigate("/");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleQuickCreate}
      disabled={isCreating}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
      title="Quick Create Room (Ctrl+K)"
    >
      {isCreating ? (
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
      ) : (
        <>
          <Zap className="w-6 h-6" />
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Quick Create Room
            <div className="text-xs text-gray-300 mt-1">Ctrl+K</div>
          </div>
        </>
      )}
    </button>
  );
};

export default QuickCreateRoom;
