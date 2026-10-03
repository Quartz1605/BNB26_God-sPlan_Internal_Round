"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Undo2, Redo2, Download, Play, Pause, SkipBack, SkipForward,
  Settings, Film, Music, Image as ImageIcon, Type, Layers, Upload, Plus, Save, Sparkles, Send, Diamond
} from "lucide-react";
import { useEditorStore } from "./store";
import { Timeline } from "./Timeline";
import { Canvas } from "./Canvas";
import { Inspector } from "./Inspector";
import { AiAssistantPanel } from "./AiAssistantPanel";

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
  const [activeTab, setActiveTab] = useState<"media" | "text" | "effects" | "ai">("media");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [project, setProject] = useState<any>(null);

  const { 
    playhead, 
    isPlaying, 
    setIsPlaying, 
    setPlayhead, 
    undo, 
    redo,
    history,
    addClip,
    tracks,
    clips,
    settings,
    setEditorState,
    addTimelineKeyframe
  } = useEditorStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Format time helper for the preview area
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => { if (!res.ok) router.push("/"); })
      .catch(() => router.push("/"));

    fetch(`http://localhost:8000/projects/${projectId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        if (data.state) {
          setEditorState(data.state);
        }
      })
      .catch(console.error);

    fetch(`http://localhost:8000/projects/${projectId}/assets`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAssets(data);
          
          // Update clips with fresh presigned URLs to prevent expiration issues
          const currentClips = useEditorStore.getState().clips;
          let needsUpdate = false;
          const updatedClips = currentClips.map(clip => {
            if (clip.assetId) {
              const freshAsset = data.find((a: any) => a._id === clip.assetId);
              if (freshAsset && freshAsset.file_url !== clip.fileUrl) {
                needsUpdate = true;
                return { ...clip, fileUrl: freshAsset.file_url };
              }
            }
            return clip;
          });
          
          if (needsUpdate) {
            setEditorState({ clips: updatedClips });
          }
        }
      })
      .catch(console.error);
  }, [projectId, router]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canRedo) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const { selectedClipIds, removeClip } = useEditorStore.getState();
        if (selectedClipIds.length > 0) {
          e.preventDefault();
          selectedClipIds.forEach(id => removeClip(id));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const handleAddAssetToTimeline = (asset: Asset) => {
    // Determine track based on asset type
    const isAudio = asset.asset_type.startsWith('audio');
    const isVideo = asset.asset_type.startsWith('video');
    const track = tracks.find(t => isAudio ? t.type === 'audio' : t.type === 'video');
    
    if (track) {
      if (isVideo || isAudio) {
        // Fetch actual duration dynamically before adding to timeline
        const mediaElement = isVideo ? document.createElement('video') : document.createElement('audio');
        mediaElement.preload = 'metadata';
        mediaElement.onloadedmetadata = () => {
          const duration = mediaElement.duration && isFinite(mediaElement.duration) ? mediaElement.duration : 5;
          addClip({
            assetId: asset._id,
            trackId: track.id,
            startTime: playhead,
            duration: duration,
            sourceStart: 0,
            sourceEnd: duration,
            name: asset.filename,
            type: isAudio ? 'audio' : 'video',
            fileUrl: asset.file_url
          });
        };
        mediaElement.onerror = () => {
          // Fallback if metadata fails to load
          addClip({
            assetId: asset._id,
            trackId: track.id,
            startTime: playhead,
            duration: 5,
            sourceStart: 0,
            sourceEnd: 5,
            name: asset.filename,
            type: isAudio ? 'audio' : 'video',
            fileUrl: asset.file_url
          });
        };
        mediaElement.src = asset.file_url;
      } else {
        // For images or unknown types, fallback to 5 seconds
        addClip({
          assetId: asset._id,
          trackId: track.id,
          startTime: playhead,
          duration: 5,
          sourceStart: 0,
          sourceEnd: 5,
          name: asset.filename,
          type: 'image',
          fileUrl: asset.file_url
        });
      }
    }
  };

  const handleAddTextToTimeline = () => {
    const textTrack = tracks.find(t => t.type === 'text') || tracks[0];
    addClip({
      assetId: "text-asset",
      trackId: textTrack.id,
      startTime: playhead,
      duration: 3,
      sourceStart: 0,
      sourceEnd: 3,
      name: "Basic Text",
      type: "text",
      textContent: "New Text Clip",
      fontSize: 48,
      color: "#ffffff"
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const stateToSave = { tracks, clips, settings };
      const res = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateToSave }),
        credentials: "include"
      });
      if (res.ok) {
        // Just silent success or small notification
        console.log("Project saved successfully!");
      } else {
        alert("Failed to save project");
      }
    } catch (err) {
      console.error("Save error", err);
      alert("Error saving project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    // Save first
    await handleSave();
    
    setIsExporting(true);
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/export`, {
        method: "POST",
        credentials: "include"
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsExporting(false);
        const shouldDownload = window.confirm("Export Complete! Click OK to open your exported video.");
        if (shouldDownload && data.export_url) {
          // Setting location.href avoids popup blockers better than window.open in some async contexts
          window.location.href = data.export_url;
        }
      } else {
        alert("Failed to export project");
        setIsExporting(false);
      }
    } catch (err) {
      console.error("Export error", err);
      alert("Error exporting project");
      setIsExporting(false);
    }
  };

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
          <button 
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-700 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-700 cursor-not-allowed'}`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving || isExporting}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            {isSaving ? <span className="animate-spin text-lg leading-none">⟳</span> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-1.5 ${isExporting ? 'bg-[#c7262c] opacity-80 cursor-wait' : 'bg-[#a91d22] hover:bg-[#c7262c]'} text-white text-sm font-medium rounded-md transition-colors`}
          >
            {isExporting ? <span className="animate-spin text-lg leading-none">⟳</span> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
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
          
          <div className="flex-1" />
          
          <button
            onClick={() => setActiveTab("ai")}
            className={`p-2.5 rounded-xl transition-all mb-4 ${
              activeTab === "ai" ? "bg-indigo-900/50 text-indigo-400" : "text-gray-500 hover:text-indigo-400"
            }`}
            title="CreatorAI Assistant"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </aside>

        {/* Media Library */}
        <div className="w-72 border-r border-gray-800 flex flex-col bg-[#111111] shrink-0">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide">
              {activeTab === "media" && "Project Media"}
              {activeTab === "text" && "Text Templates"}
              {activeTab === "effects" && "Effects"}
              {activeTab === "ai" && "CreatorAI Assistant"}
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
                      <div key={asset._id} className="relative group bg-gray-900 rounded-md overflow-hidden aspect-video border border-gray-800 hover:border-gray-600 transition-colors">
                        {asset.asset_type.startsWith("video") ? (
                          <div className="absolute inset-0 bg-gray-950 flex items-center justify-center">
                            <video src={asset.file_url} className="w-full h-full object-cover opacity-70" preload="metadata" />
                            <Film className="w-6 h-6 text-gray-400 absolute" />
                          </div>
                        ) : asset.asset_type.startsWith("image") ? (
                          <img src={asset.file_url} alt={asset.filename} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                            <Music className="w-6 h-6 text-gray-700" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                          <p className="text-[10px] truncate max-w-[80%]">{asset.filename}</p>
                          <button 
                            onClick={() => handleAddAssetToTimeline(asset)}
                            className="bg-[#a91d22] hover:bg-[#c7262c] text-white rounded p-0.5"
                            title="Add to timeline"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "text" && (
              <div className="space-y-3">
                <button 
                  onClick={handleAddTextToTimeline}
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Type className="w-6 h-6 text-gray-400" />
                  <span className="text-sm font-medium">Add Basic Text</span>
                </button>
              </div>
            )}
            
            {activeTab === "effects" && (
              <div className="text-center py-8 text-xs text-gray-600">
                Check the Inspector panel to apply crazy effects like Glitch, VHS, and Blur to your selected clips!
              </div>
            )}
            
            {activeTab === "ai" && (
              <AiAssistantPanel />
            )}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          <Canvas />
          
          {/* Playback Controls */}
          <div className="h-12 border-t border-gray-800 bg-[#141414] flex items-center justify-center gap-4 px-4 shrink-0">
            <button 
              onClick={() => setPlayhead(0)}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-[1px]" />}
            </button>
            <button 
              onClick={() => setPlayhead(settings.duration)}
              className="p-1.5 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Right Sidebar (Inspector) */}
        <Inspector />
      </div>

      {/* Bottom Panel (Timeline) */}
      <Timeline />
    </div>
  );
}
