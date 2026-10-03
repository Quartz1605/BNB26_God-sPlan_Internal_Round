"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Video,
  Plus,
} from "lucide-react";
import { audienceQuestions } from "@/data/mockData";

export default function AudiencePage() {
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "UNANSWERED" | "ANSWERED">("UNANSWERED");

  const filteredQuestions = audienceQuestions.filter((q) => {
    if (selectedFilter === "UNANSWERED") return !q.hasAnswer;
    if (selectedFilter === "ANSWERED") return q.hasAnswer;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <Users className="w-3.5 h-3.5 text-red-500" />
            <span>Audience Demand Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audience Intelligence</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Cluster recurring subscriber questions and extract high-demand video topic ideas.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-[#17181B] p-1 rounded-lg border border-white/[0.08] text-xs font-medium">
          {(["UNANSWERED", "ALL", "ANSWERED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedFilter === filter
                  ? "bg-zinc-800 text-white shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {filter === "UNANSWERED" ? "Unanswered Demand" : filter === "ANSWERED" ? "Covered Topics" : "All Questions"}
            </button>
          ))}
        </div>
      </div>

      {/* Audience KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Unanswered Questions</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">100+</div>
          <div className="text-xs text-zinc-400 mt-1">Across 8 recent video comments</div>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Top Requested Theme</span>
            <Sparkles className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold text-white">LangGraph & RAG</div>
          <div className="text-xs text-red-400 mt-1">31 unique subscriber requests</div>
        </div>

        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111214]">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Sentiment Profile</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">92%</div>
          <div className="text-xs text-emerald-400 mt-1">Technical curiosity & trust</div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="text-base font-semibold text-white">Extracted Audience Questions</h2>
          <span className="text-xs font-mono text-zinc-400">{filteredQuestions.length} items shown</span>
        </div>

        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-lg bg-[#17181B] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                    {q.mentions} mentions
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Related to {q.relatedVideos} videos</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{q.question}</h3>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Script</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
