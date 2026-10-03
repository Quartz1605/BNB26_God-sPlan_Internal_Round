"use client";

import React from "react";
import { FileText, Plus, Sparkles } from "lucide-react";

export default function ScriptsPage() {
  const scripts = [
    { title: "Building RAG Systems from Scratch", status: "In Production", wordCount: "2,450 words", topic: "AI Systems" },
    { title: "Why Most AI Agents Fail in 2026", status: "Published", wordCount: "1,890 words", topic: "AI Agents" },
    { title: "LangChain vs LlamaIndex Comparison", status: "Published", wordCount: "2,100 words", topic: "Frameworks" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>Script Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Scripts & Outlines</h1>
          <p className="text-sm text-zinc-400 mt-1">AI-assisted scripts tailored to your personal creator voice.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Script Draft</span>
        </button>
      </div>

      <div className="space-y-4">
        {scripts.map((script, idx) => (
          <div key={idx} className="p-5 rounded-xl border border-white/[0.08] bg-[#111214] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-semibold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                {script.topic}
              </span>
              <h3 className="text-base font-semibold text-white mt-1.5">{script.title}</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{script.wordCount} • Status: {script.status}</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-semibold text-red-400 hover:underline">
              Open Script Editor →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
