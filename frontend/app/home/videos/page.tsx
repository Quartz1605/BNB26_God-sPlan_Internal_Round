"use client";

import React from "react";
import { Video, Search, Filter } from "lucide-react";
import { videos } from "@/data/mockData";
import VideoCard from "@/components/media/VideoCard";

export default function VideosPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <Video className="w-3.5 h-3.5 text-red-500" />
            <span>Library</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Videos</h1>
          <p className="text-sm text-zinc-400 mt-1">All indexed long-form videos and podcasts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
