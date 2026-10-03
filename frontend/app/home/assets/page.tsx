"use client";

import React from "react";
import { Folder, HardDrive, Upload } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
            <Folder className="w-3.5 h-3.5 text-red-500" />
            <span>Media Assets</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Raw Footage & Assets</h1>
          <p className="text-sm text-zinc-400 mt-1">1.2 TB indexed media vault (184 raw video & audio files).</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-sm">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Raw Footage</span>
        </button>
      </div>

      <div className="p-8 rounded-xl border border-white/[0.08] bg-[#111214] text-center space-y-3">
        <HardDrive className="w-8 h-8 text-zinc-500 mx-auto" />
        <h3 className="text-sm font-semibold text-white">Media Vault Synchronized</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          All uploaded raw files are automatically transcribed, scene-segmented, and audio-cleaned in the background.
        </p>
      </div>
    </div>
  );
}
