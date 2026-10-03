"use client";

import {
  Activity,
  Bookmark,
  Captions,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Eye,
  Film,
  Heart,
  Image,
  Layers,
  LogOut,
  Maximize2,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Redo2,
  Scissors,
  Search,
  Settings2,
  Sparkles,
  Undo2,
  Volume2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState, type DragEvent as ReactDragEvent } from "react";

type StudioUser = { name: string; email: string; picture: string } | null;
type WorkspaceView = "studio" | "universe";
type MediaAsset = {
  id: string;
  title: string;
  creator: string;
  duration: string;
  seconds: number;
  imageUrl: string;
  category: string;
  views: string;
  score: string;
};
type TimelineClip = {
  id: string;
  title: string;
  lane: string;
  start: number;
  duration: number;
  imageUrl?: string;
  caption?: string;
};

const media: MediaAsset[] = [
  {
    id: "podcast",
    title: "On building a slower life",
    creator: "Maya Chen",
    duration: "42:18",
    seconds: 42.3,
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=85",
    category: "Podcast",
    views: "184k",
    score: "94",
  },
  {
    id: "quiet-morning",
    title: "The 6am reset",
    creator: "Maya Chen",
    duration: "00:34",
    seconds: 12,
    imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85",
    category: "Short",
    views: "82k",
    score: "91",
  },
  {
    id: "studio-notes",
    title: "A note from the studio",
    creator: "Maya Chen",
    duration: "08:12",
    seconds: 8.2,
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
    category: "Raw footage",
    views: "—",
    score: "87",
  },
  {
    id: "field-recording",
    title: "Sunday, out of office",
    creator: "Maya Chen",
    duration: "01:08",
    seconds: 14,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    category: "B-roll",
    views: "—",
    score: "89",
  },
  {
    id: "audience-qa",
    title: "The question I get every week",
    creator: "Maya Chen",
    duration: "04:21",
    seconds: 4.35,
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85",
    category: "Published",
    views: "216k",
    score: "96",
  },
];

const initialTimeline: TimelineClip[] = [
  { id: "cold-open", title: "Cold open", lane: "video", start: 0, duration: 5.8, imageUrl: media[0].imageUrl },
  { id: "main-thought", title: "The thing about rest…", lane: "video", start: 5.8, duration: 17.5, imageUrl: media[0].imageUrl },
  { id: "closing-thought", title: "A smaller promise", lane: "video", start: 23.3, duration: 13.5, imageUrl: media[2].imageUrl },
  { id: "window-light", title: "Window light", lane: "broll", start: 8.4, duration: 5.2, imageUrl: media[1].imageUrl },
  { id: "walk-outside", title: "A slower morning", lane: "broll", start: 24.2, duration: 7.4, imageUrl: media[3].imageUrl },
  { id: "voice", title: "Maya · close mic", lane: "audio", start: 0, duration: 37.5 },
  { id: "music", title: "Soft focus · 82 BPM", lane: "music", start: 0, duration: 37.5 },
  { id: "captions", title: "I used to think rest had to be earned.", lane: "captions", start: 0.8, duration: 36, caption: "I used to think rest had to be earned." },
];

const tracks = [
  { id: "video", code: "V1", label: "Video", icon: Film, tint: "green" },
  { id: "broll", code: "V2", label: "B-roll", icon: Image, tint: "blue" },
  { id: "audio", code: "A1", label: "Voice", icon: Mic2, tint: "orange" },
  { id: "music", code: "A2", label: "Music", icon: Music2, tint: "yellow" },
  { id: "captions", code: "C1", label: "Captions", icon: Captions, tint: "pink" },
];

const universeMoments = [
  { ...media[0], title: "The permission to begin again", category: "PODCAST · EP 17", duration: "12:43", views: "184k views", shape: "moment-featured" },
  { ...media[1], title: "A morning without a plan", category: "YOUTUBE · #31", duration: "04:22", views: "82k views", shape: "moment-tall" },
  { ...media[4], title: "Why your audience keeps coming back", category: "REEL · 2 WEEKS AGO", duration: "00:38", views: "216k views", shape: "moment-short" },
  { ...media[3], title: "A quieter kind of ambition", category: "RAW FOOTAGE · 08:19", duration: "08:19", views: "Unpublished", shape: "moment-wide" },
];

