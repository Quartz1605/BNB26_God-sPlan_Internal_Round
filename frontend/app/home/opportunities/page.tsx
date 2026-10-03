"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Archive, RefreshCw, ChevronRight, ArrowRight, Eye } from "lucide-react";
import { opportunities, unusedContent, audienceQuestions } from "@/data/mockData";

const urgencyConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "High Priority" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Worth Doing" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "When Ready" },
};

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "unused" | "audience">("ai");

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0B0D] text-white">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-1.5">
            Intelligence
          </span>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white/90 tracking-tight flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-400" />
                Content Opportunities
              </h1>
              <p className="text-[13px] text-white/35 mt-1">
                CreatorAI surfaces what your content is missing — and how to fill those gaps.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-bold text-amber-400">37</div>
              <div className="text-[11px] text-white/25">opportunities detected</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#111214] border border-white/[0.06] p-1 rounded-xl w-fit">
          {(["ai", "unused", "audience"] as const).map((tab) => {
            const labels = { ai: "AI Discoveries", unused: "Unused Content", audience: "Audience Demand" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab: AI Discoveries */}
        {activeTab === "ai" && (
          <div className="flex flex-col gap-5">
            {opportunities.map((opp, i) => {
              const config = urgencyConfig[opp.urgency];
              return (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0E0F11] border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-[15px] font-medium text-white/85 leading-relaxed max-w-2xl">
                      &ldquo;{opp.title}&rdquo;
                    </h3>
                    <span
                      className={`text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg border flex-shrink-0 ml-4 ${config.color} ${config.bg} ${config.border}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Evidence */}
                  <div className="mb-4">
                    <span className="text-[9px] font-bold tracking-widest text-white/20 uppercase block mb-2">Evidence</span>
                    <div className="flex flex-wrap gap-2">
                      {opp.evidence.map((ev) => (
                        <span
                          key={ev}
                          className="text-[11px] text-white/45 bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.06]"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[12px] text-white/35 italic mb-5 border-l-2 border-white/10 pl-3">
                    {opp.opportunity}
                  </p>

                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2 bg-white text-[#0B0B0D] rounded-lg text-[12px] font-bold hover:bg-white/90 transition-colors">
                      {opp.action}
                    </button>
                    {opp.estimatedViews && (
                      <div className="flex items-center gap-1.5 text-[11px] text-white/25">
                        <TrendingUp size={11} />
                        Estimated reach: {opp.estimatedViews} views
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tab: Unused Content */}
        {activeTab === "unused" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] text-white/40">
                127 unused moments detected across your content history
              </p>
              <button className="flex items-center gap-1.5 text-[12px] text-amber-400/70 hover:text-amber-400 transition-colors border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/10">
                <Archive size={12} />
                Batch Recover
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {unusedContent.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-4 bg-[#0E0F11] border border-white/[0.06] rounded-2xl hover:border-white/10 transition-colors group cursor-pointer"
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.thumbnail})` }}
                    />
                    <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white/80">
                      {item.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/30 mb-1.5">From: {item.source}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.topics.map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/70 border border-amber-500/15">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/40 flex items-center gap-1 mb-3">
                      <ArrowRight size={9} />
                      {item.suggestedUse}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-[10px] text-white/40 hover:text-white/70 border border-white/[0.06] hover:bg-white/[0.09] transition-colors">
                        Preview
                      </button>
                      <button className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-[10px] text-amber-400 border border-amber-500/15 hover:bg-amber-500/20 transition-colors">
                        Use This
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-shrink-0">
                    <div className="text-[14px] font-bold text-amber-400">{item.quality}</div>
                    <div className="text-[9px] text-white/20">quality</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Audience Demand */}
        {activeTab === "audience" && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-white/35 mb-2">
              Questions your audience is asking — with no existing answer in your library.
            </p>
            {audienceQuestions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 bg-[#0E0F11] border border-white/[0.06] rounded-2xl hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-[14px] font-medium text-white/80 leading-relaxed">
                    &ldquo;{q.question}&rdquo;
                  </h3>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[18px] font-bold text-white/70">{q.mentions}</span>
                    <span className="text-[9px] text-white/25">mentions</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4 text-[11px] text-white/30">
                  <span>{q.relatedVideos} related videos in your library</span>
                  {q.hasAnswer ? (
                    <span className="text-emerald-400/70 border border-emerald-500/20 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-bold uppercase tracking-widest">
                      Answered
                    </span>
                  ) : (
                    <span className="text-red-400/70 border border-red-500/20 px-2 py-0.5 rounded-md bg-red-500/10 text-[9px] font-bold uppercase tracking-widest">
                      Gap
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-white text-[#0B0B0D] rounded-lg font-semibold hover:bg-white/90 transition-colors">
                    Create Content
                    <ArrowRight size={11} />
                  </button>
                  <button className="px-3 py-1.5 text-[12px] text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors">
                    View Related
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
