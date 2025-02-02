import React, { useState } from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { ModeToggle } from "@/components/ModeToggle";
import { Input } from "@/components/ui/input";
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
      <div className="Home flex flex-col">
        <div className="center-container">
          <Button onClick={createRoom} style={{ marginRight: "20px" }}>
            Create Room
          </Button>
          <Button onClick={joinRoom}>Join Room</Button>
        </div>
        <div className="text-field-container">
          {isJoiningRoom ? (
            <div style={{ marginTop: "10px" }}>
              <Input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Home;
