"use client";
import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg w-16">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            delay: dot * 0.1,
          }}
        />
      ))}
    </div>
  );
}
