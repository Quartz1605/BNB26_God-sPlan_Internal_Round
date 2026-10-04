"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditorStore } from "./store";
import { getInterpolatedClipProperties } from "./keyframes";
import { Film } from "lucide-react";

export function Canvas() {
  const { clips, playhead, settings } = useEditorStore();
  const [activeClips, setActiveClips] = useState<any[]>([]);

  // Calculate which clips should be visible based on the playhead
  useEffect(() => {
    // A clip is active if playhead is between its start and end time on the timeline
    const visible = clips.filter(
      (clip) => playhead >= clip.startTime && playhead < (clip.startTime + clip.duration)
    );
    
    // Sort so video is on bottom, text on top
    visible.sort((a, b) => {
      const aZ = a.type === 'text' ? 10 : 1;
      const bZ = b.type === 'text' ? 10 : 1;
      return aZ - bZ;
    });
    
    setActiveClips(visible);
  }, [playhead, clips]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-black relative">
      <div className="flex-1 flex items-center justify-center p-4">
        {/* The aspect ratio container matching settings */}
        <div 
          className="bg-[#111] shadow-2xl border border-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden"
          style={{ 
            aspectRatio: settings.aspectRatio === '16:9' ? '16/9' : settings.aspectRatio === '9:16' ? '9/16' : '1/1',
            height: '100%',
            maxHeight: '100%',
            maxWidth: '100%' 
          }}
        >
          {activeClips.length === 0 ? (
            <span className="text-gray-700 text-sm flex items-center gap-2">
              <Film className="w-5 h-5" /> No active clips
            </span>
          ) : (
            activeClips.map((clip) => {
              // Interpolate keyframe properties based on current playhead time
              const interpolated = getInterpolatedClipProperties(clip, playhead);
              const scale = interpolated.scale;
              let opacity = interpolated.opacity;
              const posX = interpolated.position.x;
              const posY = interpolated.position.y;
              const fontSize = interpolated.fontSize;
              
              if (clip.type === 'video' || clip.type === 'image') {
                // Compile effects into CSS filter
                let filterString = "";
                let customClasses = "w-full h-full object-cover ";
                if (clip.effects?.includes("grayscale")) filterString += "grayscale(100%) ";
                if (clip.effects?.includes("sepia")) filterString += "sepia(100%) ";
                if (clip.effects?.includes("invert")) filterString += "invert(100%) ";
                if (clip.effects?.includes("blur")) filterString += "blur(4px) ";
                
                if (clip.effects?.includes("vhs")) {
                  filterString += "contrast(1.2) saturate(1.5) hue-rotate(-10deg) ";
                }

                // Apply Transitions
                const progressIn = playhead - clip.startTime;
                
                if (clip.effects?.includes("transitionIn:fade")) {
                  if (progressIn < 1.0) {
                    opacity *= (progressIn / 1.0);
                  }
                }
                
                let translateX = "-50%";
                if (clip.effects?.includes("transitionIn:slideRight")) {
                  if (progressIn < 1.0) {
                    const easeOutQuad = 1 - (1 - progressIn) * (1 - progressIn);
                    translateX = `calc(-50% - ${100 * (1 - easeOutQuad)}%)`;
                  }
                }

                return (
                  <div 
                    key={clip.id}
                    className="absolute"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: `translate(${translateX}, -50%) scale(${scale})`,
                      opacity: opacity,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {clip.type === 'video' ? (
                      <SyncVideo 
                        clip={clip}
                        playhead={playhead}
                        customClasses={customClasses}
                        filterString={filterString}
                      />
                    ) : (
                      <img 
                        src={clip.fileUrl} 
                        className={customClasses}
                        style={{ filter: filterString }}
                        alt={clip.name} 
                      />
                    )}
                  </div>
                );
              }

              if (clip.type === 'text') {
                return (
                  <div
                    key={clip.id}
                    className="absolute whitespace-pre-wrap text-center"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      opacity: opacity,
                      fontSize: `${fontSize}px`,
                      color: clip.color || '#ffffff',
                      textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                      fontWeight: 'bold',
                      zIndex: 10
                    }}
                  >
                    {clip.textContent || "Double click to edit text"}
                  </div>
                );
              }
              
              return null;
            })
          )}
          
          {/* Playhead overlay for visual context */}
          <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white/70 z-50">
            {formatTime(playhead)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component to sync video currentTime with the editor playhead
function SyncVideo({ clip, playhead, customClasses, filterString }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Calculate where we should be in the source video
      const sourceTime = (playhead - clip.startTime) + (clip.sourceStart || 0);
      
      // If difference is large (seeking), update it immediately
      // If difference is small (playing), browsers handle playback better if we don't constantly set currentTime
      // But for a simple timeline, syncing every frame guarantees accuracy.
      if (Math.abs(videoRef.current.currentTime - sourceTime) > 0.1) {
        videoRef.current.currentTime = sourceTime;
      }
    }
  }, [playhead, clip]);

  return (
    <video 
      ref={videoRef}
      src={clip.fileUrl} 
      className={customClasses}
      style={{ filter: filterString }}
      preload="auto"
      muted
      playsInline
    />
  );
}
