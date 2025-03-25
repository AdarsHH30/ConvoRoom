import React from "react";
import { EvervaultCard, Icon } from "../components/ui/evervault-card.jsx";
// import WorldMap from "@/components/ui/world-map.jsx";
// import WorldMap from "@/components/ui/world-map";

function Test() {
  return (
    <div className="h-screen w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <EvervaultCard text="HOVER ME"></EvervaultCard>
        <div className="pointer-events-none absolute inset-0 h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon />
          </div>
        </div>
      </div>
      {/* <WorldMap /> */}
    </div>
  );
}

export default Test;
