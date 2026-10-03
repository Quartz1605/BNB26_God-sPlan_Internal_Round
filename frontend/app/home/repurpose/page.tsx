"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Sparkles,
  Layers,
  Zap,
  Copy,
  CheckCircle2,
  Video,
  FileText,
  ArrowRight,
  Download,
} from "lucide-react";
import { videos, contentGenealogy } from "@/data/mockData";

export default function RepurposePage() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const [selectedFormat, setSelectedFormat] = useState<"short" | "reel" | "linkedin" | "thread">("short");

  const mutatedAssets = [
    {
      format: "YouTube Shorts (9:16)",
      title: "Why Most AI Agents Fail in Production",
      duration: "0:58",
      retentionScore: 9.4,
      status: "Ready to export",
      icon: "⚡",
    },
    {
      format: "Instagram Reel",
      title: "The #1 Mistake Engineers Make with AI",
      duration: "0:45",
      retentionScore: 8.9,
      status: "Ready to export",
      icon: "📱",
    },
    {
      format: "LinkedIn Video + Text Post",
      title: "We spent 3 weeks debugging AI agent context leaks...",
      duration: "1:12",
      retentionScore: 8.7,
      status: "Draft ready",
      icon: "💼",
    },
    {
      format: "X / Twitter Thread (7 Posts)",
      title: "1/7 Most AI agent frameworks are built wrong...",
      duration: "Read 2m",
      retentionScore: 9.1,
      status: "Draft ready",
      icon: "💬",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <Share2 className="w-3.5 h-3.5 text-red-500" />
            <span>Content Repurposing & Mutation</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Content Mutation Engine</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Transform 1 long-form video into 10+ high-retention multi-platform assets in 1 click.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" />
          <span>Export All Mutated Assets</span>
        </button>
      </div>

      {/* Video Source Selector */}
      <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Select Source Video for Mutation
          </h2>
          <span className="text-xs text-zinc-400 font-mono">Current: {selectedVideo.title}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {videos.slice(0, 4).map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVideo(v)}
              className={`p-3 rounded-lg border bg-[#17181B] cursor-pointer transition-all ${
                selectedVideo.id === v.id
                  ? "border-red-500 ring-1 ring-red-500 bg-red-950/20"
                  : "border-white/[0.08] hover:border-white/[0.2]"
              }`}
            >
              <div className="aspect-video rounded overflow-hidden mb-2 relative">
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 rounded">
                  {v.duration}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-white line-clamp-1">{v.title}</h3>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{v.views} views • {v.publishedAt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mutated Assets Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white">Generated Derivative Assets</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mutatedAssets.map((asset, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-white/[0.08] bg-[#111214] hover:border-white/[0.16] transition-colors space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{asset.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                      {asset.format}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1">{asset.title}</h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Score {asset.retentionScore}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-white/[0.06]">
                <span className="font-mono">Est. Duration: {asset.duration}</span>
                <button className="flex items-center gap-1 text-red-400 font-semibold hover:underline">
                  <span>Preview & Export</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
