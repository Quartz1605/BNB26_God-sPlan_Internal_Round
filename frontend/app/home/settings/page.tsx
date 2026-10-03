"use client";

import React from "react";
import { Settings, User, Key, Bell, Shield } from "lucide-react";
import { creatorProfile } from "@/data/mockData";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b border-white/[0.06] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-1">
          <Settings className="w-3.5 h-3.5 text-red-500" />
          <span>System</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Creator profile, API keys, and autonomous agent parameters.</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-red-400" />
            <span>Creator Profile</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500">Name:</span>
              <div className="text-white font-semibold mt-0.5">{creatorProfile.name}</div>
            </div>
            <div>
              <span className="text-zinc-500">Handle:</span>
              <div className="text-white font-semibold mt-0.5">@{creatorProfile.handle}</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-white/[0.08] bg-[#111214] space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span>Model & Agent Configuration</span>
          </h2>
          <div className="text-xs text-zinc-400 space-y-2">
            <div className="flex justify-between py-2 border-b border-white/[0.04]">
              <span>Background Video Transcriber:</span>
              <span className="text-white font-mono">Whisper Large v3 (Local CUDA)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.04]">
              <span>Semantic Search Vector Engine:</span>
              <span className="text-white font-mono">Qdrant Embedded</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Creator Memory Sync Frequency:</span>
              <span className="text-white font-mono">Real-time post export</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
