"use client";

import React from "react";
import { SparklesCore } from "../components/ui/sparkles";
import { RoboAnimation } from "@/components/robo-animation";
import { FloatingPaper } from "@/components/floating-paper";
import { Navbar } from "@/components/Navbar";
// import { Hero } from "@/components/hero";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
      <SparklesCore
        id="sparkles"
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        color="#4ade80"
        size={100}
        speed={0.2}
        opacity={0.5}
        minSize={0.6}
        maxSize={1.4}
        particleDensity={70}
        particleColor="#FFFFFF"
      />

      <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={10} />
      </div>
      <Hero />
      <Navbar />
    </div>
  );
}
