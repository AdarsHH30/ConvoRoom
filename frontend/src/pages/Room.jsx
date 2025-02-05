import React from "react";
import FetchRoomId from "../components/fetchRoomId";
import Chat from "../components/AiChatbot";
import ChatUI from "../components/ChatUI";

const Room = () => {
  return (
    <div>
      <FetchRoomId />
      {/* <Chat /> */}
      <ChatUI />
    </div>
  );
};

export default Room;
