import React from "react";
import FetchRoomId from "../components/fetchRoomId";
import Chat from "../components/AiChatbot";

const Room = () => {
  return (
    <div>
      <FetchRoomId />
      <Chat />
    </div>
  );
};

export default Room;
