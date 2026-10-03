"use client";

import React, { useRef, useEffect, useState } from "react";
import { useEditorStore } from "./store";
import { Track, TrackHeader } from "./Track";

export function Timeline() {
  const { 
    tracks, 
    playhead, 
    zoom, 
    settings, 
    setPlayhead, 
    isPlaying, 
    clearSelection 
  } = useEditorStore();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Generate ruler ticks
  const generateRulerTicks = () => {
    const ticks = [];
    const pixelsPerSecond = zoom;
    const duration = settings.duration;
    const totalPixels = duration * pixelsPerSecond;
    
    // Determine tick interval based on zoom to prevent crowding
    let interval = 1; // 1 second
    if (zoom < 10) interval = 10;
    else if (zoom < 30) interval = 5;
    
    for (let s = 0; s <= duration; s += interval) {
      const x = s * pixelsPerSecond;
      ticks.push(
        <div key={s} className="absolute top-0 bottom-0 border-l border-gray-600/50" style={{ left: `${x}px` }}>
          <span className="absolute left-1 top-0 text-[9px] text-gray-500 font-mono">
            {formatTime(s)}
          </span>
        </div>
      );
    }
    return (
      <div className="relative h-full w-full" style={{ width: `${totalPixels}px` }}>
        {ticks}
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Playhead update simulation when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    let lastTime = performance.now();
    let frameId: number;
    
    const update = (time: number) => {
      const deltaMs = time - lastTime;
      const deltaSec = deltaMs / 1000;
      lastTime = time;
      
      const currentPlayhead = useEditorStore.getState().playhead;
      const nextPlayhead = currentPlayhead + deltaSec;
      
      if (nextPlayhead >= settings.duration) {
        useEditorStore.getState().setIsPlaying(false);
        setPlayhead(settings.duration);
      } else {
        setPlayhead(nextPlayhead);
        frameId = requestAnimationFrame(update);
      }
    };
    
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, settings.duration, setPlayhead]);

  // Scrubbing logic
  const handleScrubDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsScrubbing(true);
    updatePlayheadPosition(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleScrubMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    updatePlayheadPosition(e);
  };

  const handleScrubUp = (e: React.PointerEvent) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const updatePlayheadPosition = (e: React.PointerEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const time = x / zoom;
    setPlayhead(time);
  };

  return (
    <div className="h-64 border-t border-gray-800 bg-[#111111] flex flex-col shrink-0 overflow-hidden select-none">
      <div className="h-8 border-b border-gray-800 bg-[#141414] flex items-center px-4 justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Timeline</span>
        <div className="text-xs font-mono text-gray-500">
          {formatTime(playhead)} / {formatTime(settings.duration)}
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Sidebar) */}
        <div className="w-48 border-r border-gray-800 bg-[#161616] flex flex-col z-20 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
          <div className="h-6 border-b border-gray-800/50 bg-[#141414]" /> {/* Spacer for ruler */}
          <div className="flex-1 overflow-hidden">
            {tracks.map(track => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>
        
        {/* Tracks Content (Scrollable Area) */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-auto bg-[#0f0f0f] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-[#0f0f0f]"
          onPointerDown={() => clearSelection()}
        >
          <div 
            ref={timelineRef}
            className="relative min-w-full" 
            style={{ width: `${settings.duration * zoom}px`, minHeight: '100%' }}
          >
            {/* Ruler area (interactive for scrubbing) */}
            <div 
              className="h-6 border-b border-gray-800 bg-[#141414] opacity-50 sticky top-0 z-10 cursor-col-resize"
              onPointerDown={handleScrubDown}
              onPointerMove={handleScrubMove}
              onPointerUp={handleScrubUp}
              onPointerCancel={handleScrubUp}
            >
              {generateRulerTicks()}
            </div>
            
            {/* Tracks */}
            <div className="relative">
              {tracks.map(track => (
                <Track key={track.id} track={track} />
              ))}
            </div>

            {/* Playhead Line */}
            <div 
              className="absolute top-0 bottom-0 w-[1px] bg-[#a91d22] z-30 pointer-events-none"
              style={{ left: `${playhead * zoom}px` }}
            >
              <div className="absolute top-0 -left-[5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#a91d22]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
