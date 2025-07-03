"use client";

import { Footer } from "@/components/Footer";
import ParticlesBackground from "@/components/ui/particles";

import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-between overflow-hidden relative py-2 sm:py-4 md:py-6">
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center">
        <div className="w-full flex-grow flex items-center justify-center px-2 sm:px-4">
          <ParticlesBackground />
          <Hero />
        </div>
      </div>
      <Footer />
    </div>
  );
}
