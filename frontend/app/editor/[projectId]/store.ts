import { create } from 'zustand';
import { Keyframe } from './keyframes';

// --- TYPES ---
export type TrackType = 'video' | 'audio' | 'text' | 'image';

export interface EditorClip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number; // Position on timeline (in seconds)
  duration: number; // Length of clip on timeline (in seconds)
  sourceStart: number; // In-point in the source media
  sourceEnd: number; // Out-point in the source media
  name: string;
  type: TrackType;
  fileUrl?: string;
  // Transforms
  position?: { x: number; y: number };
  scale?: number;
  opacity?: number;
  // Text specific
  textContent?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  // Keyframes
  keyframes?: Keyframe[];
  // Effects
  effects?: string[]; // e.g. "grayscale", "sepia", "invert", "blur", "glitch", "vhs"
}

export interface EditorTrack {
  id: string;
  type: TrackType;
  name: string;
  locked: boolean;
  hidden: boolean;
  muted?: boolean; // Audio only
}

export interface TimelineKeyframe {
  id: string;
  time: number; // Absolute position on project timeline in seconds (e.g. 14.0)
  label?: string;
}

export interface ProjectSettings {
  duration: number; // total timeline duration in seconds
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  fps: number;
}

export interface EditorState {
  projectId: string | null;
  settings: ProjectSettings;
  tracks: EditorTrack[];
  clips: EditorClip[];
  timelineKeyframes: TimelineKeyframe[];
  playhead: number; // Current time in seconds
  isPlaying: boolean;
  selectedClipIds: string[];
  zoom: number; // Timeline zoom level (pixels per second)
  history: { past: any[]; future: any[] };

  // --- ACTIONS ---
  setProjectId: (id: string) => void;
  setPlayhead: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  
  // Tracks
  addTrack: (type: TrackType, name?: string) => void;
  
  // Clips
  addClip: (clip: Omit<EditorClip, 'id'>) => void;
  updateClip: (id: string, updates: Partial<EditorClip>) => void;
  removeClip: (id: string) => void;
  selectClip: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  // Keyframes
  addOrUpdateKeyframe: (clipId: string, time: number, properties?: Partial<Keyframe>) => void;
  removeKeyframe: (clipId: string, keyframeId: string) => void;
  updateKeyframe: (clipId: string, keyframeId: string, updates: Partial<Keyframe>) => void;
  
  // Global Timeline Keyframes
  addTimelineKeyframe: (time?: number, label?: string) => void;
  removeTimelineKeyframe: (id: string) => void;

  // Undo/Redo (Basic implementation)
  saveHistoryState: () => void;
  undo: () => void;
  redo: () => void;
  
  // Persistence
  setEditorState: (state: Partial<EditorState>) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  settings: {
    duration: 300, // 5 minutes default
    aspectRatio: '16:9',
    fps: 30,
  },
  tracks: [
    { id: 'track-t1', type: 'text', name: 'T1', locked: false, hidden: false },
    { id: 'track-v1', type: 'video', name: 'V1', locked: false, hidden: false },
    { id: 'track-a1', type: 'audio', name: 'A1', locked: false, hidden: false },
  ],
  clips: [],
  timelineKeyframes: [],
  playhead: 0,
  isPlaying: false,
  selectedClipIds: [],
  zoom: 20, // 20 pixels per second
  history: { past: [], future: [] },

