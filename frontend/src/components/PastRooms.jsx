import { useState, useEffect } from "react";
import { History, X, CirclePlus, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PastRooms({ showActionButtons = false }) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [userRooms, setUserRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserRooms = () => {
      try {
        const storedRooms = localStorage.getItem("userRooms");

        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms);

          const validRooms = parsedRooms.filter((room) => {
            if (!room || !room.id) {
              return false;
            }
            return true;
          });

          validRooms.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          setUserRooms(validRooms);
        }
      } catch (_error) {
        //console.error("Error loading user rooms:", _error);
      }
    };

    loadUserRooms();
  }, []);

  const navigateToRoom = (roomIdToNavigate) => {
    navigate(`/room/${roomIdToNavigate}`);
  };

  const handleCreateRoom = () => {
    navigate("/");
  };

  const handleJoinRoom = () => {
    navigate("/?tab=joinroom");
  };

  return (
    <>
      {/* Toggle button */}
      {!isSidePanelOpen && (
        <div className="fixed top-4 sm:top-6 left-4 sm:left-6 z-30 group">
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className="p-3 sm:p-4 backdrop-blur-sm rounded-full hover:bg-green-900/30 transition-all duration-300 shadow-lg  border-green-800/20 hover:border-green-600/40"
            aria-label="Toggle history panel"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="icon-xl-heavy"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.85719 3L13.5 3C14.0523 3 14.5 3.44772 14.5 4C14.5 4.55229 14.0523 5 13.5 5H11.5V19H15.1C16.2366 19 17.0289 18.9992 17.6458 18.9488C18.2509 18.8994 18.5986 18.8072 18.862 18.673C19.4265 18.3854 19.8854 17.9265 20.173 17.362C20.3072 17.0986 20.3994 16.7509 20.4488 16.1458C20.4992 15.5289 20.5 14.7366 20.5 13.6V11.5C20.5 10.9477 20.9477 10.5 21.5 10.5C22.0523 10.5 22.5 10.9477 22.5 11.5V13.6428C22.5 14.7266 22.5 15.6008 22.4422 16.3086C22.3826 17.0375 22.2568 17.6777 21.955 18.27C21.4757 19.2108 20.7108 19.9757 19.77 20.455C19.1777 20.7568 18.5375 20.8826 17.8086 20.9422C17.1008 21 16.2266 21 15.1428 21H8.85717C7.77339 21 6.89925 21 6.19138 20.9422C5.46253 20.8826 4.82234 20.7568 4.23005 20.455C3.28924 19.9757 2.52433 19.2108 2.04497 18.27C1.74318 17.6777 1.61737 17.0375 1.55782 16.3086C1.49998 15.6007 1.49999 14.7266 1.5 13.6428V10.3572C1.49999 9.27341 1.49998 8.39926 1.55782 7.69138C1.61737 6.96253 1.74318 6.32234 2.04497 5.73005C2.52433 4.78924 3.28924 4.02433 4.23005 3.54497C4.82234 3.24318 5.46253 3.11737 6.19138 3.05782C6.89926 2.99998 7.77341 2.99999 8.85719 3ZM9.5 19V5H8.9C7.76339 5 6.97108 5.00078 6.35424 5.05118C5.74907 5.10062 5.40138 5.19279 5.13803 5.32698C4.57354 5.6146 4.1146 6.07354 3.82698 6.63803C3.69279 6.90138 3.60062 7.24907 3.55118 7.85424C3.50078 8.47108 3.5 9.26339 3.5 10.4V13.6C3.5 14.7366 3.50078 15.5289 3.55118 16.1458C3.60062 16.7509 3.69279 17.0986 3.82698 17.362C4.1146 17.9265 4.57354 18.3854 5.13803 18.673C5.40138 18.8072 5.74907 18.8994 6.35424 18.9488C6.97108 18.9992 7.76339 19 8.9 19H9.5ZM5 8.5C5 7.94772 5.44772 7.5 6 7.5H7C7.55229 7.5 8 7.94772 8 8.5C8 9.05229 7.55229 9.5 7 9.5H6C5.44772 9.5 5 9.05229 5 8.5ZM5 12C5 11.4477 5.44772 11 6 11H7C7.55229 11 8 11.4477 8 12C8 12.5523 7.55229 13 7 13H6C5.44772 13 5 12.5523 5 12Z"
                fill="currentColor"
              ></path>
              <circle cx="20" cy="5" r="4" fill="#0285FF"></circle>
            </svg>
          </button>

          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-black/90 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap shadow-lg border border-green-800/30">
            Recent Rooms
          </div>
        </div>
      )}

      {/* Side panel */}
      <div
        className={`fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-gradient-to-b from-[#0a0a0a]/98 via-[#0f0f0f]/98 to-[#1a1a1a]/98 backdrop-blur-xl z-20 transition-all duration-500 ease-out overflow-y-auto shadow-2xl ${
          isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="text-white font-medium text-2xl sm:text-2xl flex items-center gap-3 hover:text-green-300 transition-colors duration-200 cursor-pointer"
            >
              <History size={28} className="text-green-400" />
              Recent Rooms
            </button>
            <button
              onClick={() => setIsSidePanelOpen(false)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action buttons - only show if showActionButtons is true */}
          {showActionButtons && (
            <div className="mb-6 flex flex-col gap-3">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-green-800 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CirclePlus className="w-4 h-4" />
                Create Room
              </button>

              <button
                onClick={handleJoinRoom}
                className="w-full bg-transparent text-green-500 border border-green-600 hover:bg-green-600/20 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <UsersRound className="w-4 h-4" />
                Join Room
              </button>
            </div>
          )}

          {userRooms && userRooms.length > 0 ? (
            <div className="space-y-3">
              {userRooms.map((room, index) => (
                <div
                  key={room.id}
                  onClick={() => navigateToRoom(room.id)}
                  className="group relative p-4 rounded-xl cursor-pointer bg-black/30 hover:bg-green-900/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border border-green-800/20 hover:border-green-600/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 group-hover:bg-green-300 transition-colors"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm sm:text-base truncate">
                        {room.id}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Room #{index + 1}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-400"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-800/30 flex items-center justify-center mb-4">
                <History size={24} className="text-green-600" />
              </div>
              <h4 className="text-white font-medium text-lg mb-2">
                No rooms yet
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
                Create or join a room to see your conversation history here
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
