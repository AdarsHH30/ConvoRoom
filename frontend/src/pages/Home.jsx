import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Plus } from "lucide-react";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Create Room
  const createRoom = () => {
    fetch("http://127.0.0.1:9999/api/create_room/", {
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

    fetch("http://127.0.0.1:9999/api/join_room/", {
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

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleJoinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>

      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <Card className="w-full max-w-md backdrop-blur-md bg-opacity-70 border border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Connect</CardTitle>
          <CardDescription>
            Create or join a room to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isJoiningRoom ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-28 flex flex-col items-center justify-center gap-2 rounded-xl hover:shadow-lg transition-all duration-300"
                variant="outline"
                onClick={createRoom}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Plus
                    size={24}
                    className="text-blue-500 dark:text-blue-300"
                  />
                </div>
                <span className="font-medium">Create Room</span>
              </Button>
              <Button
                className="h-28 flex flex-col items-center justify-center gap-2 rounded-xl hover:shadow-lg transition-all duration-300"
                variant="outline"
                onClick={joinRoom}
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <ArrowRight
                    size={24}
                    className="text-purple-500 dark:text-purple-300"
                  />
                </div>
                <span className="font-medium">Join Room</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="text-center font-medium mb-4">
                Enter Room Details
              </h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 rounded-lg"
                />
                <Button
                  onClick={handleJoinRoom}
                  className="h-12 px-6 rounded-lg"
                >
                  Join
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setIsJoiningRoom(false)}
              >
                Back
              </Button>
            </div>
          )}

          {errorMessage && (
            <Alert
              variant="destructive"
              className="mt-4 backdrop-blur-sm bg-opacity-80"
            >
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;
