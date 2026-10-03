"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Layers,
  Sparkles,
  Maximize2,
  Volume2,
  Video,
  Mic,
  Music,
  FileText,
  Plus,
  Sliders,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { activeProjects, unusedContent, aiDetectedMoments } from "@/data/mockData";

export default function StudioPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [selectedTrack, setSelectedTrack] = useState<string>("video");

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Studio — Timeline Editor</h1>
              <span className="text-[10px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                Draft Auto-Saved
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Project: AI Agents Deep Dive Tutorial • 1080p60</p>
          </div>
        </div>

        {/* Aspect Ratio & Export Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#17181B] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
            {(["16:9", "9:16", "1:1"] as const).map((aspect) => (
              <button
                key={aspect}
                onClick={() => setAspectRatio(aspect)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  aspectRatio === aspect ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {aspect}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate First Cut</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Media & Script, Right Video Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[460px]">
        {/* Left Drawer: Detected Moments & Assets (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-white/[0.08] bg-[#111214] p-4 flex flex-col space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>AI Clips & Moments</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{aiDetectedMoments.length} ready</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {aiDetectedMoments.map((moment) => (
              <div
                key={moment.id}
                className="p-3 rounded-lg bg-[#17181B] border border-white/[0.06] hover:border-red-500/40 transition-colors space-y-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-red-400 text-[10px] font-semibold bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/20">
                    {moment.type} • {moment.timestamp}
                  </span>
                  <span className="text-zinc-400 text-[10px] font-mono">Score {moment.score}</span>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 italic">"{moment.transcript}"</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-500">{moment.category}</span>
                  <button className="text-[10px] font-semibold text-red-400 group-hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Insert to timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Video Stage & Preview (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-white/[0.08] bg-[#0E0F11] p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Video Container Frame */}
          <div className="relative w-full h-full flex items-center justify-center bg-black/60 rounded-lg overflow-hidden border border-white/[0.04]">
            <img
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80"
              alt="Studio Preview"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Subtitle Overlay Preview */}
            <div className="absolute bottom-8 px-6 text-center">
              <span className="bg-black/80 text-white font-bold text-sm px-3 py-1.5 rounded border border-white/10 shadow-lg">
                "Nobody talks about this fundamental problem with AI agents..."
              </span>
            </div>

            {/* Big Play Overlay Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          {/* Transport Controls Bar */}
          <div className="flex items-center justify-between pt-3 px-2 text-xs text-zinc-400 border-t border-white/[0.06] mt-3">
            <div className="font-mono text-white text-xs">
              00:04:18 / <span className="text-zinc-500">00:18:42</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="hover:text-white transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button className="hover:text-white transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <Maximize2 className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Multitrack Timeline Bottom Panel */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#111214] space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2">
          <div className="flex items-center gap-2 font-mono text-zinc-400">
            <Sliders className="w-3.5 h-3.5 text-red-500" />
            <span className="uppercase text-[10px] tracking-wider font-semibold">Multitrack Sequence</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500">1080p60 • Stereo 48kHz</div>
        </div>

        {/* Tracks Grid */}
        <div className="space-y-2 font-mono text-xs">
          {/* Track 1: Video */}
          <div className="flex items-center gap-3">
            <div className="w-28 flex items-center gap-2 text-zinc-400 font-sans text-xs">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Video A-Roll</span>
            </div>
            <div className="flex-1 h-8 rounded bg-[#17181B] border border-white/[0.06] relative overflow-hidden flex items-center px-2">
              <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-blue-900/40 border-r border-blue-500/50 flex items-center px-3 text-[10px] text-blue-300 font-semibold truncate">
                Main_Talking_Head_Take2.mp4
              </div>
              <div className="absolute left-[45%] top-0 bottom-0 w-[30%] bg-blue-900/60 border-r border-blue-500/50 flex items-center px-3 text-[10px] text-blue-300 font-semibold truncate">
                Main_Talking_Head_Take3.mp4
              </div>
            </div>
          </div>

          {/* Track 2: B-Roll & AI Cuts */}
          <div className="flex items-center gap-3">
            <div className="w-28 flex items-center gap-2 text-zinc-400 font-sans text-xs">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>AI B-Roll</span>
            </div>
            <div className="flex-1 h-8 rounded bg-[#17181B] border border-white/[0.06] relative overflow-hidden flex items-center px-2">
              <div className="absolute left-[15%] top-0 bottom-0 w-[20%] bg-red-900/40 border-x border-red-500/50 flex items-center px-2 text-[10px] text-red-300 font-semibold truncate">
                Code_Overlay_Clip.mp4
              </div>
            </div>
          </div>

          {/* Track 3: Audio Dialogue */}
          <div className="flex items-center gap-3">
            <div className="w-28 flex items-center gap-2 text-zinc-400 font-sans text-xs">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dialogue</span>
            </div>
            <div className="flex-1 h-8 rounded bg-[#17181B] border border-white/[0.06] relative overflow-hidden flex items-center px-2">
              <div className="absolute left-0 top-0 bottom-0 w-[85%] bg-emerald-950/40 border-r border-emerald-500/50 flex items-center px-3 text-[10px] text-emerald-300 font-semibold truncate">
                Mic_Cleaned_Denoised.wav
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
