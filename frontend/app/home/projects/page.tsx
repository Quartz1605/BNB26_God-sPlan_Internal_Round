"use client";

import React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { activeProjects } from "@/data/mockData";

export default function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <FolderKanban className="w-3.5 h-3.5 text-red-500" />
            <span>Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Projects</h1>
          <p className="text-sm text-zinc-400 mt-1">Video editing and podcast projects currently in progress.</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeProjects.map((p) => (
          <div key={p.id} className="p-5 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded">
                {p.type}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Last edit: {p.lastEdited}</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Status: {p.status} • {p.duration}</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Progress</span>
                <span className="font-mono">{p.progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
