"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Save, Play, Copy, TrendingUp, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { hooks } from "@/data/mockData";

const scoreColors: Record<string, string> = {
  "Very High": "text-emerald-400",
  High: "text-blue-400",
  Medium: "text-amber-400",
  Low: "text-white/30",
};

const scoreIndicator = (label: string) => {
  const map: Record<string, number> = { "Very High": 4, High: 3, Medium: 2, Low: 1 };
  const count = map[label] || 0;
  return Array.from({ length: 4 }, (_, i) => (
    <div
      key={i}
      className={`w-1 h-3 rounded-sm ${i < count ? scoreColors[label] : "bg-white/[0.08]"}`}
    />
  ));
};

export default function HookLabPage() {
  const [originalHook, setOriginalHook] = useState(hooks.original);
  const [variations, setVariations] = useState(hooks.variations);
  const [generating, setGenerating] = useState(false);
  const [savedHooks, setSavedHooks] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1800);
  };

  const handleSave = (text: string) => {
    setSavedHooks((prev) => (prev.includes(text) ? prev.filter((h) => h !== text) : [...prev, text]));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0B0D] text-white">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-1.5">
            AI Workspace
          </span>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white/90 tracking-tight">Hook Lab</h1>
              <p className="text-[13px] text-white/35 mt-0.5">
                Test and evolve your hooks. Better openings mean higher retention.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/25 bg-[#111214] px-3 py-1.5 rounded-lg border border-white/[0.06]">
              <Zap size={11} className="text-amber-400" />
              Based on 47 of your past hooks
            </div>
          </div>
        </div>

        {/* Original Hook Input */}
        <div className="mb-8">
          <label className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-3">
            Your Original Hook
          </label>
          <div className="bg-[#111214] border border-white/[0.08] rounded-2xl p-5 focus-within:border-white/20 transition-colors">
            <textarea
              value={originalHook}
              onChange={(e) => setOriginalHook(e.target.value)}
              className="w-full bg-transparent text-[15px] text-white/80 resize-none outline-none leading-relaxed placeholder-white/20 min-h-[64px]"
              placeholder="Enter your hook here..."
              rows={2}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 text-[11px] text-white/25">
                <span>{originalHook.length} chars</span>
                <span>·</span>
                <span>~{Math.round(originalHook.split(" ").length / 2.5)}s speaking</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B0B0D] rounded-lg text-[12px] font-semibold hover:bg-white/90 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {generating ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} />
                    Generate Variations
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Variations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
              Generated Variations
            </span>
            <span className="text-[11px] text-white/20">
              Scores are model estimates — not guaranteed metrics
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {variations.map((v, i) => (
                <motion.div
                  key={v.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#111214] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-colors group"
                >
                  {/* Hook text */}
                  <p className="text-[14px] text-white/80 leading-relaxed mb-5 font-medium group-hover:text-white transition-colors">
                    &ldquo;{v.text}&rdquo;
                  </p>

                  {/* Score grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {Object.entries(v.scores).map(([key, val]) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold tracking-widest uppercase text-white/25">
                          {key}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">{scoreIndicator(val)}</div>
                          <span className={`text-[10px] font-medium ${scoreColors[val] || "text-white/30"}`}>
                            {val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
                    <button
                      onClick={() => handleCopy(v.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/10 transition-colors"
                    >
                      <Copy size={10} />
                      {copied === v.text ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleSave(v.text)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                        savedHooks.includes(v.text)
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <Save size={10} />
                      {savedHooks.includes(v.text) ? "Saved" : "Save Hook"}
                    </button>
                    <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#0B0B0D] bg-white hover:bg-white/90 transition-colors">
                      Use in Script
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Hook performance reference */}
        <div className="bg-[#0E0F11] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={13} className="text-white/30" />
            <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
              Your Hook Performance History
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                type: "Contrarian",
                description: "Opens by challenging common beliefs",
                performance: "High early retention across 8 videos",
                color: "text-red-400",
                bar: 85,
              },
              {
                type: "Question-based",
                description: "Opens with a direct question to the audience",
                performance: "Strong click-through on tech topics",
                color: "text-blue-400",
                bar: 72,
              },
              {
                type: "Story-first",
                description: "Opens with a personal story or anecdote",
                performance: "Higher completion on long-form content",
                color: "text-amber-400",
                bar: 78,
              },
            ].map((h) => (
              <div key={h.type} className="p-4 rounded-xl bg-[#111214] border border-white/[0.05]">
                <span className={`text-[12px] font-bold ${h.color} block mb-1.5`}>{h.type}</span>
                <p className="text-[11px] text-white/35 mb-3">{h.description}</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.08] overflow-hidden">
                    <div className={`h-full rounded-full ${h.color} opacity-60`} style={{ width: `${h.bar}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{h.bar}%</span>
                </div>
                <p className="text-[10px] text-white/25 italic">{h.performance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
