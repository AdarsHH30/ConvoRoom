"use client";

import React from "react";
import { Footer } from "@/components/Footer";
import ParticlesBackground from "@/components/ui/particles";

import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-between overflow-hidden relative py-4 sm:py-6">
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center">
        <div className="w-full flex-grow flex items-center justify-center">
          <ParticlesBackground />

          <Hero />
        </div>
      </div>
      <Footer />
    </div>
  );
}
