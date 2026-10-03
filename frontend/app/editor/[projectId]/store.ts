import { create } from 'zustand';

// --- TYPES ---
export type TrackType = 'video' | 'audio' | 'text';

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
    // Note: for performance, during rapid dragging we might bypass Zustand or not save history on every frame.
    // But for this simple implementation, we update the store.
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
