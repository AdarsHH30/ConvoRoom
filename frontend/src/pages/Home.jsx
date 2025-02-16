import React, { useState } from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { ModeToggle } from "@/components/ModeToggle";
import { Input } from "@/components/ui/input";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Create Room
  const createRoom = () => {
    fetch("http://127.0.0.1:8000/api/create_room/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.roomId) {
          navigate(`/room/${data.roomId}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Something went wrong. Please try again.");
      });
  };

  const joinRoom = () => {
    setIsJoiningRoom(true);
  };

  const handleJoinRoom = () => {
    if (!roomId) {
      setErrorMessage("Please enter a Room ID");
      return;
    }
    setErrorMessage("");

    fetch("http://127.0.0.1:8000/api/join_room/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          navigate(`/room/${roomId}`);
        } else {
          setErrorMessage(data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage("Something went wrong. Please try again.");
      });
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
          {isJoiningRoom && (
            <div style={{ marginTop: "10px" }}>
              <Input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <Button onClick={handleJoinRoom} style={{ marginTop: "10px" }}>
                Join
              </Button>
              {errorMessage && (
                <div style={{ color: "red", marginTop: "10px" }}>
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
