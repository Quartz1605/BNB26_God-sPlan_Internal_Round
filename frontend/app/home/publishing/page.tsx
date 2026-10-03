"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
  CheckCircle2,
  Video,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PublishingPage() {
  const scheduledPosts = [
    {
      id: "sp1",
      title: "Why Most AI Agents Fail in Production (Short)",
      platform: "YouTube Shorts",
      date: "Tomorrow, Oct 4",
      time: "10:00 AM",
      status: "Scheduled",
      bestTimeReason: "Peak subscriber activity on Thursdays",
    },
    {
      id: "sp2",
      title: "Building RAG Pipelines from Scratch (LinkedIn Article)",
      platform: "LinkedIn",
      date: "Friday, Oct 5",
      time: "02:30 PM",
      status: "Scheduled",
      bestTimeReason: "High tech executive feed engagement window",
    },
    {
      id: "sp3",
      title: "Open Source AI Tools Roundup (Instagram Reel)",
      platform: "Instagram",
      date: "Monday, Oct 8",
      time: "06:00 PM",
      status: "Draft",
      bestTimeReason: "Optimal evening scroll slot",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
            <span>Distribution Matrix</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Publishing Calendar</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Automated multi-platform scheduling tuned to audience retention peak times.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Post</span>
        </button>
      </div>

      {/* AI Timing Optimization Banner */}
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">AI Audience Slot Recommendation</h3>
          <p className="text-xs text-zinc-300">
            Your subscribers in US East & India overlap most active engagement on Thursdays at 10:00 AM EST. Posting YouTube Shorts in this window yields +22% higher 24-hour reach.
          </p>
        </div>
      </div>

      {/* Scheduled Queue */}
      <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-semibold text-white">Upcoming Queue</h2>
          <span className="text-xs font-mono text-zinc-400">{scheduledPosts.length} items queued</span>
        </div>

        <div className="space-y-4">
          {scheduledPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-lg bg-[#17181B] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-semibold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                    {post.platform}
                  </span>
                  <span className="text-zinc-400 font-mono">
                    {post.date} at {post.time}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mt-1">{post.title}</h3>
                <p className="text-xs text-zinc-500 italic">"{post.bestTimeReason}"</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded border ${
                    post.status === "Scheduled"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
