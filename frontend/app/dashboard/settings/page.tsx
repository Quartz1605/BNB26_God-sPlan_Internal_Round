"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  User,
  ShieldCheck,
  Server,
  Video,
  Keyboard,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Laptop
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [defaultAspect, setDefaultAspect] = useState("9:16");
  const [defaultPlatform, setDefaultPlatform] = useState("YouTube Shorts");
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error("Failed to load user info:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 py-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Studio Configuration</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your profile, backend system connectivity, and video studio defaults.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Profile & Services (1 Col) */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Creator Profile
            </span>
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#a91d22] text-white flex items-center justify-center font-bold text-base">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.name || "Connected Creator"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "Google Account Authenticated"}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Google OAuth 2.0 Active</span>
            </div>
          </div>

          {/* Engine Connectivity Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              System Services
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Server className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">FastAPI Backend</span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Video className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">Cloudinary Video S3</span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Ready
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700">
                  <Laptop className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">Deepgram Speech</span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Studio Defaults & Keyboard Shortcuts (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Studio Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Editor Defaults
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Production Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Default Aspect Ratio</h4>
                  <p className="text-[11px] text-slate-500">Target format for generated clips and project canvas</p>
                </div>
                <select
                  value={defaultAspect}
                  onChange={(e) => setDefaultAspect(e.target.value)}
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none focus:border-slate-400"
                >
                  <option value="9:16">9:16 (Shorts, Reels, TikTok)</option>
                  <option value="16:9">16:9 (Standard YouTube)</option>
                  <option value="1:1">1:1 (Square Feed)</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Default Target Channel</h4>
                  <p className="text-[11px] text-slate-500">Primary distribution network for AI prompt optimization</p>
                </div>
                <select
                  value={defaultPlatform}
                  onChange={(e) => setDefaultPlatform(e.target.value)}
                  className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium outline-none focus:border-slate-400"
                >
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="YouTube">YouTube Long-Form</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="TikTok">TikTok</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Auto-Save State</h4>
                  <p className="text-[11px] text-slate-500">Persist multi-track edits automatically to database</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="h-4 w-4 accent-[#a91d22] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Editor Shortcuts</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-700 shadow-xs">
                  Space
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Undo Action</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-700 shadow-xs">
                  Ctrl + Z
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Redo Action</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-700 shadow-xs">
                  Ctrl + Shift + Z
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">Scrub Timeline</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold text-slate-700 shadow-xs">
                  Drag Ruler
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
