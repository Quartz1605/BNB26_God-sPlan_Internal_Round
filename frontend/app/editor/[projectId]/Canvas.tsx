"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditorStore } from "./store";
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
              const scale = clip.scale || 1;
              const opacity = clip.opacity ?? 1;
              const posX = clip.position?.x ?? 50;
              const posY = clip.position?.y ?? 50;
              
              if (clip.type === 'video' || clip.type === 'image') {
                // Compile effects into CSS filter
                let filterString = "";
                let customClasses = "w-full h-full object-cover ";
                if (clip.effects?.includes("grayscale")) filterString += "grayscale(100%) ";
                if (clip.effects?.includes("sepia")) filterString += "sepia(100%) ";
                if (clip.effects?.includes("invert")) filterString += "invert(100%) ";
                if (clip.effects?.includes("blur")) filterString += "blur(4px) ";
                
                // Add some basic pseudo-classes for glitch/vhs via Tailwind if needed, 
                // but for now we'll just rely on filters and inline opacity.
                if (clip.effects?.includes("vhs")) {
                  filterString += "contrast(1.2) saturate(1.5) hue-rotate(-10deg) ";
                }

                return (
                  <div 
                    key={clip.id}
                    className="absolute"
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: `translate(-50%, -50%) scale(${scale})`,
                      opacity: opacity,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {clip.type === 'video' ? (
                      <video 
                        src={clip.fileUrl} 
                        className={customClasses}
                        style={{ filter: filterString }}
                        preload="metadata"
                        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0; }}
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
                      fontSize: `${clip.fontSize || 48}px`,
                      color: clip.color || '#ffffff',
                      textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                      fontWeight: 'bold',
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
