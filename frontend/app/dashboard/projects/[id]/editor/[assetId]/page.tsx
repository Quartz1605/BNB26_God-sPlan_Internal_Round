"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Loader2,
  Scissors,
  CheckCircle2,
  Volume2,
  VolumeX,
  Film,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
}

export default function ClipEditorPage({
  params,
}: {
  params: Promise<{ id: string; assetId: string }>;
}) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  const assetId = unwrappedParams.assetId;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial clip params from URL
  const initialStart = parseFloat(searchParams.get("start") || "0");
  const initialEnd = parseFloat(searchParams.get("end") || "0");
  const clipTitle = searchParams.get("title") || "Untitled Clip";

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [trimStart, setTrimStart] = useState(initialStart);
  const [trimEnd, setTrimEnd] = useState(initialEnd);
  const [isDragging, setIsDragging] = useState<"start" | "end" | "playhead" | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch presigned URL
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) router.push("/");
      })
      .catch(() => router.push("/"));

    fetch(`${API_BASE}/projects/${projectId}/assets/${assetId}/presigned-url`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setVideoUrl(data.url))
      .catch((err) => console.error("Failed to get video URL:", err));
  }, [projectId, assetId, router]);

  // Video loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration);

    // If no end was specified, default to min(start+30, duration)
    if (initialEnd === 0 && video.duration > 0) {
      setTrimEnd(Math.min(initialStart + 30, video.duration));
    }

    // Seek to trim start
    video.currentTime = trimStart;
  };

  // Time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Stop at trim end during playback
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
    if (!video) return;

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

  // Timeline interaction
  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      const timeline = timelineRef.current;
      if (!timeline || videoDuration === 0) return 0;

      const rect = timeline.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * videoDuration;
    },
    [videoDuration]
  );

  const handleTimelineMouseDown = (e: React.MouseEvent, type: "start" | "end" | "playhead") => {
    e.preventDefault();
    setIsDragging(type);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);

      if (isDragging === "start") {
        setTrimStart(Math.max(0, Math.min(time, trimEnd - 2)));
      } else if (isDragging === "end") {
        setTrimEnd(Math.min(videoDuration, Math.max(time, trimStart + 2)));
      } else if (isDragging === "playhead") {
        seekTo(time);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, trimStart, trimEnd, videoDuration, getTimeFromPosition]);

  // Export
  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setExportSuccess(false);

    try {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/assets/${assetId}/clips`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start: Math.round(trimStart * 10) / 10,
            end: Math.round(trimEnd * 10) / 10,
            title: clipTitle,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Export failed");
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const trimDuration = trimEnd - trimStart;
  const startPercent = videoDuration > 0 ? (trimStart / videoDuration) * 100 : 0;
  const endPercent = videoDuration > 0 ? (trimEnd / videoDuration) * 100 : 100;
  const playheadPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0e0e0e] text-white font-sans overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 bg-[#141414]">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/projects/${projectId}/assets/${assetId}`}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate max-w-[300px]">
              {clipTitle}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              CreatorAI Clip Editor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {exportSuccess && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm mr-2">
              <CheckCircle2 className="w-4 h-4" />
              Clip exported!
            </div>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting || trimDuration < 2}
            className="flex items-center gap-2 px-5 py-1.5 bg-[#a91d22] hover:bg-[#c7262c] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting..." : "Export Clip"}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Trim Controls */}
        <aside className="w-72 border-r border-gray-800 bg-[#111111] shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-sm font-medium uppercase tracking-wide flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#a91d22]" />
              Trim Controls
            </h2>
          </div>

          <div className="p-4 space-y-6 flex-1">
            {/* Start Time */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                Start Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={trimStart}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTrimStart(Math.min(val, trimEnd - 2));
                    seekTo(val);
                  }}
                  className="flex-1 accent-[#a91d22]"
                />
                <span className="text-xs font-mono text-gray-300 w-16 text-right">
                  {formatTime(trimStart)}
                </span>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                End Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={trimEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTrimEnd(Math.max(val, trimStart + 2));
                  }}
                  className="flex-1 accent-[#a91d22]"
                />
                <span className="text-xs font-mono text-gray-300 w-16 text-right">
                  {formatTime(trimEnd)}
                </span>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-gray-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Clip Duration</span>
                <span className="text-white font-mono font-medium">
                  {formatTime(trimDuration)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Selection</span>
                <span className="text-gray-300 font-mono">
                  {formatTime(trimStart)} → {formatTime(trimEnd)}
                </span>
              </div>
              {videoDuration > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Source Duration</span>
                  <span className="text-gray-400 font-mono">{formatTime(videoDuration)}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  seekTo(trimStart);
                }}
                className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors text-left"
              >
                ↳ Jump to Start
              </button>
              <button
                onClick={() => {
                  seekTo(trimEnd);
                }}
                className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors text-left"
              >
                ↳ Jump to End
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 border-t border-gray-800">
              <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3 text-xs text-red-300">
                {error}
              </div>
            </div>
          )}
        </aside>

        {/* Center Canvas / Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl relative">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full aspect-video object-contain rounded-lg shadow-2xl"
                  onLoadedMetadata={handleLoadedMetadata}
                  muted={isMuted}
                  playsInline
                />
              ) : (
                <div className="w-full aspect-video bg-[#111] rounded-lg shadow-2xl border border-gray-800/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-700 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="h-12 border-t border-gray-800 bg-[#141414] flex items-center justify-center gap-4 px-4">
            <span className="text-xs font-mono text-gray-400 absolute left-4">
              {formatTime(currentTime)}
            </span>

            <button
              onClick={() => seekTo(trimStart)}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 hover:bg-gray-700 bg-gray-800 rounded-full transition-colors text-white"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={() => seekTo(trimEnd)}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white absolute right-16"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-xs font-mono text-gray-600 absolute right-4">
              {formatTime(videoDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Panel (Timeline) */}
      <div className="h-48 border-t border-gray-800 bg-[#111111] flex flex-col shrink-0">
        <div className="h-8 border-b border-gray-800 bg-[#141414] flex items-center px-4 justify-between">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Timeline
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            Clip: {formatTime(trimStart)} → {formatTime(trimEnd)} ({trimDuration.toFixed(1)}s)
          </span>
        </div>

        <div className="flex-1 flex">
          {/* Track Headers */}
          <div className="w-48 border-r border-gray-800 bg-[#161616] flex flex-col">
            <div className="h-14 border-b border-gray-800/50 flex items-center px-3">
              <span className="text-xs text-gray-400">Source Video</span>
            </div>
            <div className="h-14 border-b border-gray-800/50 flex items-center px-3">
              <span className="text-xs text-gray-400">Selection</span>
            </div>
          </div>

          {/* Track Content */}
          <div
            ref={timelineRef}
            className="flex-1 bg-[#0f0f0f] relative overflow-hidden flex flex-col cursor-crosshair select-none"
            onMouseDown={(e) => handleTimelineMouseDown(e, "playhead")}
          >
            {/* Time ruler */}
            <div className="h-6 border-b border-gray-800 bg-[#141414] flex items-end px-1">
              {videoDuration > 0 &&
                Array.from({ length: Math.min(Math.ceil(videoDuration / 10), 30) }, (_, i) => {
                  const time = i * 10;
                  const pct = (time / videoDuration) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute text-[9px] text-gray-600 font-mono"
                      style={{ left: `${pct}%`, bottom: 2 }}
                    >
                      {formatTime(time)}
                    </div>
                  );
                })}
            </div>

            {/* Source video track */}
            <div className="h-14 border-b border-gray-800/20 relative flex items-center">
              <div className="absolute left-0 right-0 h-10 top-2 bg-indigo-600/20 border border-indigo-500/30 rounded mx-1">
                {/* Full source video representation */}
              </div>
            </div>

            {/* Selection track */}
            <div className="h-14 border-b border-gray-800/20 relative flex items-center">
              {/* Dimmed outside region */}
              <div
                className="absolute top-2 left-0 h-10 bg-gray-900/60"
                style={{ width: `${startPercent}%` }}
              />
              <div
                className="absolute top-2 right-0 h-10 bg-gray-900/60"
                style={{ width: `${100 - endPercent}%` }}
              />

              {/* Selected region */}
              <div
                className="absolute top-2 h-10 bg-[#a91d22]/30 border border-[#a91d22]/60 rounded cursor-move"
                style={{
                  left: `${startPercent}%`,
                  width: `${endPercent - startPercent}%`,
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/70 font-medium">
                  {clipTitle}
                </span>
              </div>

              {/* Start handle */}
              <div
                className="absolute top-1 bottom-1 w-2 bg-emerald-500 rounded-sm cursor-ew-resize z-20 hover:bg-emerald-400 transition-colors"
                style={{ left: `calc(${startPercent}% - 4px)` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleTimelineMouseDown(e, "start");
                }}
              />

              {/* End handle */}
              <div
                className="absolute top-1 bottom-1 w-2 bg-rose-500 rounded-sm cursor-ew-resize z-20 hover:bg-rose-400 transition-colors"
                style={{ left: `calc(${endPercent}% - 4px)` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleTimelineMouseDown(e, "end");
                }}
              />
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white z-30 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="absolute -top-0 -left-[5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
