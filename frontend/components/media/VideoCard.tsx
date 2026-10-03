"use client";

import { motion } from "framer-motion";
import { Play, Eye, MoreHorizontal, Scissors, PlusCircle } from "lucide-react";
import { useState } from "react";

interface VideoCardProps {
  video?: any;
  title?: string;
  thumbnail?: string;
  duration?: string;
  views?: string;
  platform?: string;
  type?: string;
  publishedAt?: string;
  topics?: string[];
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showMeta?: boolean;
}

export function VideoCard(props: VideoCardProps) {
  const v = props.video || props;
  const title = v.title || "";
  const thumbnail = v.thumbnail || "";
  const duration = v.duration || "";
  const views = v.views;
  const platform = v.platform;
  const type = v.type;
  const publishedAt = v.publishedAt;
  const topics = v.topics;
  const className = props.className || "";
  const onClick = props.onClick;
  const size = props.size || "md";
  const showMeta = props.showMeta !== undefined ? props.showMeta : true;

  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-xl border border-white/[0.07] cursor-pointer bg-[#111214] flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMenuOpen(false); }}
      onClick={onClick}
      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.12)" }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div
          className="absolute inset-0 bg-black/30 transition-opacity duration-300"
          style={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Play button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.85 }}
          transition={{ duration: 0.18 }}
        >
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
            <Play size={16} className="text-white ml-0.5" fill="currentColor" />
          </div>
        </motion.div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white/90 font-semibold tracking-wide">
          {duration}
        </div>

        {/* Type badge */}
        {type && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold tracking-widest text-white/70 uppercase border border-white/10">
            {type}
          </div>
        )}

        {/* Hover actions */}
        <motion.div
          className="absolute top-2 right-2 flex gap-1.5"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            className="w-7 h-7 rounded-md bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Scissors size={11} />
          </button>
          <button
            className="w-7 h-7 rounded-md bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <MoreHorizontal size={11} />
          </button>
        </motion.div>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <div className="absolute top-10 right-2 z-20 bg-[#1E2024] rounded-lg border border-white/10 shadow-2xl py-1 min-w-[160px]">
          {["Create Clip", "Add to Project", "Find Similar", "Generate Short", "Analyze"].map((item) => (
            <button
              key={item}
              className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {showMeta && (
        <div className="p-3 flex flex-col gap-1.5">
          <h3 className="text-[13px] font-medium text-white/85 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2.5 text-[11px] text-white/35">
            {views && (
              <span className="flex items-center gap-1">
                <Eye size={9} />
                {views}
              </span>
            )}
            {publishedAt && <span>{publishedAt}</span>}
            {platform && <span className="text-white/25">· {platform}</span>}
          </div>
          {topics && topics.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-0.5">
              {topics.slice(0, 2).map((t: string) => (
                <span
                  key={t}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 border border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default VideoCard;
