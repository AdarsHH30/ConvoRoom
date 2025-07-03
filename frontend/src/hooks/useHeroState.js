"use client";

import { useEffect } from "react";
import PastRooms from "./PastRooms";
import { Intro } from "@/components/hero/LandingIntro";
import JoinRoomModal from "./hero/JoinRoomModal";
import HeroActions from "./hero/HeroActions";
import { useHeroState } from "../hooks/useHeroState";

export default function Hero() {
  const {
    isJoiningRoom,
    isCreating,
    joinRoom,
    cancelJoin,
    createRoom,
    handleJoinSuccess,
  } = useHeroState();

  const testLocalStorage = () => {
    try {
      localStorage.setItem("testKey", "testValue");
      const testValue = localStorage.getItem("testKey");

      if (testValue === "testValue") {
        return true;
      } else {
        return false;
      }
    } catch (_error) {
      return false;
    } finally {
      localStorage.removeItem("testKey");
    }
  };

  useEffect(() => {
    testLocalStorage();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex items-center justify-center w-full py-2 sm:py-4 md:py-8 px-1 sm:px-2 md:px-4">
      <PastRooms />
      <div className="container relative z-10 px-2 sm:px-4 max-w-4xl mx-auto text-center">
        <Intro />
        {isJoiningRoom ? (
          <JoinRoomModal onCancel={cancelJoin} onSuccess={handleJoinSuccess} />
        ) : (
          <HeroActions
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            isCreating={isCreating}
          />
        )}
      </div>
    </div>
  );
}