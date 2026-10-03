import React from "react";
import { motion } from "framer-motion";

export function HeroOverlay() {
  const handleLogin = () => {
    window.location.href = "/home";
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      {/* Layered Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505]/80 via-[#280b0b]/40 to-[#1a0505]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,11,11,0.6)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pointer-events-auto mt-20">
        <motion.h1 
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-red-100 tracking-tighter mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          CREATORAI
        </motion.h1>
        
        <motion.h2
          className="text-2xl md:text-4xl font-bold text-white/90 mb-6 drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Your entire creative universe.<br className="hidden md:block" />
          Understood by AI.
        </motion.h2>
        
        <motion.p
          className="text-lg md:text-xl text-red-100/80 mb-10 max-w-2xl drop-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          Search, edit, remix, and create from everything you've ever made.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <button 
            onClick={handleLogin}
            className="px-8 py-4 bg-white text-[#280b0b] font-bold rounded-full hover:bg-red-50 transition-colors shadow-lg shadow-white/10"
          >
            Start Creating
          </button>
          <button 
            className="px-8 py-4 bg-[#3a1010]/60 backdrop-blur-md text-white font-semibold rounded-full border border-red-500/20 hover:bg-[#4a1515]/70 hover:border-red-400/40 transition-all"
            onClick={() => {
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
            }}
          >
            Explore Your Content
          </button>
        </motion.div>
      </div>
    </div>
  );
}
