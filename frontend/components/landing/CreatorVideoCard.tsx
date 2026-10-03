import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreatorVideo } from "../../data/creatorVideos";
import { useVideoVisibility } from "../../hooks/useVideoVisibility";
import { Play } from "lucide-react";

interface CreatorVideoCardProps {
  video: CreatorVideo;
  className?: string;
}

export function CreatorVideoCard({ video, className = "" }: CreatorVideoCardProps) {
  const { containerRef, videoRef, isVisible } = useVideoVisibility();
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClass = 
    video.aspectRatio === "16:9" ? "aspect-video" :
    video.aspectRatio === "9:16" ? "aspect-[9/16]" :
    video.aspectRatio === "4:5" ? "aspect-[4/5]" :
    "aspect-square";

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-[#1a0505] group flex-shrink-0 cursor-pointer ${aspectRatioClass} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Poster Image (shown until video loads or if error) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
          isVideoLoaded && !hasError ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${video.thumbnail})` }}
      />
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnail}
        loop
        muted
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => setIsVideoLoaded(true)}
        onError={() => setHasError(true)}
      />

      {/* Hover Overlay */}
      <motion.div 
        className="absolute inset-0 bg-[#280b0b]/80 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div className="flex items-center gap-2 mb-2 text-white">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-sm font-semibold">Watch</span>
        </div>
        <div className="text-white">
          <p className="text-xs font-medium text-white/80">{video.creator}</p>
          <h3 className="text-sm font-bold leading-tight mt-1 mb-1 line-clamp-2">{video.title}</h3>
          <p className="text-xs text-white/60">{video.duration}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
