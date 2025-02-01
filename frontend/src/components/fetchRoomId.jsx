import React, { useEffect, useState } from "react";

const FetchRoomId = () => {
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/generateRoomId/"
        );
        const data = await response.json();
        setRoomId(data.roomId);
      } catch (error) {
        console.error("Error fetching room ID:", error);
      }
    };

    fetchRoomId();
  }, []);

  return <div>{roomId ? <p>Room ID: {roomId}</p> : <p>Loading...</p>}</div>;
};

export default FetchRoomId;
