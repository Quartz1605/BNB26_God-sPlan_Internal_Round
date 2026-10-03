"use client";

import React from "react";
import { useEditorStore, EditorTrack } from "./store";
import { Clip } from "./Clip";
import { Lock, Unlock, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";

interface TrackProps {
  track: EditorTrack;
}

export function Track({ track }: TrackProps) {
  const { clips, zoom } = useEditorStore();
  const trackClips = clips.filter(c => c.trackId === track.id);

  const isVideo = track.type === 'video';
  const isAudio = track.type === 'audio';

  return (
    <div className="h-16 border-b border-gray-800/20 relative flex items-center w-full group">
      {/* Background ticks/grid lines could go here */}
      <div 
        className="absolute inset-0 bg-transparent"
        // Can add click-to-deselect-all handler here or drag-select
      />

      {/* Clips Container */}
      <div className="relative w-full h-full min-w-max">
        {trackClips.map(clip => (
          <Clip key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
}

// Track Header component (left side)
export function TrackHeader({ track }: TrackProps) {
  return (
    <div className="h-16 border-b border-gray-800/50 flex items-center px-3 justify-between bg-[#161616] group">
      <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
        {track.name}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Toggle Lock */}
        <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Lock Track">
          {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>
        
        {/* Toggle Visibility/Mute */}
        {track.type === 'video' || track.type === 'text' ? (
          <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Toggle Visibility">
            {track.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        ) : (
          <button className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Toggle Mute">
            {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
