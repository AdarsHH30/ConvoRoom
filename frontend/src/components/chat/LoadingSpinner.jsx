import React from "react";
import { BoxesLoader } from "react-awesome-loaders";

const LoadingSpinner = React.memo(({ text = "Connecting ..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-transparent">
    <div className="w-full max-w-5xl mx-auto p-2 md:p-4 h-[90vh] flex items-center justify-center">
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
));

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
