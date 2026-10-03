"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitFork,
  Layers,
  Sparkles,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Zap,
  Tag,
  Video,
  Scissors,
  HelpCircle,
  X,
} from "lucide-react";
import { videos, unusedContent, audienceQuestions } from "@/data/mockData";

export default function ContentGraphPage() {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "VIDEO" | "CLIP" | "QUESTION">("ALL");

  // Build nodes for the interactive graph
  const nodes = [
    // Videos (Sources)
    ...videos.map((v) => ({
      id: v.id,
      type: "VIDEO",
      label: v.title,
      sub: `${v.views} views • ${v.duration}`,
      thumbnail: v.thumbnail,
      topics: v.topics,
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
      color: "#EF4444",
    })),
    // Unused Clips
    ...unusedContent.map((uc) => ({
      id: uc.id,
      type: "CLIP",
      label: `Clip from ${uc.source}`,
      sub: `${uc.duration} • Score ${uc.quality}/10`,
      thumbnail: uc.thumbnail,
      topics: uc.topics,
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
      color: "#F59E0B",
    })),
    // Audience Questions
    ...audienceQuestions.map((aq) => ({
      id: aq.id,
      type: "QUESTION",
      label: aq.question,
      sub: `${aq.mentions} mentions`,
      thumbnail: null,
      topics: ["Audience Demand"],
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
      color: "#3B82F6",
    })),
  ];

  const filteredNodes = nodes.filter((n) => filterType === "ALL" || n.type === filterType);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <GitFork className="w-3.5 h-3.5 text-red-500" />
            <span>Semantic Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Content Genealogy Graph</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Interactive map connecting long-form videos, derivative shorts, unused clips, and audience demand.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 bg-[#17181B] p-1 rounded-lg border border-white/[0.08] text-xs font-medium">
          {[
            { id: "ALL", label: "All Nodes" },
            { id: "VIDEO", label: "Videos" },
            { id: "CLIP", label: "Clips" },
            { id: "QUESTION", label: "Audience Demand" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === tab.id
                  ? "bg-zinc-800 text-white shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Visual Sandbox */}
      <div className="relative w-full h-[520px] rounded-xl border border-white/[0.08] bg-[#0E0F11] overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#17181B]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{filteredNodes.length} Active Nodes • Click node to inspect context</span>
        </div>

        {/* Visual connections SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {filteredNodes.map((n, idx) => {
            const nextNode = filteredNodes[(idx + 3) % filteredNodes.length];
            return (
              <line
                key={`line-${n.id}-${idx}`}
                x1={`${n.x}%`}
                y1={`${n.y}%`}
                x2={`${nextNode.x}%`}
                y2={`${nextNode.y}%`}
                stroke={n.color}
                strokeOpacity="0.15"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        {/* Nodes Canvas */}
        <div className="relative w-full h-full p-8">
          {filteredNodes.map((node) => (
            <motion.div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.15, zIndex: 30 }}
              className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`p-2.5 rounded-xl border bg-[#17181B] shadow-lg backdrop-blur-xs flex items-center gap-2 max-w-[200px] transition-all ${
                  selectedNode?.id === node.id
                    ? "ring-2 ring-red-500 border-red-500"
                    : "border-white/[0.12] hover:border-white/[0.3]"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                  style={{ backgroundColor: `${node.color}20`, color: node.color }}
                >
                  {node.type === "VIDEO" && <Video className="w-3.5 h-3.5" />}
                  {node.type === "CLIP" && <Scissors className="w-3.5 h-3.5" />}
                  {node.type === "QUESTION" && <HelpCircle className="w-3.5 h-3.5" />}
                </div>

                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-white truncate">{node.label}</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">{node.sub}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color }}
                >
                  {selectedNode.type}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedNode.label}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{selectedNode.sub}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedNode.topics?.map((topic: string) => (
                <span
                  key={topic}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#17181B] border border-white/[0.08] text-zinc-300 font-medium"
                >
                  #{topic}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span>Connected Derivatives: 4 shorts • 2 unused hooks</span>
              <button className="flex items-center gap-1 text-red-400 font-semibold hover:underline">
                <span>View Full Lineage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
