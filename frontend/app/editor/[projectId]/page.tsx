"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Loader2,
  CheckCircle2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Asset {
  _id: string;
  filename: string;
  file_url: string;
  asset_type: string;
  file_size: number;
}

const API_BASE = "http://localhost:8000";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00:00.0";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
}

export default function EditorPage() {
  const { projectId } = useParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"media" | "text" | "effects">("media");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [project, setProject] = useState<any>(null);

  // Editor State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<"start" | "end" | "playhead" | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Initial Fetch
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) router.push("/");
      })
      .catch(() => router.push("/"));

    fetch(`${API_BASE}/projects/${projectId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProject(data))
      .catch((err) => console.error("Error fetching project:", err));

    fetch(`${API_BASE}/projects/${projectId}/assets`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAssets(data);
      })
      .catch((err) => console.error("Error fetching assets:", err));
  }, [projectId, router]);

  // Load Asset
  const handleSelectAsset = async (asset: Asset) => {
    if (!asset.asset_type.startsWith("video")) {
      setError("Only video assets can be loaded in the timeline for now.");
      return;
    }
    setError(null);
    setSelectedAsset(asset);
    setVideoUrl("");
    setVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    setCurrentTime(0);
    setIsPlaying(false);
    
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/assets/${asset._id}/presigned-url`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setVideoUrl(data.url);
      }
    } catch (err) {
      console.error("Failed to load presigned URL", err);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration);
    setTrimEnd(video.duration);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (isPlaying && video.currentTime >= trimEnd) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = trimStart;
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [isPlaying, trimStart, trimEnd]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime < trimStart || video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const getTimeFromPosition = useCallback((clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline || videoDuration === 0) return 0;
    const rect = timeline.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * videoDuration;
  }, [videoDuration]);

  const handleTimelineMouseDown = (e: React.MouseEvent, type: "start" | "end" | "playhead") => {
    if (!selectedAsset) return;
    e.preventDefault();
    setIsDragging(type);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      if (isDragging === "start") {
        setTrimStart(Math.max(0, Math.min(time, trimEnd - 1)));
      } else if (isDragging === "end") {
        setTrimEnd(Math.min(videoDuration, Math.max(time, trimStart + 1)));
      } else if (isDragging === "playhead") {
        seekTo(time);
      }
    };
    const handleMouseUp = () => setIsDragging(null);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, trimStart, trimEnd, videoDuration, getTimeFromPosition]);

  const handleExport = async () => {
    if (!selectedAsset) return;
    setIsExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/assets/${selectedAsset._id}/clips`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: Math.round(trimStart * 10) / 10,
          end: Math.round(trimEnd * 10) / 10,
          title: `Clip from ${selectedAsset.filename}`,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Export failed");
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
      
      // refresh assets
      fetch(`${API_BASE}/projects/${projectId}/assets`, { credentials: "include" })
        .then(res => res.json())
        .then(data => { if(Array.isArray(data)) setAssets(data); });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const trimDuration = Math.max(0, trimEnd - trimStart);
  const startPercent = videoDuration > 0 ? (trimStart / videoDuration) * 100 : 0;
  const endPercent = videoDuration > 0 ? (trimEnd / videoDuration) * 100 : 100;
  const playheadPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

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
          {error && <span className="text-xs text-red-400">{error}</span>}
          {exportSuccess && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Exported!</span>}
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExport}
            disabled={!selectedAsset || isExporting || trimDuration < 1}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#a91d22] hover:bg-[#c7262c] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Clip
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-16 border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 bg-[#141414]">
          <button onClick={() => setActiveTab("media")} className={`p-2.5 rounded-xl transition-all ${activeTab === "media" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}><Film className="w-5 h-5" /></button>
          <button onClick={() => setActiveTab("text")} className={`p-2.5 rounded-xl transition-all ${activeTab === "text" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}><Type className="w-5 h-5" /></button>
          <button onClick={() => setActiveTab("effects")} className={`p-2.5 rounded-xl transition-all ${activeTab === "effects" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}><Layers className="w-5 h-5" /></button>
        </aside>

        {/* Media Library */}
        <div className="w-72 border-r border-gray-800 flex flex-col bg-[#111111] shrink-0">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide">
              {activeTab === "media" ? "Project Media" : "Coming Soon"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "media" && (
              <div className="space-y-3">
                {assets.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">No assets uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {assets.map((asset) => (
                      <div 
                        key={asset._id} 
                        onClick={() => handleSelectAsset(asset)}
                        className={`relative group cursor-pointer bg-gray-900 rounded-md overflow-hidden aspect-video border transition-colors ${selectedAsset?._id === asset._id ? "border-[#a91d22]" : "border-gray-800 hover:border-gray-600"}`}
                      >
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
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="aspect-video w-full max-w-4xl bg-[#111] rounded-lg shadow-2xl border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                  muted={isMuted}
                  playsInline
                />
              ) : (
                <span className="text-gray-700 text-sm flex items-center gap-2">
                  <Film className="w-5 h-5" /> Select a video to start editing
                </span>
              )}
            </div>
          </div>

          <div className="h-12 border-t border-gray-800 bg-[#141414] flex items-center justify-center gap-4 px-4 relative">
            <span className="text-xs font-mono text-gray-400 absolute left-4">{formatTime(currentTime)}</span>
            
            <button onClick={() => seekTo(trimStart)} className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button onClick={togglePlay} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-[1px]" />}
            </button>
            <button onClick={() => seekTo(trimEnd)} className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white absolute right-24">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs font-mono text-gray-600 absolute right-4">{formatTime(videoDuration)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="h-64 border-t border-gray-800 bg-[#111111] flex flex-col shrink-0">
        <div className="h-8 border-b border-gray-800 bg-[#141414] flex items-center px-4 justify-between">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Timeline</span>
          {selectedAsset && <span className="text-[10px] text-gray-500 font-mono">Selection: {formatTime(trimStart)} - {formatTime(trimEnd)} ({trimDuration.toFixed(1)}s)</span>}
        </div>
        <div className="flex-1 flex">
          <div className="w-48 border-r border-gray-800 bg-[#161616] flex flex-col">
            <div className="h-14 border-b border-gray-800/50 flex items-center px-3"><span className="text-xs text-gray-400">V1 - Video</span></div>
            <div className="h-14 border-b border-gray-800/50 flex items-center px-3"><span className="text-xs text-gray-400">A1 - Audio</span></div>
          </div>
          
          <div 
            ref={timelineRef}
            className="flex-1 bg-[#0f0f0f] relative overflow-hidden flex flex-col cursor-crosshair"
            onMouseDown={(e) => handleTimelineMouseDown(e, "playhead")}
          >
            <div className="h-6 border-b border-gray-800 bg-[#141414] opacity-50 relative">
              {/* Simple ruler ticks */}
            </div>
            
            {/* Playhead */}
            <div className="absolute top-0 bottom-0 w-[1px] bg-[#a91d22] z-30 pointer-events-none" style={{ left: `${playheadPercent}%` }}>
              <div className="absolute -top-1 -left-[5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#a91d22]"></div>
            </div>
            
            {/* Tracks */}
            <div className="h-14 border-b border-gray-800/20 relative flex items-center">
              {selectedAsset && videoDuration > 0 && (
                <>
                  <div className="absolute left-0 right-0 h-10 top-2 bg-indigo-900/30 border border-indigo-800/50 rounded flex items-center px-2">
                    <span className="text-[10px] text-gray-500 truncate">{selectedAsset.filename} (Source)</span>
                  </div>
                  <div 
                    className="absolute h-10 top-2 bg-indigo-600/60 border border-indigo-400 rounded cursor-move"
                    style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                  >
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] text-white/90 truncate pointer-events-none">{selectedAsset.filename}</span>
                  </div>
                  {/* Trim Handles */}
                  <div
                    className="absolute top-2 h-10 w-2 bg-white/80 cursor-ew-resize z-20 hover:bg-white transition-colors rounded-l"
                    style={{ left: `calc(${startPercent}% - 0px)` }}
                    onMouseDown={(e) => { e.stopPropagation(); handleTimelineMouseDown(e, "start"); }}
                  />
                  <div
                    className="absolute top-2 h-10 w-2 bg-white/80 cursor-ew-resize z-20 hover:bg-white transition-colors rounded-r"
                    style={{ left: `calc(${endPercent}% - 2px)` }}
                    onMouseDown={(e) => { e.stopPropagation(); handleTimelineMouseDown(e, "end"); }}
                  />
                </>
              )}
            </div>
            <div className="h-14 border-b border-gray-800/20 relative flex items-center">
              {selectedAsset && videoDuration > 0 && (
                <div 
                  className="absolute h-10 top-2 bg-emerald-600/40 border border-emerald-500/50 rounded pointer-events-none"
                  style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                >
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] text-white/60 truncate pointer-events-none">Audio</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
