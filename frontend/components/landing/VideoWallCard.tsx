import React from "react";
import { CreatorVideoCard } from "./CreatorVideoCard";
import { CreatorVideo } from "../../data/creatorVideos";

interface VideoWallCardProps {
  video: CreatorVideo;
  size: "small" | "medium" | "large";
}

export function VideoWallCard({ video, size }: VideoWallCardProps) {
  // Map sizes to Tailwind heights/widths to create the asymmetrical grid effect
  const sizeClasses = {
    small: "h-[180px] w-auto",
    medium: "h-[240px] w-auto",
    large: "h-[320px] w-auto",
  };

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 mx-2 md:mx-4`}>
      <CreatorVideoCard video={video} className="h-full w-auto" />
    </div>
  );
}
