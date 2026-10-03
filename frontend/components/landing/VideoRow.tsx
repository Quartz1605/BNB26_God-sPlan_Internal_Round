import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CreatorVideo } from "../../data/creatorVideos";
import { VideoWallCard } from "./VideoWallCard";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface VideoRowProps {
  videos: CreatorVideo[];
  direction: "left" | "right";
  speed: number;
}

export function VideoRow({ videos, direction, speed }: VideoRowProps) {
  const prefersReducedMotion = useReducedMotion();

  // Create a randomized but deterministic sequence of sizes for this row
  const items = useMemo(() => {
    const sizes: Array<"small" | "medium" | "large"> = ["small", "medium", "large"];
    return videos.map((video, idx) => ({
      video,
      // deterministic pseudo-random size based on id and index
      size: sizes[(video.id.charCodeAt(1) + idx) % sizes.length],
    }));
  }, [videos]);

  // Duplicate items for seamless looping
  // [ A B C ] -> [ A B C ] [ A B C ]
  const duplicatedItems = [...items, ...items];

  if (prefersReducedMotion) {
    return (
      <div className="flex overflow-hidden py-2 md:py-4 opacity-70">
        <div className="flex whitespace-nowrap">
          {items.map((item, idx) => (
            <VideoWallCard key={`${item.video.id}-${idx}`} video={item.video} size={item.size} />
          ))}
        </div>
      </div>
    );
  }

  const moveX = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];

  return (
    <div className="flex overflow-hidden py-2 md:py-4">
      <motion.div
        className="flex whitespace-nowrap will-change-transform"
        animate={{ x: moveX }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <VideoWallCard key={`${item.video.id}-${idx}`} video={item.video} size={item.size} />
        ))}
      </motion.div>
    </div>
  );
}
