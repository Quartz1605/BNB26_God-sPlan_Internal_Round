"use client";

import React from "react";
import { Bookmark, Plus } from "lucide-react";
import { smartCollections } from "@/data/mockData";

export default function CollectionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <Bookmark className="w-3.5 h-3.5 text-red-500" />
            <span>Organization</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Collections</h1>
          <p className="text-sm text-zinc-400 mt-1">Rule-based dynamic clip collections.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {smartCollections.map((sc) => (
          <div key={sc.id} className="p-4 rounded-xl border border-white/[0.08] bg-[#111214] hover:border-white/[0.16] transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sc.color }} />
              <span className="text-xs font-mono text-zinc-400">{sc.count} items</span>
            </div>
            <h3 className="text-sm font-semibold text-white">{sc.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
