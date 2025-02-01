import React, { useState } from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { ModeToggle } from "@/components/ModeToggle";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const navigate = useNavigate();
  const createRoom = () => {
    setIsJoiningRoom(false);
    navigate("/room");
  };

  const joinRoom = () => {
    setIsJoiningRoom(true);
  };

  return (
    <>
      <ModeToggle />
      <div className="Home">
        <div className="center-container">
          <Button onClick></Button>
          <button onClick={createRoom} className="create-room-button">
            Create Room
          </button>
          <button onClick={joinRoom} className="join-room-button">
            Join Room
          </button>
        </div>
        <div className="text-field-container">
          {isJoiningRoom ? (
            <input
              type="text"
              placeholder="Enter Room ID"
              className="text-field"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Home;
