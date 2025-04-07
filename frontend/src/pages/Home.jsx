"use client";

import React from "react";
import { SparklesCore } from "../components/ui/sparkles";
import { FloatingPaper } from "@/components/floating-paper";
import { Footer } from "@/components/Footer";
// import { Hero } from "@/components/hero";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-between overflow-hidden relative py-4 sm:py-6">
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="sparkles"
          className="w-full h-full pointer-events-none"
          color="#4ade80"
          size={100}
          speed={0.2}
          opacity={0.5}
          minSize={0.6}
          maxSize={1.4}
          particleDensity={window.innerWidth < 768 ? 40 : 70}
          particleColor="#FFFFFF"
        />
      </div>

      <div className="absolute inset-0 overflow-hidden z-0">
        <FloatingPaper count={window.innerWidth < 768 ? 6 : 10} />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center">
        <div className="w-full flex-grow flex items-center justify-center">
          <Hero />
        </div>
      </div>
      <Footer />
    </div>
  );
}
