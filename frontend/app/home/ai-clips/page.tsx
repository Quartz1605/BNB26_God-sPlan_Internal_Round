"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Scissors, Plus, ChevronRight, Sparkles, TrendingUp, Clock } from "lucide-react";
import { videos, aiDetectedMoments } from "@/data/mockData";

const momentTypeColors: Record<string, string> = {
  HOOK: "bg-red-500/10 text-red-400 border-red-500/20",
  INSIGHT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  STORY: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const scoreBar = (score: number) => {
  const pct = ((score - 7) / 3) * 100; // 7–10 range
  const color = score >= 9 ? "bg-emerald-400" : score >= 8.5 ? "bg-blue-400" : "bg-amber-400";
  return { pct, color };
};

export default function AIClipsPage() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#0B0B0D] text-white">
      {/* Page header */}
      <div className="px-8 pt-8 pb-5 border-b border-white/[0.05] flex-shrink-0">
        <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-1.5">
          AI Workspace
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white/90 tracking-tight">Clip Lab</h1>
            <p className="text-[13px] text-white/35 mt-0.5">
              AI finds the moments worth keeping. You decide what happens next.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-white/30">
            <Sparkles size={13} className="text-blue-400" />
            <span>31 moments detected across selected video</span>
          </div>
        </div>
      </div>

      {/* Main layout: Source video + Detected moments */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Source video selector + preview */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.05] flex flex-col">
          <div className="p-4 border-b border-white/[0.05]">
            <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-3">
              Source Video
            </span>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {videos.slice(0, 6).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVideo(v)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                    selectedVideo.id === v.id
                      ? "bg-white/[0.08] border border-white/15"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="relative w-12 h-8 rounded-md overflow-hidden flex-shrink-0">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${v.thumbnail})` }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white/70 line-clamp-2 leading-snug">
                      {v.title}
                    </p>
                    <span className="text-[10px] text-white/25">{v.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Video preview */}
          <div className="flex-1 p-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/[0.08]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedVideo.thumbnail})` }}
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Play size={16} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-white/50 rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-white/40 mt-1 font-mono">
                  <span>06:14</span>
                  <span>{selectedVideo.duration}</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[12px] font-medium text-white/70 leading-snug">
                {selectedVideo.title}
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                {selectedVideo.views} views · {selectedVideo.publishedAt}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Detected moments */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
              AI-Detected Moments
            </span>
            <div className="flex gap-2 text-[11px]">
              {["All", "Hooks", "Insights", "Stories"].map((f) => (
                <button
                  key={f}
                  className="px-2.5 py-1 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.08]"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {aiDetectedMoments.map((moment, i) => {
              const { pct, color } = scoreBar(moment.score);
              const isSelected = selectedMoment === moment.id;

              return (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelectedMoment(isSelected ? null : moment.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#17181B] border-white/15"
                      : "bg-[#111214] border-white/[0.06] hover:border-white/10 hover:bg-[#14151A]"
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md border ${momentTypeColors[moment.type]}`}
                      >
                        {moment.type}
                      </span>
                      <span className="text-[11px] font-mono text-white/35">{moment.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-white/25">Quality</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1 rounded-full bg-white/[0.08] overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-white/60">{moment.score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <blockquote className="text-[13px] text-white/70 leading-relaxed border-l-2 border-white/15 pl-3 mb-4 italic">
                    &ldquo;{moment.transcript}&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/25">{moment.category}</span>

                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/50 bg-white/[0.05] hover:bg-white/10 border border-white/[0.06] hover:border-white/15 transition-colors hover:text-white/80">
                        <Play size={10} />
                        Preview
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/50 bg-white/[0.05] hover:bg-white/10 border border-white/[0.06] hover:border-white/15 transition-colors hover:text-white/80">
                        <Plus size={10} />
                        Add to Timeline
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#0B0B0D] bg-white hover:bg-white/90 transition-colors">
                        <Scissors size={10} />
                        Generate Clip
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA for more */}
          <div className="mt-6 text-center py-8 border border-dashed border-white/[0.08] rounded-2xl">
            <p className="text-[13px] text-white/30 mb-3">
              26 more moments detected — ranked by quality
            </p>
            <button className="flex items-center gap-1.5 mx-auto text-[12px] text-white/40 hover:text-white/70 transition-colors">
              Load all moments
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