  setProjectId: (id) => set({ projectId: id }),
  setPlayhead: (time) => set((state) => ({ playhead: Math.max(0, Math.min(time, state.settings.duration)) })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setZoom: (zoom) => set({ zoom: Math.max(5, Math.min(zoom, 100)) }),

  addTrack: (type, name) => set((state) => {
    state.saveHistoryState();
    const id = `track-${type}-${Date.now()}`;
    return {
      tracks: [...state.tracks, { id, type, name: name || `${type.toUpperCase()} Track`, locked: false, hidden: false }]
    };
  }),

  addClip: (clip) => {
    const state = get();
    state.saveHistoryState();
    set({
      clips: [...state.clips, { ...clip, id: crypto.randomUUID() }]
    });
  },

  updateClip: (id, updates) => {
    set((state) => ({
      clips: state.clips.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  },

  removeClip: (id) => {
    const state = get();
    state.saveHistoryState();
    set({
      clips: state.clips.filter(c => c.id !== id),
      selectedClipIds: state.selectedClipIds.filter(selId => selId !== id)
    });
  },

  selectClip: (id, multi) => set((state) => ({
    selectedClipIds: multi 
      ? (state.selectedClipIds.includes(id) ? state.selectedClipIds.filter(i => i !== id) : [...state.selectedClipIds, id])
      : [id]
  })),

  clearSelection: () => set({ selectedClipIds: [] }),

  // Global Timeline Keyframes
  addTimelineKeyframe: (time, label) => {
    const state = get();
    const targetTime = Number((time !== undefined ? time : state.playhead).toFixed(2));
    state.saveHistoryState();

    // Check if timeline keyframe already exists at target time
    const exists = state.timelineKeyframes.some(k => Math.abs(k.time - targetTime) < 0.05);
    let updatedTimelineKfs = state.timelineKeyframes;
    if (!exists) {
      const newTk: TimelineKeyframe = {
        id: `tkf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        time: targetTime,
        label: label || `Keyframe @ ${targetTime.toFixed(1)}s`
      };
      updatedTimelineKfs = [...state.timelineKeyframes, newTk].sort((a, b) => a.time - b.time);
    }

    // Auto-keyframe active clips spanning targetTime & select the top clip
    let selectedId: string | null = null;
    const updatedClips = state.clips.map((clip) => {
      if (targetTime >= clip.startTime && targetTime <= clip.startTime + clip.duration) {
        selectedId = clip.id;
        const relativeTime = targetTime - clip.startTime;
        const existingKeyframes = clip.keyframes || [];
        const existingIdx = existingKeyframes.findIndex(k => Math.abs(k.time - relativeTime) < 0.05);
        
        let newKeyframes = existingKeyframes;
        if (existingIdx < 0) {
          const newKf: Keyframe = {
            id: `kf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            time: Number(relativeTime.toFixed(2)),
            scale: clip.scale ?? 1,
            opacity: clip.opacity ?? 1,
            position: { x: clip.position?.x ?? 50, y: clip.position?.y ?? 50 },
            fontSize: clip.fontSize ?? 48,
            easing: 'linear'
          };
          newKeyframes = [...existingKeyframes, newKf].sort((a, b) => a.time - b.time);
        }
        return { ...clip, keyframes: newKeyframes };
      }
      return clip;
    });

    set({
      timelineKeyframes: updatedTimelineKfs,
      clips: updatedClips,
      ...(selectedId ? { selectedClipIds: [selectedId] } : {})
    });
  },

  removeTimelineKeyframe: (id) => {
    const state = get();
    state.saveHistoryState();
    const tk = state.timelineKeyframes.find(k => k.id === id);
    const targetTime = tk ? tk.time : null;

    set((s) => ({
      timelineKeyframes: s.timelineKeyframes.filter(k => k.id !== id),
      clips: s.clips.map((clip) => {
        if (targetTime !== null && targetTime >= clip.startTime && targetTime <= clip.startTime + clip.duration) {
          const relativeTime = targetTime - clip.startTime;
          return {
            ...clip,
            keyframes: (clip.keyframes || []).filter(k => Math.abs(k.time - relativeTime) > 0.05)
          };
        }
        return clip;
      })
    }));
  },

  // Keyframes Implementation
  addOrUpdateKeyframe: (clipId, time, properties) => {
    const state = get();
    state.saveHistoryState();
    set((s) => ({
      clips: s.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        
        const existingKeyframes = clip.keyframes || [];
        const clampedTime = Math.max(0, Math.min(clip.duration, Number(time.toFixed(2))));
        const existingIndex = existingKeyframes.findIndex((k) => Math.abs(k.time - clampedTime) < 0.05);

        let updatedKeyframes: Keyframe[];
        if (existingIndex >= 0) {
          // Update existing keyframe at time
          updatedKeyframes = existingKeyframes.map((k, idx) =>
            idx === existingIndex
              ? { ...k, ...properties }
              : k
          );
        } else {
          // Create new keyframe
          const newKf: Keyframe = {
            id: `kf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            time: clampedTime,
            scale: clip.scale ?? 1,
            opacity: clip.opacity ?? 1,
            position: { x: clip.position?.x ?? 50, y: clip.position?.y ?? 50 },
            fontSize: clip.fontSize ?? 48,
            easing: 'linear',
            ...properties,
          };
          updatedKeyframes = [...existingKeyframes, newKf].sort((a, b) => a.time - b.time);
        }

        return { ...clip, keyframes: updatedKeyframes };
      })
    }));
  },

  removeKeyframe: (clipId, keyframeId) => {
    const state = get();
    state.saveHistoryState();
    const targetClip = state.clips.find(c => c.id === clipId);
    const targetKf = targetClip?.keyframes?.find(k => k.id === keyframeId);
    const absoluteTime = (targetClip && targetKf) ? targetClip.startTime + targetKf.time : null;

    set((s) => ({
      clips: s.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return {
          ...clip,
          keyframes: (clip.keyframes || []).filter((k) => k.id !== keyframeId)
        };
      }),
      timelineKeyframes: absoluteTime !== null
        ? s.timelineKeyframes.filter(tk => Math.abs(tk.time - absoluteTime) > 0.05)
        : s.timelineKeyframes
    }));
  },

  updateKeyframe: (clipId, keyframeId, updates) => {
    set((s) => ({
      clips: s.clips.map((clip) => {
        if (clip.id !== clipId) return clip;
        return {
          ...clip,
          keyframes: (clip.keyframes || []).map((k) =>
            k.id === keyframeId ? { ...k, ...updates } : k
          ).sort((a, b) => a.time - b.time)
        };
      })
    }));
  },

  // History implementation
  saveHistoryState: () => set((state) => {
    const currentState = { tracks: state.tracks, clips: state.clips };
    return {
      history: {
        past: [...state.history.past, currentState],
        future: []
      }
    };
  }),

  undo: () => set((state) => {
    if (state.history.past.length === 0) return state;
    
    const previous = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);
    const currentState = { tracks: state.tracks, clips: state.clips };
    
    return {
      tracks: previous.tracks,
      clips: previous.clips,
      history: {
        past: newPast,
        future: [currentState, ...state.history.future]
      },
      selectedClipIds: []
    };
  }),

  redo: () => set((state) => {
    if (state.history.future.length === 0) return state;
    
    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    const currentState = { tracks: state.tracks, clips: state.clips };
    
    return {
      tracks: next.tracks,
      clips: next.clips,
      history: {
        past: [...state.history.past, currentState],
        future: newFuture
      },
      selectedClipIds: []
    };
  }),
  
  setEditorState: (newState) => set(newState)
}));

