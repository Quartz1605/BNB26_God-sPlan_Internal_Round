"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, LayoutGrid, List, Eye } from "lucide-react";
import { videos } from "@/data/mockData";
import VideoCard from "@/components/media/VideoCard";

const filters = ["All", "Videos", "Shorts", "Podcasts", "Clips", "Scripts", "Unused", "Favorites"];
const sortOptions = ["Newest", "Most viewed", "Best retention", "Oldest"];

const platformColors: Record<string, string> = {
  YouTube: "text-red-400",
  Instagram: "text-pink-400",
  LinkedIn: "text-blue-400",
  X: "text-white/50",
};

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = videos.filter((v) => {
    if (searchQuery) {
      return (
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0B0D] text-white">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-1.5">
            Content
          </span>
          <h1 className="text-3xl font-semibold text-white/90 tracking-tight mb-1">
            Content Library
          </h1>
          <p className="text-[14px] text-white/35">
            248 videos · 1,842 indexed moments · 127 unused clips
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search */}
          <div className="relative max-w-lg">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder='Search by topic, title, speaker, moment...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#17181B] border border-white/[0.08] rounded-xl text-[13px] text-white placeholder-white/25 outline-none focus:border-white/20 focus:bg-[#1e2024] transition-all"
            />
          </div>

          {/* Filters + view toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    activeFilter === f
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#17181B] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[12px] text-white/50 outline-none"
              >
                {sortOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="flex rounded-lg bg-[#17181B] border border-white/[0.08] overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-2.5 py-1.5 transition-colors ${
                    viewMode === "grid" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 transition-colors ${
                    viewMode === "list" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <VideoCard
                  title={v.title}
                  thumbnail={v.thumbnail}
                  duration={v.duration}
                  views={v.views}
                  platform={v.platform}
                  publishedAt={v.publishedAt}
                  topics={v.topics}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="flex flex-col gap-2">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#111214] border border-white/[0.06] hover:border-white/10 hover:bg-[#17181B] cursor-pointer group transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${v.thumbnail})` }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors mb-1 truncate">
                    {v.title}
                  </h3>
                  <div className="flex items-center gap-2.5 text-[11px] text-white/30">
                    <span className={platformColors[v.platform] || "text-white/30"}>{v.platform}</span>
                    <span>·</span>
                    <span>{v.duration}</span>
                    <span>·</span>
                    <span>{v.publishedAt}</span>
                    <div className="flex gap-1 ml-2">
                      {v.topics.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[9px] text-white/35"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 flex items-center gap-4 text-[11px] text-white/30">
                  <div className="flex items-center gap-1">
                    <Eye size={10} />
                    {v.views}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-white/20">Retention</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400/60"
                          style={{ width: `${v.retention}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/35">{v.retention}%</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/20">
                    {v.clips} clips · {v.shorts} shorts
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-24 text-white/25">
            <p className="text-lg font-medium mb-2">No content matches &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-sm">Try searching by topic, person, or describe a moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
