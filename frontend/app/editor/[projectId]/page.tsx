"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Film,
  Music,
  Image as ImageIcon,
  Type,
  Layers,
  Upload,
} from "lucide-react";

interface Asset {
  _id: string;
  filename: string;
  file_url: string;
  asset_type: string;
  file_size: number;
}

export default function EditorPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"media" | "text" | "effects">("media");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [project, setProject] = useState<any>(null);

  // Authentication and project fetching check
  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) router.push("/");
      })
      .catch(() => router.push("/"));

    // Fetch Project
    fetch(`http://localhost:8000/projects/${projectId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProject(data))
      .catch((err) => console.error("Error fetching project:", err));

    // Fetch Assets
    fetch(`http://localhost:8000/projects/${projectId}/assets`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAssets(data);
      })
      .catch((err) => console.error("Error fetching assets:", err));
  }, [projectId, router]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e0e0e] text-white font-sans overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 bg-[#141414]">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate max-w-[200px]">
              {project ? project.name : "Loading..."}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              CreatorAI Editor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white" title="Undo (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white" title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#a91d22] hover:bg-[#c7262c] text-white text-sm font-medium rounded-md transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Tools/Tabs) */}
        <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 bg-[#141414]">
          <button
            onClick={() => setActiveTab("media")}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "media" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Media"
          >
            <Film className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "text" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Text & Titles"
          >
            <Type className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab("effects")}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === "effects" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
            }`}
            title="Transitions & Effects"
          >
            <Layers className="w-5 h-5" />
          </button>
        </aside>

        {/* Panel Content (Media Library) */}
        <div className="w-72 border-r border-gray-800 flex flex-col bg-[#111111] shrink-0">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide">
              {activeTab === "media" && "Project Media"}
              {activeTab === "text" && "Text Templates"}
              {activeTab === "effects" && "Effects"}
            </h2>
            {activeTab === "media" && (
              <button className="p-1 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
                <Upload className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "media" && (
              <div className="space-y-3">
                {assets.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">No assets uploaded yet</p>
                    <button className="text-xs text-[#a91d22] hover:text-[#c7262c]">Upload your first file</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {assets.map((asset) => (
                      <div key={asset._id} className="relative group cursor-pointer bg-gray-900 rounded-md overflow-hidden aspect-video border border-gray-800 hover:border-gray-600 transition-colors">
                        {asset.asset_type.startsWith("video") ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                            <Film className="w-6 h-6 text-gray-700" />
                          </div>
                        ) : asset.asset_type.startsWith("image") ? (
                          <img src={asset.file_url} alt={asset.filename} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                            <Music className="w-6 h-6 text-gray-700" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] truncate">{asset.filename}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab !== "media" && (
              <div className="text-center py-8 text-xs text-gray-600">
                Coming in next phase
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas / Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="aspect-video w-full max-w-4xl bg-[#111] rounded-lg shadow-2xl border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-gray-700 text-sm flex items-center gap-2">
                <Film className="w-5 h-5" /> Preview Canvas
              </span>
              
              {/* Future Video Element will go here */}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="h-12 border-t border-gray-800 bg-[#141414] flex items-center justify-center gap-4 px-4">
            <span className="text-xs font-mono text-gray-400 absolute left-4">00:00:00:00</span>
            
            <button className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 hover:bg-gray-700 bg-gray-800 rounded-full transition-colors text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-[1px]" />}
            </button>
            
            <button className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            
            <span className="text-xs font-mono text-gray-600 absolute right-4">00:05:32:15</span>
          </div>
        </div>
      </div>

      {/* Bottom Panel (Timeline) */}
      <div className="h-64 border-t border-gray-800 bg-[#111111] flex flex-col shrink-0">
        <div className="h-8 border-b border-gray-800 bg-[#141414] flex items-center px-4">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Timeline</span>
        </div>
        <div className="flex-1 flex">
          {/* Track Headers */}
          <div className="w-48 border-r border-gray-800 bg-[#161616] flex flex-col">
            <div className="h-14 border-b border-gray-800/50 flex items-center px-3 group">
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">V1</span>
            </div>
            <div className="h-14 border-b border-gray-800/50 flex items-center px-3 group">
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">A1</span>
            </div>
          </div>
          
          {/* Track Content (Ruler + Clips Placeholder) */}
          <div className="flex-1 bg-[#0f0f0f] relative overflow-hidden flex flex-col">
            <div className="h-6 border-b border-gray-800 bg-[#141414] opacity-50">
              {/* Time ruler ticks placeholder */}
            </div>
            
            {/* Playhead Line */}
            <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-[#a91d22] z-10">
              <div className="absolute -top-1 -left-[5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#a91d22]"></div>
            </div>
            
            {/* Tracks */}
            <div className="h-14 border-b border-gray-800/20 relative flex items-center">
              <div className="absolute left-[5%] right-[60%] h-10 top-2 bg-indigo-600/40 border border-indigo-500/60 rounded flex items-center px-2 cursor-pointer hover:bg-indigo-600/60 transition-colors">
                <span className="text-[10px] font-medium truncate">sample_video_1.mp4</span>
              </div>
            </div>
            <div className="h-14 border-b border-gray-800/20 relative flex items-center">
              <div className="absolute left-[5%] right-[60%] h-10 top-2 bg-emerald-600/30 border border-emerald-500/40 rounded flex items-center px-2 cursor-pointer hover:bg-emerald-600/50 transition-colors">
                <span className="text-[10px] font-medium truncate">audio waveform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
