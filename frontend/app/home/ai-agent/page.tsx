"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Zap,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Terminal,
  Activity,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { recentActivity, unusedContent, creatorMemory } from "@/data/mockData";

export default function AIAgentPage() {
  const [isRunning, setIsRunning] = useState(true);

  // Active agent goals
  const activeGoals = [
    {
      id: "g1",
      title: "Auto-extract hooks from Podcast Episode #18",
      status: "In Progress",
      progress: 68,
      found: "4 high-potential moments detected",
      type: "CLIPPING",
    },
    {
      id: "g2",
      title: "Index audience questions from RAG tutorial comments",
      status: "Queued",
      progress: 0,
      found: "Pending execution",
      type: "AUDIENCE_INTEL",
    },
    {
      id: "g3",
      title: "Synthesize weekly content pattern updates into Creator Memory",
      status: "Completed",
      progress: 100,
      found: "3 new voice guidelines updated",
      type: "MEMORY",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <Bot className="w-3.5 h-3.5 text-red-500" />
            <span>Autonomous Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Creator Agent</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Task-based agent running continuously in the background to analyze, clip, and index your content.
          </p>
        </div>

        {/* Agent Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#17181B] border border-white/[0.08] text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
            <span className="text-zinc-200">{isRunning ? "Agent Active • Listening" : "Agent Paused"}</span>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Pause Agent" : "Resume Agent"}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Left Objectives, Right Execution Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Objectives (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Active Agent Tasks</h2>
                <p className="text-xs text-zinc-400 mt-0.5">High-priority background workflows</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-red-400 font-semibold hover:underline">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run New Task</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg bg-[#17181B] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                        {goal.type}
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-1.5">{goal.title}</h3>
                    </div>
                    <span
                      className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                        goal.status === "In Progress"
                          ? "bg-amber-950/40 text-amber-400 border border-amber-500/30"
                          : goal.status === "Completed"
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{goal.found}</span>
                      <span className="font-mono">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Agent Actions */}
          <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Trigger Quick Workflows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Scan Unused Footage", desc: "Find high-energy clips in raw files" },
                { title: "Refresh Hook Performance", desc: "Re-analyze top-retention hooks" },
                { title: "Cluster Audience Demands", desc: "Group recent comment questions" },
                { title: "Sync Creator Memory", desc: "Update voice rules from latest uploads" },
              ].map((act, idx) => (
                <button
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#17181B] border border-white/[0.06] hover:border-red-500/40 text-left space-y-1 transition-colors group"
                >
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>{act.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                  </div>
                  <div className="text-[11px] text-zinc-400">{act.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Execution Stream (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agent Audit Log</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                LIVE STREAM
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-[#17181B] border border-white/[0.04] space-y-1 hover:border-white/[0.1] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="text-red-400 font-semibold">[{act.type.toUpperCase()}]</span>
                    <span>{act.time}</span>
                  </div>
                  <p className="text-zinc-300 font-sans text-xs">{act.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] text-xs text-zinc-400 flex items-center justify-between font-mono">
            <span>Memory Version: 2.4.1</span>
            <span className="text-emerald-400">Zero model drift</span>
          </div>
        </div>
      </div>
    </div>
  );
}
