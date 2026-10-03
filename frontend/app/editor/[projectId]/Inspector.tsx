"use client";

import React from "react";
import { useEditorStore } from "./store";
import { getInterpolatedClipProperties } from "./keyframes";
import { SlidersHorizontal, Type, Video, Music, Diamond, Trash2, Plus, ArrowRight } from "lucide-react";

export function Inspector() {
  
  const { 
    selectedClipIds, 
    clips, 
    playhead,
    setPlayhead,
    updateClip, 
    saveHistoryState,
    addOrUpdateKeyframe,
    removeKeyframe,
    updateKeyframe,
    addTimelineKeyframe,
    settings,
    updateSettings
  } = useEditorStore();
  
  if (selectedClipIds.length !== 1) {
    const isMultiple = selectedClipIds.length > 1;
    return (
      <div className="w-72 border-l border-gray-800 bg-[#111111] flex flex-col shrink-0 overflow-hidden">
        <div className="h-14 border-b border-gray-800 flex items-center px-4 shrink-0 bg-[#141414]">
          <h2 className="text-sm font-medium uppercase tracking-wide flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> {isMultiple ? "Multiple Selected" : "Project Settings"}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isMultiple ? (
            <div className="flex items-center justify-center text-xs text-gray-500 text-center h-full">
              Multiple clips selected. Select a single clip to edit properties.
            </div>
          ) : (
            <>
              {/* Project Properties */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">General</h3>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 block">Aspect Ratio</label>
                  <select 
                    className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                    value={settings.aspectRatio}
                    onChange={(e) => updateSettings({ aspectRatio: e.target.value as any })}
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Social)</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-800" />

              {/* Captions Properties */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">Captions</h3>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[#a91d22] w-4 h-4"
                    checked={settings.captions?.enabled || false}
                    onChange={(e) => updateSettings({ captions: { ...settings.captions, enabled: e.target.checked } })}
                  />
                  <span className="text-sm text-white font-medium">Enable Captions</span>
                </label>
                
                {settings.captions?.enabled && (
                  <div className="space-y-3 pl-6 border-l-2 border-gray-800">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">Style</label>
                      <select 
                        className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                        value={settings.captions.style}
                        onChange={(e) => updateSettings({ captions: { ...settings.captions, style: e.target.value } })}
                      >
                        <option value="standard">Standard</option>
                        <option value="bold">Bold</option>
                        <option value="karaoke">Karaoke</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">Position</label>
                      <select 
                        className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                        value={settings.captions.position}
                        onChange={(e) => updateSettings({ captions: { ...settings.captions, position: e.target.value } })}
                      >
                        <option value="bottom">Bottom</option>
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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

  const relativeTime = Math.max(0, Math.min(clip.duration, playhead - clip.startTime));
  const isPlayheadInsideClip = playhead >= clip.startTime && playhead <= clip.startTime + clip.duration;
  
  // Calculate current interpolated transform properties based on playhead time
  const interpolated = getInterpolatedClipProperties(clip, playhead);
  const currentScale = interpolated.scale;
  const currentOpacity = interpolated.opacity;
  const currentPosX = interpolated.position.x;
  const currentPosY = interpolated.position.y;
  const currentFontSize = interpolated.fontSize;

  const existingKeyframeAtPlayhead = (clip.keyframes || []).find(
    k => Math.abs(k.time - relativeTime) < 0.05
  );

  const toggleKeyframeAtPlayhead = (overrides?: any) => {
    addOrUpdateKeyframe(clip.id, relativeTime, {
      scale: currentScale,
      opacity: currentOpacity,
      position: { x: currentPosX, y: currentPosY },
      fontSize: currentFontSize,
      ...overrides
    });
  };

  return (
    <div className="w-72 border-l border-gray-800 bg-[#111111] flex flex-col shrink-0 overflow-hidden select-none">
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
                  value={Math.round(currentFontSize)}
                  onChange={(e) => {
                    const newFont = Number(e.target.value);
                    handleUpdate({ fontSize: newFont });
                    if (isPlayheadInsideClip) {
                      addOrUpdateKeyframe(clip.id, relativeTime, { fontSize: newFont });
                    }
                  }}
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
            
            {/* Keyframe & Transform Properties */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5">
                  <Diamond className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> Transform
                </h3>
                {isPlayheadInsideClip && (
                  <button
                    onClick={() => toggleKeyframeAtPlayhead()}
                    className={`text-[11px] px-2 py-1 rounded flex items-center gap-1 transition-colors font-medium ${
                      existingKeyframeAtPlayhead
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 hover:bg-amber-600/50'
                        : 'bg-[#a91d22] text-white hover:bg-[#8e181c]'
                    }`}
                    title={existingKeyframeAtPlayhead ? "Update keyframe at current playhead" : "Add keyframe at current playhead"}
                  >
                    <Plus className="w-3 h-3" />
                    {existingKeyframeAtPlayhead ? "Update KF" : "+ Keyframe"}
                  </button>
                )}
              </div>

              {/* Transform Inputs */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400 block">Scale</label>
                    <button
                      onClick={() => toggleKeyframeAtPlayhead({ scale: currentScale })}
                      className="text-gray-500 hover:text-amber-400 transition-colors p-0.5"
                      title="Add Scale Keyframe at playhead"
                    >
                      <Diamond className={`w-3 h-3 ${existingKeyframeAtPlayhead ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="10" max="300" 
                      className="flex-1 accent-[#a91d22]"
                      value={Math.round(currentScale * 100)}
                      onChange={(e) => {
                        const newScale = Number(e.target.value) / 100;
                        handleUpdate({ scale: newScale });
                        if (isPlayheadInsideClip) {
                          addOrUpdateKeyframe(clip.id, relativeTime, { scale: newScale });
                        }
                      }}
                    />
                    <span className="text-xs w-10 text-right font-mono">{Math.round(currentScale * 100)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400 block">Opacity</label>
                    <button
                      onClick={() => toggleKeyframeAtPlayhead({ opacity: currentOpacity })}
                      className="text-gray-500 hover:text-amber-400 transition-colors p-0.5"
                      title="Add Opacity Keyframe at playhead"
                    >
                      <Diamond className={`w-3 h-3 ${existingKeyframeAtPlayhead ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      className="flex-1 accent-[#a91d22]"
                      value={Math.round(currentOpacity * 100)}
                      onChange={(e) => {
                        const newOpacity = Number(e.target.value) / 100;
                        handleUpdate({ opacity: newOpacity });
                        if (isPlayheadInsideClip) {
                          addOrUpdateKeyframe(clip.id, relativeTime, { opacity: newOpacity });
                        }
                      }}
                    />
                    <span className="text-xs w-10 text-right font-mono">{Math.round(currentOpacity * 100)}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block">Position X</label>
                    <input 
                      type="number" 
                      className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                      value={Math.round(currentPosX)}
                      onChange={(e) => {
                        const newX = Number(e.target.value);
                        const pos = { x: newX, y: currentPosY };
                        handleUpdate({ position: pos });
                        if (isPlayheadInsideClip) {
                          addOrUpdateKeyframe(clip.id, relativeTime, { position: pos });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block">Position Y</label>
                    <input 
                      type="number" 
                      className="w-full bg-[#1c1c1c] border border-gray-700 rounded p-1.5 text-sm text-white focus:outline-none focus:border-[#a91d22]"
                      value={Math.round(currentPosY)}
                      onChange={(e) => {
                        const newY = Number(e.target.value);
                        const pos = { x: currentPosX, y: newY };
                        handleUpdate({ position: pos });
                        if (isPlayheadInsideClip) {
                          addOrUpdateKeyframe(clip.id, relativeTime, { position: pos });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Keyframes Manager List */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Active Keyframes ({clip.keyframes?.length || 0})</span>
                </div>

                {(!clip.keyframes || clip.keyframes.length === 0) ? (
                  <div className="text-xs text-gray-500 bg-[#161616] p-2.5 rounded border border-gray-800 text-center">
                    No keyframes set. Move playhead and adjust scale or click "+ Keyframe".
                  </div>
                ) : (
                  clip.keyframes.map((kf, idx) => {
                    const absoluteTime = clip.startTime + kf.time;
                    const isNearPlayhead = Math.abs(playhead - absoluteTime) < 0.05;
                    return (
                      <div
                        key={kf.id}
                        className={`bg-[#181818] border rounded p-2 text-xs space-y-2 transition-colors ${
                          isNearPlayhead ? 'border-amber-500/80 bg-amber-950/20' : 'border-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setPlayhead(absoluteTime)}
                            className="flex items-center gap-1.5 text-amber-300 font-mono font-medium hover:underline cursor-pointer"
                            title="Seek playhead to keyframe"
                          >
                            <Diamond className="w-3 h-3 fill-amber-400" />
                            <span>KF #{idx + 1} ({kf.time.toFixed(2)}s)</span>
                            <ArrowRight className="w-2.5 h-2.5 text-gray-500" />
                          </button>
                          
                          <button
                            onClick={() => removeKeyframe(clip.id, kf.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="Delete Keyframe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 pt-1 border-t border-gray-800/60">
                          <div>Scale: {Math.round((kf.scale ?? 1) * 100)}%</div>
                          <div>Opacity: {Math.round((kf.opacity ?? 1) * 100)}%</div>
                          <div>Pos: ({Math.round(kf.position?.x ?? 50)}, {Math.round(kf.position?.y ?? 50)})</div>
                          <div className="flex items-center gap-1">
                            <span>Easing:</span>
                            <select
                              className="bg-[#111] text-gray-300 border border-gray-700 rounded text-[10px] px-1 py-0.5"
                              value={kf.easing || 'linear'}
                              onChange={(e) => updateKeyframe(clip.id, kf.id, { easing: e.target.value as any })}
                            >
                              <option value="linear">Linear</option>
                              <option value="easeIn">Ease In</option>
                              <option value="easeOut">Ease Out</option>
                              <option value="easeInOut">Ease InOut</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
