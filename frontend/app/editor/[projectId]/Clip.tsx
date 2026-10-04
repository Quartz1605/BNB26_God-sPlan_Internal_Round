"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditorStore, EditorClip } from "./store";
import { Film, Type, Music, Diamond } from "lucide-react";

interface ClipProps {
  clip: EditorClip;
}

export function Clip({ clip }: ClipProps) {
  const { zoom, selectedClipIds, selectClip, updateClip, saveHistoryState, playhead, setPlayhead } = useEditorStore();
  const isSelected = selectedClipIds.includes(clip.id);
  const clipRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Resizing state
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [initialClipState, setInitialClipState] = useState<{ start: number; dur: number; srcStart: number; srcEnd: number } | null>(null);

  const left = clip.startTime * zoom;
  const width = clip.duration * zoom;

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    selectClip(clip.id, e.shiftKey);
    setIsDragging(true);
    setDragOffset(e.clientX - left);
    saveHistoryState(); // Save state before drag starts
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newLeft = Math.max(0, e.clientX - dragOffset);
    const newStartTime = newLeft / zoom;
    updateClip(clip.id, { startTime: newStartTime });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // Handle Trim Left
  const handleTrimLeftDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizingLeft(true);
    setResizeStartX(e.clientX);
    setInitialClipState({ start: clip.startTime, dur: clip.duration, srcStart: clip.sourceStart, srcEnd: clip.sourceEnd });
    saveHistoryState();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTrimLeftMove = (e: React.PointerEvent) => {
    if (!isResizingLeft || !initialClipState) return;
    const deltaX = e.clientX - resizeStartX;
    const deltaSeconds = deltaX / zoom;
    
    // Prevent dragging past the end of the clip or before 0
    let newStart = Math.max(0, initialClipState.start + deltaSeconds);
    let newDuration = initialClipState.dur - (newStart - initialClipState.start);
    let newSourceStart = initialClipState.srcStart + (newStart - initialClipState.start);
    
    if (newDuration < 0.5) { // min width
      newDuration = 0.5;
      newStart = initialClipState.start + initialClipState.dur - 0.5;
      newSourceStart = initialClipState.srcEnd - 0.5;
    }

    updateClip(clip.id, { startTime: newStart, duration: newDuration, sourceStart: newSourceStart });
  };

  const handleTrimLeftUp = (e: React.PointerEvent) => {
    if (isResizingLeft) {
      setIsResizingLeft(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // Handle Trim Right
  const handleTrimRightDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizingRight(true);
    setResizeStartX(e.clientX);
    setInitialClipState({ start: clip.startTime, dur: clip.duration, srcStart: clip.sourceStart, srcEnd: clip.sourceEnd });
    saveHistoryState();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTrimRightMove = (e: React.PointerEvent) => {
    if (!isResizingRight || !initialClipState) return;
    const deltaX = e.clientX - resizeStartX;
    const deltaSeconds = deltaX / zoom;
    
    let newDuration = Math.max(0.5, initialClipState.dur + deltaSeconds);
    let newSourceEnd = initialClipState.srcStart + newDuration;

    updateClip(clip.id, { duration: newDuration, sourceEnd: newSourceEnd });
  };

  const handleTrimRightUp = (e: React.PointerEvent) => {
    if (isResizingRight) {
      setIsResizingRight(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const getBgColor = () => {
    if (clip.type === 'video') return 'bg-indigo-600/40 border-indigo-500/60 hover:bg-indigo-600/60';
    if (clip.type === 'audio') return 'bg-emerald-600/30 border-emerald-500/40 hover:bg-emerald-600/50';
    if (clip.type === 'text') return 'bg-amber-600/40 border-amber-500/60 hover:bg-amber-600/60';
    return 'bg-gray-600/40 border-gray-500/60';
  };

  const getIcon = () => {
    if (clip.type === 'video') return <Film className="w-3 h-3 text-indigo-300 mr-1" />;
    if (clip.type === 'audio') return <Music className="w-3 h-3 text-emerald-300 mr-1" />;
    if (clip.type === 'text') return <Type className="w-3 h-3 text-amber-300 mr-1" />;
  };

  return (
    <div
      ref={clipRef}
      className={`absolute top-2 bottom-2 border rounded shadow-sm flex flex-col justify-center overflow-hidden cursor-grab active:cursor-grabbing transition-colors select-none ${getBgColor()} ${
        isSelected ? 'ring-2 ring-white z-20' : 'z-10'
      }`}
      style={{ left: `${left}px`, width: `${width}px` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex items-center px-2 py-1 pointer-events-none w-full h-full relative">
        {getIcon()}
        <span className="text-[10px] font-medium text-white truncate">{clip.name}</span>
      </div>

      {/* Render Keyframe Markers */}
      {clip.keyframes && clip.keyframes.length > 0 && (
        <div className="absolute inset-x-0 bottom-0.5 h-3 pointer-events-none flex items-center">
          {clip.keyframes.map((kf) => {
            const percent = (kf.time / clip.duration) * 100;
            const absoluteKfTime = clip.startTime + kf.time;
            const isActive = Math.abs(playhead - absoluteKfTime) < 0.08;
            return (
              <div
                key={kf.id}
                className="absolute -translate-x-1/2 cursor-pointer pointer-events-auto p-0.5 group"
                style={{ left: `${percent}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayhead(absoluteKfTime);
                  selectClip(clip.id);
                }}
                title={`Keyframe @ ${kf.time.toFixed(2)}s`}
              >
                <Diamond
                  className={`w-2.5 h-2.5 transition-transform group-hover:scale-125 ${
                    isActive
                      ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.8)] scale-110'
                      : 'fill-amber-400 text-amber-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Left Trim Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/30 active:bg-white/50"
        onPointerDown={handleTrimLeftDown}
        onPointerMove={handleTrimLeftMove}
        onPointerUp={handleTrimLeftUp}
        onPointerCancel={handleTrimLeftUp}
      />

      {/* Right Trim Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/30 active:bg-white/50"
        onPointerDown={handleTrimRightDown}
        onPointerMove={handleTrimRightMove}
        onPointerUp={handleTrimRightUp}
        onPointerCancel={handleTrimRightUp}
      />
    </div>
  );
}

