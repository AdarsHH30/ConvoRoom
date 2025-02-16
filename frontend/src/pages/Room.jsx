import React from "react";
import { useParams } from "react-router-dom";
import FetchRoomId from "../components/fetchRoomId";
import ChatUI from "../components/ChatUI";

const Room = () => {
  const { roomId } = useParams();

  return (
    <div>
      <h1>Room ID: {roomId}</h1>
      {/* <FetchRoomId roomId={roomId} /> */}
      <ChatUI roomId={roomId} />
    </div>
  );
};

export default Room;
