"use client";

import React from "react";
import { SparklesCore } from "../components/ui/sparkles";
import { RoboAnimation } from "@/components/robo-animation";
import { FloatingPaper } from "@/components/floating-paper";
// import { Hero } from "@/components/hero";
import Hero from "@/components/hero";

export default function Test() {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
      {/* Container for sparkles effect with absolute positioning */}
      <div className="absolute inset-0">
        <SparklesCore
          id="sparkles"
          background="black"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={70}
          particleColor="#FFFFFF"
          className="w-full h-full"
        />
      </div>
      {/* Robo animation positioned over the sparkles */}
      <div className="absolute inset-0 flex items-center justify-center left-0 ">
        <RoboAnimation />
      </div>

      {/* Content positioned over the sparkles */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-8">
          Interactive Particles
        </h1>
        <p className="text-xl text-gray-300 max-w-lg mx-auto">
          Move your mouse around to see the particles react to your movement.
          They will gently move away from your cursor.
        </p>
        <FloatingPaper count={6} />
        <button className="mt-8 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-opacity-90 transition-all">
          Explore More
        </button>
      </div>
    </div>
  );
}
