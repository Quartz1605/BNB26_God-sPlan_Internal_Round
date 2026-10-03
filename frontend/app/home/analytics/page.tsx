"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Clock,
  Zap,
  Target,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Share2,
} from "lucide-react";
import { videos } from "@/data/mockData";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"30d" | "90d" | "all">("30d");

  // Performance breakdown by hook type
  const hookRetention = [
    { type: "Contrarian", count: 8, avgRetention: "72%", benchmark: "+9% vs channel avg", color: "border-red-500/40 bg-red-950/20 text-red-400" },
    { type: "Story-first", count: 12, avgRetention: "68%", benchmark: "+5% vs channel avg", color: "border-emerald-500/40 bg-emerald-950/20 text-emerald-400" },
    { type: "Question-based", count: 6, avgRetention: "63%", benchmark: "Standard", color: "border-blue-500/40 bg-blue-950/20 text-blue-400" },
    { type: "List-based", count: 9, avgRetention: "59%", benchmark: "-4% vs channel avg", color: "border-zinc-700 bg-zinc-900/40 text-zinc-400" },
  ];

  // Platform distribution stats
  const platformStats = [
    { name: "YouTube Long-form", views: "2.1M", share: "65%", growth: "+18%", icon: "🎥" },
    { name: "YouTube Shorts", views: "680K", share: "21%", growth: "+42%", icon: "⚡" },
    { name: "Instagram Reels", views: "310K", share: "10%", growth: "+12%", icon: "📱" },
    { name: "X / Twitter Clips", views: "140K", share: "4%", growth: "+29%", icon: "💬" },
  ];

  // Topic performance matrix
  const topicPerformance = [
    { topic: "AI Agents", videos: 6, totalViews: "436K", avgRetention: "71%", score: 9.4, signal: "Highest organic search pull" },
    { topic: "RAG Systems", videos: 4, totalViews: "248K", avgRetention: "73%", score: 9.1, signal: "Best watch-time density" },
    { topic: "Open Source AI", videos: 5, totalViews: "195K", avgRetention: "63%", score: 8.2, signal: "High social share rate" },
    { topic: "Startups & Build", videos: 3, totalViews: "93K", avgRetention: "58%", score: 7.4, signal: "High podcast clip conversion" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-red-500" />
            <span>Content Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Performance Intelligence</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Qualitative retention curves, hook efficacy, and evidence-backed audience behavior.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-[#17181B] p-1 rounded-lg border border-white/[0.08] text-xs font-medium">
          {(["30d", "90d", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedPeriod === period
                  ? "bg-zinc-800 text-white shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {period === "30d" ? "Last 30 Days" : period === "90d" ? "Last 90 Days" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards — Qualitative & Clear */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span>Average 30s Retention</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">67.4%</div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+4.2% vs last month</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span>Top Performing Hook</span>
            <Zap className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">Contrarian</div>
          <div className="mt-2 text-xs text-zinc-400">72% avg 30s retention rate</div>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span>High-Yield Topic</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">RAG Systems</div>
          <div className="mt-2 text-xs text-blue-400">73% watch-time density</div>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span>Content Recyclability</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">4.2x</div>
          <div className="mt-2 text-xs text-zinc-400">Shorts derived per video</div>
        </div>
      </div>

      {/* Retention by Hook Type */}
      <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Retention Efficacy by Hook Pattern</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Analyzed across {videos.length} videos. Contrarian hooks drive the lowest drop-off in the first 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hookRetention.map((hook) => (
            <div key={hook.type} className={`p-4 rounded-lg border ${hook.color} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-white">{hook.type}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-zinc-300">
                  {hook.count} videos
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{hook.avgRetention}</div>
                <div className="text-xs font-mono text-zinc-400">{hook.benchmark}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Video Performance & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Intelligence Matrix */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Topic Performance Matrix</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Performance breakdown by core channel themes</p>
            </div>
          </div>

          <div className="space-y-3">
            {topicPerformance.map((topic) => (
              <div
                key={topic.topic}
                className="p-4 rounded-lg bg-[#17181B] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-white">{topic.topic}</span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {topic.videos} videos • {topic.totalViews} views
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Score {topic.score}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500">Avg Retention:</span>
                    <span className="ml-2 font-mono text-zinc-300 font-semibold">{topic.avgRetention}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Audience Signal:</span>
                    <span className="ml-2 text-zinc-300 font-medium">{topic.signal}</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${(topic.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Share */}
        <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white">Platform Distribution</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Reach by platform format</p>
          </div>

          <div className="space-y-4">
            {platformStats.map((plat) => (
              <div key={plat.name} className="p-3.5 rounded-lg bg-[#17181B] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white flex items-center gap-2">
                    <span>{plat.icon}</span>
                    <span>{plat.name}</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">{plat.growth}</span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-white font-mono">{plat.views} views</span>
                  <span className="text-xs text-zinc-500">{plat.share} total reach</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: plat.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
