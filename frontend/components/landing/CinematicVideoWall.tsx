import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { creatorVideos } from "../../data/creatorVideos";
import { VideoRow } from "./VideoRow";
import { HeroOverlay } from "./HeroOverlay";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function CinematicVideoWall() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Slow down and fade as we scroll
  const wallOpacity = useTransform(scrollY, [0, 800], [1, 0.3]);
  const wallScale = useTransform(scrollY, [0, 800], [1, 1.1]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  // Shuffle videos differently for each row
  const getShuffledVideos = (seed: number) => {
    return [...creatorVideos].sort((a, b) => {
      const hash = (a.id.charCodeAt(0) + b.id.charCodeAt(0) + seed) % 3;
      return hash - 1;
    });
  };

  const rows = [
    { id: 1, direction: "left" as const, speed: 18, videos: getShuffledVideos(1) },
    { id: 2, direction: "right" as const, speed: 25, videos: getShuffledVideos(2) },
    { id: 3, direction: "left" as const, speed: 21, videos: getShuffledVideos(3) },
    { id: 4, direction: "right" as const, speed: 29, videos: getShuffledVideos(4) },
    { id: 5, direction: "left" as const, speed: 24, videos: getShuffledVideos(5) },
  ];

  const parallaxX = prefersReducedMotion ? 0 : mousePosition.x * -10;
  const parallaxY = prefersReducedMotion ? 0 : mousePosition.y * -6;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#1a0505] flex flex-col justify-center">
      {/* Video Wall Background */}
      <motion.div 
        className="absolute inset-0 z-0 flex flex-col justify-center -m-10" // negative margin to allow parallax without showing edges
        style={{ 
          opacity: wallOpacity,
          scale: wallScale,
          x: parallaxX,
          y: parallaxY
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="flex flex-col gap-2 md:gap-4 rotate-[-2deg] scale-[1.05]">
          {rows.map((row, idx) => {
            // Hide some rows on smaller screens for performance
            // Row 1, 2: Always visible (mobile)
            // Row 3: Visible on sm (tablet)
            // Row 4, 5: Visible on md (desktop)
            const displayClass = 
              idx >= 3 ? "hidden md:flex" : 
              idx >= 2 ? "hidden sm:flex" : "flex";
              
            return (
              <div key={row.id} className={displayClass}>
                <VideoRow 
                  direction={row.direction} 
                  speed={row.speed} 
                  videos={row.videos} 
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Hero Overlay Above the Wall */}
      <HeroOverlay />
    </section>
  );
}