const formatTime = (seconds: number) => {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60).toString().padStart(2, "0");
  const remainder = (wholeSeconds % 60).toString().padStart(2, "0");
  const frames = Math.floor((seconds % 1) * 24).toString().padStart(2, "0");
  return `${minutes}:${remainder}:${frames}`;
};

export function CreatorStudio({ user, onLogout }: { user: StudioUser; onLogout: () => void }) {
  const [view, setView] = useState<WorkspaceView>("studio");
  const [timeline, setTimeline] = useState(initialTimeline);
  const [undoStack, setUndoStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);
  const [playhead, setPlayhead] = useState(7.2);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState("16:9");
  const [searchText, setSearchText] = useState("");
  const [request, setRequest] = useState("");
  const [agentState, setAgentState] = useState<"ready" | "working">("ready");
  const [mobileAgentOpen, setMobileAgentOpen] = useState(false);
  const [activeAssetId, setActiveAssetId] = useState("podcast");
  const stageRef = useRef<HTMLDivElement>(null);
  const clipSequence = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setPlayhead((current) => (current >= 59.8 ? 0 : current + 0.2));
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (agentState !== "working") return;
    const timer = window.setTimeout(() => setAgentState("ready"), 1450);
    return () => window.clearTimeout(timer);
  }, [agentState]);

  const activeAsset = media.find((asset) => asset.id === activeAssetId) ?? media[0];
  const filteredMedia = media.filter((asset) =>
    `${asset.title} ${asset.category} ${asset.creator}`.toLowerCase().includes(searchText.toLowerCase()),
  );

  const commitTimeline = (next: TimelineClip[]) => {
    setUndoStack((history) => [...history, timeline]);
    setRedoStack([]);
    setTimeline(next);
  };

  const undo = () => {
    const previous = undoStack.at(-1);
    if (!previous) return;
    setRedoStack((history) => [...history, timeline]);
    setTimeline(previous);
    setUndoStack((history) => history.slice(0, -1));
  };

  const redo = () => {
    const next = redoStack.at(-1);
    if (!next) return;
    setUndoStack((history) => [...history, timeline]);
    setTimeline(next);
    setRedoStack((history) => history.slice(0, -1));
  };

  const addAsset = (asset: MediaAsset, lane = "video", start = playhead) => {
    clipSequence.current += 1;
    const nextClip: TimelineClip = {
      id: `${asset.id}-${clipSequence.current}`,
      title: asset.title,
      lane,
      start,
      duration: Math.min(asset.seconds, 14),
      imageUrl: asset.imageUrl,
    };
    commitTimeline([...timeline, nextClip]);
    setActiveAssetId(asset.id);
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>, lane: string) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const start = Math.max(0, ((event.clientX - bounds.left) / bounds.width) * (60 / zoom));
    const assetId = event.dataTransfer.getData("assetId");
    if (assetId) {
      const asset = media.find((item) => item.id === assetId);
      if (asset) addAsset(asset, lane, start);
      return;
    }
    const clipId = event.dataTransfer.getData("clipId");
    if (!clipId) return;
    commitTimeline(timeline.map((clip) => clip.id === clipId ? { ...clip, lane, start } : clip));
  };

  const runAgent = (text: string) => {
    setRequest(text);
    setAgentState("working");
  };

  const applyIntroCut = () => {
    commitTimeline(timeline.filter((clip) => clip.id !== "cold-open"));
    setRequest("Remove the low-energy intro");
  };

  const splitAtPlayhead = () => {
    const target = timeline.find((clip) => clip.lane === "video" && playhead > clip.start && playhead < clip.start + clip.duration);
    if (!target) return;
    const firstDuration = playhead - target.start;
    const splitClips = timeline.flatMap((clip) => clip.id === target.id
      ? [
          { ...clip, id: `${clip.id}-a`, title: `${clip.title} · 1`, duration: firstDuration },
          { ...clip, id: `${clip.id}-b`, title: `${clip.title} · 2`, start: playhead, duration: clip.duration - firstDuration },
        ]
      : [clip]);
    commitTimeline(splitClips);
  };

  const searchUniverse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setView("universe");
  };

  return (
    <main className="creator-shell">
      <header className="topbar">
        <button className="brand-lockup" onClick={() => setView("studio")} aria-label="CreatorAI studio">
          <span className="brand-mark"><span /></span>
          <span>creator<span className="brand-light">ai</span></span>
        </button>
        <div className="topbar-divider" />
        <nav className="primary-nav" aria-label="Main navigation">
          <button className={view === "studio" ? "nav-tab is-active" : "nav-tab"} onClick={() => setView("studio")}><Film size={15} /> Studio</button>
          <button className={view === "universe" ? "nav-tab is-active" : "nav-tab"} onClick={() => setView("universe")}><Layers size={15} /> Universe <span className="nav-count">1.2k</span></button>
        </nav>
        <form className="global-search" onSubmit={searchUniverse}>
          <Search size={15} />
          <input aria-label="Search your creator universe" placeholder="Search your entire creative life..." value={searchText} onChange={(event) => setSearchText(event.target.value)} />
          <kbd>⌘ K</kbd>
        </form>
        <div className="topbar-actions">
          <span className="sync-indicator"><span /> All changes saved</span>
          <button className="icon-button topbar-icon" aria-label="Help"><CircleHelp size={17} /></button>
          <div className="user-avatar" title={user?.name ?? "Creator"} style={user?.picture ? { backgroundImage: `url(${user.picture})` } : undefined}>{!user?.picture && (user?.name?.[0] ?? "M")}</div>
          <button className="icon-button topbar-icon" aria-label="Sign out" onClick={onLogout}><LogOut size={16} /></button>
        </div>
      </header>

      {view === "studio" ? (
        <section className="studio-grid" aria-label="Creator studio">
          <div className="workbench-top">
            <aside className="asset-panel">
              <div className="panel-heading">
                <div><span className="eyebrow">PROJECT LIBRARY</span><h2>Morning pages <ChevronDown size={14} /></h2></div>
                <button className="icon-button small-icon" aria-label="Add media"><Plus size={16} /></button>
              </div>
              <div className="asset-tabs"><button className="selected">All <span>28</span></button><button>Video</button><button>Audio</button></div>
              <div className="library-search"><Search size={14} /><input aria-label="Filter media library" placeholder="Find a moment..." value={searchText} onChange={(event) => setSearchText(event.target.value)} /><button aria-label="Filter options"><Settings2 size={14} /></button></div>
              <div className="library-meta"><span>RECENT MEDIA</span><button>Sort <ChevronDown size={12} /></button></div>
              <div className="media-list">
                {filteredMedia.map((asset) => (
                  <article className={`media-row ${activeAssetId === asset.id ? "is-selected" : ""}`} key={asset.id}>
                    <button className="media-thumb" style={{ backgroundImage: `url(${asset.imageUrl})` }} onClick={() => setActiveAssetId(asset.id)} draggable onDragStart={(event) => event.dataTransfer.setData("assetId", asset.id)} aria-label={`Preview ${asset.title}`}>
                      <span className="duration-chip">{asset.duration}</span><span className="thumb-play"><Play size={12} fill="currentColor" /></span>
                    </button>
                    <button className="media-copy" onClick={() => setActiveAssetId(asset.id)}><strong>{asset.title}</strong><span>{asset.category} <i /> {asset.creator}</span></button>
                    <button className="icon-button add-media" aria-label={`Add ${asset.title} to timeline`} onClick={() => addAsset(asset)}><Plus size={15} /></button>
                  </article>
                ))}
                {filteredMedia.length === 0 && <p className="empty-search">No moments match that search.</p>}
              </div>
              <div className="library-footer"><span className="storage-dot" /> 28 assets <span>·</span> 18.4 GB</div>
            </aside>

            <section className="preview-panel">
              <div className="editor-toolbar">
                <div className="tool-tabs"><button className="active-tool">Cut</button><button>Color</button><button>Captions</button><button>Sound</button></div>
                <button className="mobile-agent-toggle" onClick={() => setMobileAgentOpen(!mobileAgentOpen)}><Sparkles size={14} /> AI agent</button>
                <div className="aspect-picker" aria-label="Preview aspect ratio">
                  {["16:9", "9:16", "1:1", "4:5"].map((format) => <button key={format} className={aspect === format ? "is-selected" : ""} onClick={() => setAspect(format)}>{format}</button>)}
                </div>
                <button className="icon-button small-icon" aria-label="Preview settings"><MoreHorizontal size={17} /></button>
              </div>

              <div className="preview-stage" ref={stageRef}>
                <div className="preview-frame" data-aspect={aspect}>
                  <div className="preview-image" style={{ backgroundImage: `url(${activeAsset.imageUrl})` }} />
                  <div className="preview-shade" />
                  <div className="scene-label"><span className="live-dot" /> PREVIEW <span>·</span> {activeAsset.category.toUpperCase()}</div>
                  <button className="large-play" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause preview" : "Play preview"}>{playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
                  <div className="preview-caption">I used to think rest<br />had to be earned.</div>
                  <div className="frame-counter">{formatTime(playhead)} <span>/</span> 00:37:12</div>
                </div>
              </div>

              <div className="transport-bar">
                <div className="transport-time"><span>{formatTime(playhead)}</span><span className="time-divider">/</span><span>00:37:12</span></div>
                <div className="transport-controls">
                  <button className="icon-button" aria-label="Previous frame" onClick={() => setPlayhead((time) => Math.max(0, time - 1 / 24))}><ChevronRight className="flip-icon" size={16} /></button>
                  <button className="play-control" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
                  <button className="icon-button" aria-label="Next frame" onClick={() => setPlayhead((time) => Math.min(60, time + 1 / 24))}><ChevronRight size={16} /></button>
                </div>
                <div className="transport-tools"><button className="icon-button" aria-label="Volume"><Volume2 size={16} /></button><button className="icon-button" aria-label="Fullscreen" onClick={() => stageRef.current?.requestFullscreen?.()}><Maximize2 size={15} /></button></div>
              </div>
            </section>

            <aside className={`agent-panel ${mobileAgentOpen ? "is-mobile-open" : ""}`}>
              <div className="agent-header"><div className="agent-title"><span className="agent-spark"><Sparkles size={15} /></span><div><span className="eyebrow">CREATORAI</span><h2>Studio agent</h2></div></div><button className="icon-button small-icon" aria-label="Close agent" onClick={() => setMobileAgentOpen(false)}><X size={16} /></button></div>
              <div className="agent-project"><span className="project-status"><span /> EDITING WITH YOU</span><button className="icon-button small-icon" aria-label="Agent options"><MoreHorizontal size={16} /></button></div>
              <div className="agent-feed">
                <div className="agent-message"><span className="message-avatar"><Sparkles size={13} /></span><div><p>I&apos;ve been through this episode. There’s a stronger opening 6 seconds in.</p><span className="message-time">Just now · from your library</span></div></div>
                <div className="activity-card">
                  <div className="activity-title"><Activity size={14} /><strong>{agentState === "working" ? "Working across your project" : "Episode analyzed"}</strong><span className={agentState === "working" ? "activity-pulse" : "activity-done"}>{agentState === "working" ? "LIVE" : "DONE"}</span></div>
                  <div className="activity-steps">
                    {[
                      ["Transcribed the episode", true],
                      ["Found 6 high-retention moments", true],
                      ["Matched your storytelling style", true],
                      [agentState === "working" ? "Preparing your edit" : "Proposed a tighter opening", agentState === "ready"],
                    ].map(([label, done]) => <div className={`activity-step ${done ? "is-done" : "is-current"}`} key={String(label)}><span>{done ? <Check size={11} /> : <span className="step-loader" />}</span>{label}</div>)}
                  </div>
                  <div className="moment-suggestions"><div className="suggestion-thumb" style={{ backgroundImage: `url(${media[4].imageUrl})` }}><span>00:18</span><Play size={12} fill="currentColor" /></div><div><strong>“I stopped waiting to feel ready.”</strong><span>Podcast #17 · 18:24 <i /> 96% hook score</span></div></div>
                  <div className="suggestion-footer"><span><Sparkles size={12} /> Suggested edit</span><button onClick={applyIntroCut} disabled={agentState === "working" || !timeline.some((clip) => clip.id === "cold-open")}>{timeline.some((clip) => clip.id === "cold-open") ? "Apply cut" : "Applied"}<ChevronRight size={13} /></button></div>
                </div>
                <div className="memory-card"><div className="memory-heading"><span><Heart size={13} /> CREATOR MEMORY</span><button aria-label="Open creator memory" onClick={() => setView("universe")}><ChevronRight size={14} /></button></div><p>“Your honest, low-key openings outperform polished introductions by <strong>2.4×.</strong>”</p><div className="memory-source"><span className="memory-avatar" style={{ backgroundImage: `url(${media[1].imageUrl})` }} /><span>Based on 31 published videos</span><button aria-label="View memory source"><Eye size={13} /></button></div></div>
                {request && <div className="request-note"><span>YOU ASKED</span><p>{request}</p></div>}
              </div>
              <form className="agent-composer" onSubmit={(event) => { event.preventDefault(); if (request.trim()) runAgent(request); }}>
                <input aria-label="Ask CreatorAI to edit" value={request} onChange={(event) => setRequest(event.target.value)} placeholder="Ask it to make an edit..." />
                <div><button type="button" className="icon-button" aria-label="Add context"><Plus size={15} /></button><span>⌘ ↵</span><button className="send-agent" aria-label="Send to agent" type="submit"><ChevronRight size={16} /></button></div>
              </form>
            </aside>
          </div>

          <section className="timeline-panel" aria-label="Project timeline">
            <div className="timeline-toolbar">
              <div className="timeline-name"><Layers size={15} /><strong>Timeline</strong><span className="timeline-project">Morning pages / v03 <ChevronDown size={12} /></span></div>
              <div className="timeline-actions"><button className="icon-button" aria-label="Undo" onClick={undo} disabled={!undoStack.length}><Undo2 size={16} /></button><button className="icon-button" aria-label="Redo" onClick={redo} disabled={!redoStack.length}><Redo2 size={16} /></button><span className="toolbar-divider" /><button className="icon-button" aria-label="Split clip at playhead" onClick={splitAtPlayhead}><Scissors size={15} /></button><button className="icon-button" aria-label="Add track" onClick={() => addAsset(media[2], "video")}><Plus size={16} /></button><span className="toolbar-divider" /><button className="icon-button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))}><ZoomOut size={15} /></button><input aria-label="Timeline zoom" type="range" min="0.7" max="1.7" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><button className="icon-button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.7, value + 0.1))}><ZoomIn size={15} /></button><button className="icon-button fit-button" aria-label="Fit timeline" onClick={() => setZoom(1)}><span>FIT</span></button></div>
            </div>
            <div className="timeline-body">
              <div className="track-labels"><div className="ruler-spacer">00:00</div>{tracks.map((track) => { const TrackIcon = track.icon; return <div className="track-label" key={track.id}><span className={`track-icon ${track.tint}`}><TrackIcon size={12} /></span><span className="track-code">{track.code}</span><span>{track.label}</span><button aria-label={`${track.label} track options`}><MoreHorizontal size={13} /></button></div>; })}</div>
              <div className="timeline-scroll">
                <div className="timeline-content" style={{ width: `${zoom * 100}%` }}>
                  <div className="timeline-ruler" onClick={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setPlayhead(Math.max(0, Math.min(60, ((event.clientX - bounds.left) / bounds.width) * 60))); }}>
                    {Array.from({ length: 13 }, (_, index) => <span key={index} style={{ left: `${(index / 12) * 100}%` }}>{index === 0 ? "00:00" : `${Math.floor(index * 5 / 60).toString().padStart(2, "0")}:${((index * 5) % 60).toString().padStart(2, "0")}`}</span>)}
                  </div>
                  <div className="track-stack">
                    <div className="playhead-line" style={{ left: `${(playhead / 60) * 100}%` }}><span /></div>
                    {tracks.map((track) => <div className={`timeline-lane lane-${track.id}`} key={track.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, track.id)}>
                      {timeline.filter((clip) => clip.lane === track.id).map((clip) => <button className={`timeline-clip clip-${track.id}`} key={clip.id} style={{ left: `${(clip.start / 60) * 100}%`, width: `${Math.max((clip.duration / 60) * 100, 2.5)}%`, backgroundImage: clip.imageUrl ? `linear-gradient(0deg, rgba(9,15,14,.72), rgba(9,15,14,.04)), url(${clip.imageUrl})` : undefined }} draggable onDragStart={(event) => event.dataTransfer.setData("clipId", clip.id)} title={`${clip.title} · drag to move`}>
                        {track.id === "audio" || track.id === "music" ? <span className="waveform" aria-hidden="true">{Array.from({ length: 40 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 13 + clip.id.length * 7) % 74)}%` }} />)}</span> : null}
                        <span className="clip-label">{track.id === "captions" ? <Captions size={11} /> : null}{clip.caption ?? clip.title}</span>
                      </button>)}
                    </div>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="timeline-foot"><span><span className="snap-indicator" /> Snap on</span><span>{timeline.length} clips <i /> 5 tracks <i /> 24 fps</span><span className="timeline-foot-right">{formatTime(playhead)} <span>·</span> {playing ? "Playing" : "Ready"}</span></div>
          </section>
        </section>
      ) : (
        <section className="universe-view">
          <div className="universe-heading"><div><span className="eyebrow">YOUR CREATIVE MEMORY</span><h1>Everything you’ve made,<br /><em>still in motion.</em></h1><p>One searchable universe of every story, scene, and idea you’ve put into the world.</p></div><div className="universe-stat"><span>YOUR UNIVERSE</span><strong>1,284</strong><small>moments indexed <i /> updated just now</small></div></div>
          <form className="universe-search" onSubmit={searchUniverse}><Search size={18} /><input aria-label="Search creator memory and media" autoFocus placeholder="Find every moment where I talk about..." value={searchText} onChange={(event) => setSearchText(event.target.value)} /><span>TRANSCRIPT · VISUAL · IDEAS</span><button type="submit">Search <ChevronRight size={15} /></button></form>
          <div className="universe-filters"><span>RECENTLY RESONATING</span><button className="filter-active">All moments <span>43</span></button><button>Published</button><button>Unpublished <span>1,284</span></button><button>High performing</button><button className="universe-filter-right"><Settings2 size={14} /> Filter</button></div>
          <div className="moment-wall">
            {universeMoments.map((moment) => <article className={`moment-card ${moment.shape}`} key={moment.id}>
              <button className="moment-image" style={{ backgroundImage: `linear-gradient(0deg, rgba(9,15,14,.78), transparent 54%), url(${moment.imageUrl})` }} onClick={() => { setActiveAssetId(moment.id); setView("studio"); }} aria-label={`Open ${moment.title}`}>
                <span className="moment-category">{moment.category}</span><span className="moment-play"><Play size={13} fill="currentColor" /></span><span className="moment-duration">{moment.duration}</span>
              </button>
              <div className="moment-info"><div><h3>{moment.title}</h3><span>{moment.views} <i /> AI score {moment.score}</span></div><div className="moment-actions"><button aria-label="Save moment"><Bookmark size={14} /></button><button aria-label="Add moment to timeline" onClick={() => { addAsset(moment, "video", 36); setView("studio"); }}><Plus size={15} /></button></div></div>
            </article>)}
          </div>
          <section className="genealogy-section"><div className="section-title-row"><div><span className="eyebrow">CONTENT GENEALOGY</span><h2>One idea, five lives.</h2></div><button onClick={() => setView("studio")}>Open timeline <ChevronRight size={14} /></button></div><div className="genealogy-track">{[
            ["PODCAST", "The slow reset", "42 min", media[0].imageUrl],
            ["YOUTUBE", "A softer routine", "12 min", media[2].imageUrl],
            ["SHORT", "6am reset", "34 sec", media[1].imageUrl],
            ["NEWSLETTER", "An earned rest", "4 min", media[3].imageUrl],
          ].map(([kind, title, length, imageUrl], index) => <div className="genealogy-node-wrap" key={kind}><button className="genealogy-node" onClick={() => { setActiveAssetId(media[index % media.length].id); setView("studio"); }}><span className="genealogy-image" style={{ backgroundImage: `url(${imageUrl})` }} /><span className="genealogy-copy"><small>{kind}</small><strong>{title}</strong><i>{length}</i></span></button>{index < 3 && <ChevronRight className="genealogy-arrow" size={16} />}</div>)}</div></section>
          <section className="unused-section"><div className="section-title-row"><div><span className="eyebrow">CONTENT YOU HAVEN’T USED</span><h2>There’s more in the archive.</h2></div><span className="unused-count">1,284 <small>moments</small></span></div><div className="unused-grid">{media.slice(1, 4).map((asset) => <article className="unused-card" key={asset.id}><button className="unused-image" style={{ backgroundImage: `url(${asset.imageUrl})` }} onClick={() => { setActiveAssetId(asset.id); setView("studio"); }} aria-label={`Preview ${asset.title}`}><span><Play size={12} fill="currentColor" /></span></button><div><span>{asset.category.toUpperCase()} <i /> {asset.duration}</span><strong>{asset.title}</strong><button onClick={() => { addAsset(asset); setView("studio"); }}><Plus size={13} /> Use in edit</button></div></article>)}</div></section>
          <footer className="universe-footer"><span><Sparkles size={13} /> Creator memory learns from every edit you make.</span><span>TRANSCRIPTS <i /> VISUALS <i /> PERFORMANCE <i /> YOUR VOICE</span></footer>
        </section>
      )}
    </main>
  );
}