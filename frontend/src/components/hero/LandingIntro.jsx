import { motion } from "framer-motion";
export const Intro = () => {
  return (
    <div className="mb-12 sm:mb-8 md:mb-10 lg:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-1 sm:px-2 md:px-4"
      >
        <h1 className="text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
          Connecting team with AI
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400 block sm:inline">
            ConvoRoom
          </span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 max-w-2xl mx-auto px-1 sm:px-2 md:px-4 leading-relaxed"
      >
        Collaborate with your friends and let AI assist you for your group work.
      </motion.p>
    </div>
  );
};
