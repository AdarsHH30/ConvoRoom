import React from "react";
import { BoxesLoader } from "react-awesome-loaders";

const LoadingSpinner = React.memo(
  ({ text = "Connecting ...", fullScreen = true }) => (
    <div
      className={`flex items-center justify-center bg-transparent ${
        fullScreen ? "min-h-screen" : "w-full h-full"
      }`}
    >
      <div
        className={`flex items-center justify-center ${
          fullScreen
            ? "w-full max-w-5xl mx-auto p-2 md:p-4 h-[90vh]"
            : "w-auto h-auto"
        }`}
      >
        <BoxesLoader
          boxColor={"#4ade80"}
          shadowColor={"#999999"}
          desktopSize={"150px"}
          mobileSize={"80px"}
          background={"transparent"}
          text={text}
          textColor="#4ade80"
        />
      </div>
    </div>
  )
);

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
