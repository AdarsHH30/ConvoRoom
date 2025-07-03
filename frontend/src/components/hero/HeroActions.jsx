import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CirclePlus, UsersRound } from "lucide-react";

export default function HeroActions({ onCreateRoom, onJoinRoom, isCreating }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 px-1 sm:px-2 md:px-4 max-w-sm sm:max-w-lg mx-auto"
    >
      <div className="group relative">
        <Button
          size="lg"
          onClick={onCreateRoom}
          disabled={isCreating}
          className="w-full sm:w-auto bg-green-800 hover:bg-green-700 text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg shadow-lg text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[140px]"
        >
          <CirclePlus className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          {isCreating ? "Creating..." : "Create Room"}
        </Button>
        <span className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 mt-2 text text-sm px-2 py-1 rounded">
          Ctrl + K
        </span>
      </div>
      <Button
        onClick={onJoinRoom}
        className="w-full sm:w-auto bg-transparent text-green-500 border border-green-600 hover:bg-green-600/20 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg shadow-lg text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[140px]"
        size="lg"
        variant="outline"
      >
        <UsersRound className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        Join Room
      </Button>
    </motion.div>
  );
}
