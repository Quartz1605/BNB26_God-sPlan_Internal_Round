"use client";

import React from "react";
import { useEditorStore } from "./store";
import { SlidersHorizontal, AlignLeft, Type, Video, Music } from "lucide-react";

export function Inspector() {
  const { selectedClipIds, clips, updateClip, saveHistoryState } = useEditorStore();
  
  if (selectedClipIds.length !== 1) {
    return (
      <div className="w-72 border-l border-gray-800 bg-[#111111] flex flex-col shrink-0">
        <div className="h-14 border-b border-gray-800 flex items-center px-4 shrink-0 bg-[#141414]">
          <h2 className="text-sm font-medium uppercase tracking-wide flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-xs text-gray-500 p-4 text-center">
          {selectedClipIds.length === 0 
            ? "Select a clip to view properties" 
            : "Multiple clips selected. Select a single clip to edit properties."}
        </div>
      </div>
    );
  }

  const clip = clips.find(c => c.id === selectedClipIds[0]);
  if (!clip) return null;

  const handleUpdate = (updates: any) => {
    saveHistoryState();
    updateClip(clip.id, updates);
  };

  return (
    <div className="w-72 border-l border-gray-800 bg-[#111111] flex flex-col shrink-0 overflow-hidden">
      <div className="h-14 border-b border-gray-800 flex items-center px-4 shrink-0 bg-[#141414]">
        <h2 className="text-sm font-medium uppercase tracking-wide flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Properties
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Clip Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            {clip.type === 'video' && <Video className="w-4 h-4 text-indigo-400" />}
            {clip.type === 'audio' && <Music className="w-4 h-4 text-emerald-400" />}
            {clip.type === 'text' && <Type className="w-4 h-4 text-amber-400" />}
            <span className="truncate">{clip.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>Start: {clip.startTime.toFixed(2)}s</div>
            <div>Dur: {clip.duration.toFixed(2)}s</div>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Text Properties */}
        {clip.type === 'text' && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Text Settings</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">Content</label>
              <textarea 
                className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                value={clip.textContent || ""}
                onChange={(e) => handleUpdate({ textContent: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block">Font Size</label>
                <input 
                  type="number" 
                  className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                  value={clip.fontSize || 48}
                  onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block">Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                    value={clip.color || "#ffffff"}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                  />
                  <span className="text-xs">{clip.color || "#ffffff"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(clip.type === 'video' || clip.type === 'text' || clip.type === 'image') && (
          <>
            {clip.type === 'text' && <hr className="border-gray-800" />}
            
            {/* Cropping / Trimming */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Trim & Crop</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block">Source Start (s)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                    value={clip.sourceStart.toFixed(1)}
                    onChange={(e) => handleUpdate({ sourceStart: Math.max(0, Number(e.target.value)) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block">Duration (s)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                    value={clip.duration.toFixed(1)}
                    onChange={(e) => {
                      const dur = Math.max(0.5, Number(e.target.value));
                      handleUpdate({ duration: dur, sourceEnd: clip.sourceStart + dur });
                    }}
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-800" />

            {/* Transitions */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Transitions</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400 block">Transition In</label>
                <select 
                  className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                  value={clip.effects?.find(e => e.startsWith('transitionIn:'))?.split(':')[1] || 'none'}
                  onChange={(e) => {
                    const val = e.target.value;
                    const otherFx = (clip.effects || []).filter(fx => !fx.startsWith('transitionIn:'));
                    if (val !== 'none') otherFx.push(`transitionIn:${val}`);
                    handleUpdate({ effects: otherFx });
                  }}
                >
                  <option value="none">None</option>
                  <option value="fade">Fade In (1s)</option>
                  <option value="slideRight">Slide In Right (1s)</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-800" />
            
            {/* Transform Properties */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Transform</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400 block">Scale</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="10" max="300" 
                    className="flex-1 accent-[#a91d22]"
                    value={(clip.scale || 1) * 100}
                    onChange={(e) => handleUpdate({ scale: Number(e.target.value) / 100 })}
                  />
                  <span className="text-xs w-8 text-right">{Math.round((clip.scale || 1) * 100)}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 block">Opacity</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" max="100" 
                    className="flex-1 accent-[#a91d22]"
                    value={(clip.opacity ?? 1) * 100}
                    onChange={(e) => handleUpdate({ opacity: Number(e.target.value) / 100 })}
                  />
                  <span className="text-xs w-8 text-right">{Math.round((clip.opacity ?? 1) * 100)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block">Position X</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                    value={clip.position?.x ?? 50}
                    onChange={(e) => handleUpdate({ position: { ...clip.position, x: Number(e.target.value), y: clip.position?.y ?? 50 } })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block">Position Y</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                    value={clip.position?.y ?? 50}
                    onChange={(e) => handleUpdate({ position: { ...clip.position, x: clip.position?.x ?? 50, y: Number(e.target.value) } })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {(clip.type === 'video' || clip.type === 'image') && (
          <>
            <hr className="border-gray-800" />
            
            {/* Effects Properties */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">Effects</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {["grayscale", "sepia", "invert", "blur", "vhs"].map((fx) => {
                  const isActive = clip.effects?.includes(fx);
                  return (
                    <button
                      key={fx}
                      onClick={() => {
                        const current = clip.effects || [];
                        const next = isActive ? current.filter(e => e !== fx) : [...current, fx];
                        handleUpdate({ effects: next });
                      }}
                      className={`text-xs p-2 rounded border transition-colors ${
                        isActive 
                          ? 'bg-[#a91d22] border-[#a91d22] text-white' 
                          : 'bg-[#1c1c1c] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {fx.charAt(0).toUpperCase() + fx.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
