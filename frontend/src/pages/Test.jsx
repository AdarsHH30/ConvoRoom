import React from "react";
import "../css/Test.css"; // Import the CSS file for styling

const Test = () => {
  return (
    <div className="test-container">
      <div className="center-container">
        <button className="create-room-button">Create Room</button>
        <button className="join-room-button">Join Room</button>
      </div>
    </div>
  );
};

export default Test;
