"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Video, ExternalLink, ArrowRight, CheckSquare,
  Square, Sparkles, MessageCircle, RefreshCw, Scissors, ChevronRight,
} from "lucide-react";
import {
  videos,
  activeProjects,
  opportunities,
  unusedContent,
  audienceQuestions,
  creatorMemory,
} from "../../data/mockData";
import { HandDrawnBorder } from "../editorial/HandDrawnBorder";

export function DashboardHome() {
  const featuredVideo = videos[0];
  const [videoHovered, setVideoHovered] = useState(false);
  const [ideas, setIdeas] = useState([
    { id: "i1", text: "Follow-up on AI agents & context rot", checked: true, note: "high priority" },
    { id: "i2", text: "Behind the scenes of building CreatorAI", checked: false, note: "43 raw clips ready" },
    { id: "i3", text: "Open-source local LLMs setup guide", checked: false, note: "31 audience requests" },
    { id: "i4", text: "LangGraph vs LlamaIndex deep dive", checked: true, note: "updated API" },
    { id: "i5", text: "Mumbai creator vlog & studio tour", checked: false, note: "editing in progress" },
  ]);

  const toggleIdea = (id: string) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-16 pb-24">
      {/* ─── TOP EDITORIAL HEADER ──────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#320B10] pb-6 gap-4">
        <div>
          <h1 className="font-serif-display text-5xl sm:text-6xl font-bold tracking-tight text-[#F4EDE4]">
            STUDIO
          </h1>
          <p className="font-handwritten text-xl text-[#C94345] mt-1">
            Everything you create, connected.
          </p>
        </div>

        <div className="text-left md:text-right font-mono text-xs text-[#8F8580] space-y-0.5">
          <div className="font-bold text-[#D9C9BC]">Wednesday, 3 October</div>
          <div>248 videos · 1,842 moments · 127 unused clips</div>
        </div>
      </header>

      {/* ─── HERO AREA: ASYMMETRIC PINBOARD COMPOSITION ──────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Editorial Copy (5 cols) */}
        <div className="lg:col-span-5 space-y-6 pt-2">
          <div className="inline-block px-3 py-1 bg-[#320B10] border border-[#4A1017] rounded text-xs font-mono text-[#D9C9BC]">
            CURRENT SESSION
          </div>

          <div className="space-y-2">
            <h2 className="font-serif-display text-4xl sm:text-5xl font-bold text-[#F4EDE4] leading-none tracking-tight">
              YOUR<br />STUDIO
            </h2>
            <p className="text-base text-[#D9C9BC]/80 max-w-md leading-relaxed font-sans pt-2">
              Search, edit, remix, and build from everything you&rsquo;ve ever recorded.
            </p>
          </div>

          {/* Handwritten Annotation */}
          <div className="pt-2 flex items-center gap-3">
            <span className="font-handwritten text-lg text-[#C94345]">
              ideas → recordings → edits → clips
            </span>
            <span className="h-[1px] w-12 bg-[#8E2630]/50" />
          </div>

          {/* Quick Studio Tools */}
          <div className="pt-4 flex flex-wrap gap-3">
            <button className="px-5 py-2 bg-[#4A1017] hover:bg-[#8E2630] border border-[#8E2630] text-[#F4EDE4] font-bold text-xs rounded transition-colors tactile-shadow flex items-center gap-2">
              <Play size={12} fill="currentColor" />
              <span>Resume Last Cut</span>
            </button>
            <button className="px-4 py-2 bg-[#320B10] hover:bg-[#4A1017] border border-[#4A1017] text-[#D9C9BC] font-semibold text-xs rounded transition-colors shadow-xs">
              Open Archive
            </button>
          </div>
        </div>

        {/* Right Dominant Video Frame (7 cols) */}
        <div className="lg:col-span-7">
          <HandDrawnBorder
            annotation="continue here →"
            annotationPosition="top-right"
            variant="cream"
            className="p-3"
          >
            <div
              className="relative aspect-video overflow-hidden rounded group cursor-pointer bg-black"
              onMouseEnter={() => setVideoHovered(true)}
              onMouseLeave={() => setVideoHovered(false)}
            >
              <img
                src={featuredVideo.thumbnail}
                alt={featuredVideo.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#210709] via-transparent to-black/30" />

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: videoHovered ? 1.1 : 1 }}
                  className="w-16 h-16 rounded-full bg-[#C94345]/90 text-[#F4EDE4] flex items-center justify-center shadow-xl border border-[#F4EDE4]/40"
                >
                  <Play size={24} className="ml-1" fill="currentColor" />
                </motion.div>
              </div>

              {/* Video Title & Minimal Metadata (No pill badges) */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <div className="text-xs font-handwritten text-[#D9C9BC] mb-1">
                  latest recording · edit in progress
                </div>
                <h3 className="font-serif-display text-2xl text-[#F4EDE4] font-bold leading-tight">
                  {featuredVideo.title}
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono text-[#D9C9BC]/70 mt-2">
                  <span>{featuredVideo.platform}</span>
                  <span>·</span>
                  <span>{featuredVideo.duration}</span>
                  <span>·</span>
                  <span>{featuredVideo.publishedAt}</span>
                  <span className="ml-auto">{featuredVideo.views} views</span>
                </div>
              </div>
            </div>

            {/* Contextual Action Strip */}
            <div className="pt-3 px-1 flex items-center justify-between text-xs text-[#D9C9BC]">
              <span className="font-handwritten text-sm text-[#C94345]">12 moments ready for clips</span>
              <div className="flex items-center gap-4">
                <button className="hover:text-[#F4EDE4] flex items-center gap-1 font-semibold">
                  <Scissors size={12} />
                  <span>Cut Shorts</span>
                </button>
                <button className="hover:text-[#F4EDE4] flex items-center gap-1 font-semibold">
                  <ExternalLink size={12} />
                  <span>Open in Timeline</span>
                </button>
              </div>
            </div>
          </HandDrawnBorder>
        </div>
      </section>

      {/* ─── SECTION: YOUR WORK (Editorial Media Pinboard) ──────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">recent releases</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">YOUR WORK</h2>
          </div>
          <button className="text-xs font-mono text-[#D9C9BC]/60 hover:text-[#F4EDE4]">
            View all 248 videos →
          </button>
        </div>

        {/* Pinboard Grid: 1 large + 2 small + clips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.slice(1, 4).map((v, idx) => (
            <div
              key={v.id}
              className={`bg-[#320B10] border border-[#4A1017] p-3 rounded tactile-shadow transition-transform hover:-translate-y-1 ${
                idx === 0 ? "md:col-span-2" : ""
              }`}
            >
              <div className="aspect-video relative overflow-hidden rounded mb-3 bg-black">
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-85" />
                <span className="absolute bottom-2 right-2 bg-[#210709]/80 text-[#F4EDE4] font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#4A1017]">
                  {v.duration}
                </span>
              </div>

              <h3 className="font-serif-display text-lg font-bold text-[#F4EDE4] leading-snug mb-2">
                {v.title}
              </h3>

              {/* Minimal Human Metadata (No Badges) */}
              <div className="flex items-center justify-between text-xs font-mono text-[#8F8580] pt-2 border-t border-[#4A1017]">
                <span>{v.platform} · {v.publishedAt}</span>
                <span className="text-[#D9C9BC] font-semibold">{v.views} views</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION: WORTH REVISITING ────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">unused footage & hidden gems</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">WORTH REVISITING</h2>
          </div>
          <span className="font-mono text-xs text-[#8F8580]">127 clips detected</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {unusedContent.map((item, idx) => {
            const annotations = ["great hook", "forgotten clip", "could become a short", "strong ending"];
            return (
              <HandDrawnBorder
                key={item.id}
                annotation={annotations[idx % annotations.length]}
                annotationPosition={idx % 2 === 0 ? "top-right" : "top-left"}
                variant={idx === 1 ? "cream" : "maroon"}
                className="p-3"
              >
                <div className="aspect-video relative overflow-hidden rounded mb-2.5 bg-black">
                  <img src={item.thumbnail} alt={item.source} className="w-full h-full object-cover opacity-80" />
                  <span className="absolute bottom-1 right-1 bg-[#210709]/90 text-[#F4EDE4] font-mono text-[10px] px-1 rounded">
                    {item.duration}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#F4EDE4] mb-1 line-clamp-1">From: {item.source}</div>
                <div className="text-[11px] font-handwritten text-[#C94345] mb-3">"{item.suggestedUse}"</div>

                <button className="w-full py-1.5 bg-[#4A1017] hover:bg-[#8E2630] text-[#F4EDE4] font-bold text-xs rounded transition-colors shadow-xs">
                  Extract Clip
                </button>
              </HandDrawnBorder>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION: FROM YOUR AUDIENCE ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">what subscribers keep asking</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">FROM YOUR AUDIENCE</h2>
          </div>
        </div>

        {/* Paper Note Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audienceQuestions.slice(0, 3).map((aq, idx) => (
            <div
              key={aq.id}
              className="paper-note p-5 rounded relative flex flex-col justify-between space-y-4"
              style={{ transform: idx === 1 ? "rotate(1deg)" : idx === 2 ? "rotate(-1deg)" : "rotate(0deg)" }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#8F8580]">
                  <span>QUESTION NOTE</span>
                  <span className="text-[#C94345] font-bold">{aq.mentions} people asked</span>
                </div>
                <p className="font-serif-display text-lg text-[#F4EDE4] italic leading-snug">
                  &ldquo;{aq.question}&rdquo;
                </p>
              </div>

              {/* Lineage Flow: QUESTION -> RELATED VIDEO -> FOLLOW-UP */}
              <div className="pt-3 border-t border-[#4A1017] space-y-2 text-xs font-mono">
                <div className="text-[#D9C9BC]/60 flex items-center gap-1.5">
                  <span className="text-[#C94345]">↓</span>
                  <span>Related to: RAG Tutorial</span>
                </div>
                <button className="w-full py-1.5 bg-[#4A1017] hover:bg-[#C94345] text-[#F4EDE4] font-bold rounded transition-colors text-center text-xs">
                  Create Video Script →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION: IDEAS (Notebook Format) ─────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">sketchbook & future topics</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">IDEAS</h2>
          </div>
        </div>

        {/* Physical Notebook Card */}
        <div className="bg-[#2E0B0F] border border-[#4A1017] rounded p-6 tactile-shadow space-y-4 max-w-3xl">
          <div className="font-mono text-xs text-[#8F8580] uppercase tracking-wider border-b border-[#4A1017] pb-2">
            Active Notebook Checklist
          </div>

          <div className="space-y-3 font-sans">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => toggleIdea(idea.id)}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="mt-0.5 text-[#C94345]">
                  {idea.checked ? <CheckSquare size={16} /> : <Square size={16} className="text-[#8E2630]" />}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold transition-colors ${idea.checked ? "line-through text-[#8F8580]" : "text-[#F4EDE4] group-hover:text-[#C94345]"}`}>
                    {idea.text}
                  </span>
                  <span className="ml-3 text-xs font-handwritten text-[#C94345]">
                    ({idea.note})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION: YOUR CONTENT UNIVERSE (Visual Collage Lineage) ─────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">how your creation branches out</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">YOUR CONTENT UNIVERSE</h2>
          </div>
        </div>

        {/* Visual Lineage Flow */}
        <div className="bg-[#320B10] border border-[#4A1017] rounded p-6 tactile-shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
            {/* Step 1: Video */}
            <div className="flex flex-col items-center text-center p-3 bg-[#210709] border border-[#4A1017] rounded w-full md:w-48">
              <span className="text-[10px] text-[#C94345] font-bold uppercase mb-1">LONG-FORM VIDEO</span>
              <img src={videos[0].thumbnail} alt="Video" className="w-full h-20 object-cover rounded mb-2" />
              <span className="text-[#F4EDE4] font-semibold line-clamp-1">{videos[0].title}</span>
            </div>

            <span className="text-xl font-bold text-[#C94345]">↓</span>

            {/* Step 2: Clip */}
            <div className="flex flex-col items-center text-center p-3 bg-[#210709] border border-[#4A1017] rounded w-full md:w-48">
              <span className="text-[10px] text-amber-400 font-bold uppercase mb-1">RECOVERED MOMENT</span>
              <img src={unusedContent[0].thumbnail} alt="Clip" className="w-full h-20 object-cover rounded mb-2" />
              <span className="text-[#F4EDE4] font-semibold line-clamp-1">Why Agents Fail</span>
            </div>

            <span className="text-xl font-bold text-[#C94345]">↓</span>

            {/* Step 3: Audience Question */}
            <div className="flex flex-col items-center text-center p-3 bg-[#210709] border border-[#4A1017] rounded w-full md:w-48">
              <span className="text-[10px] text-[#D9C9BC] font-bold uppercase mb-1">SUBSCRIBER DEMAND</span>
              <p className="font-serif-display text-xs text-[#F4EDE4] italic my-auto py-2">
                "How to debug context leaks?"
              </p>
            </div>

            <span className="text-xl font-bold text-[#C94345]">↓</span>

            {/* Step 4: Follow-up Idea */}
            <div className="flex flex-col items-center text-center p-3 bg-[#4A1017] border border-[#8E2630] rounded w-full md:w-48 shadow-sm">
              <span className="text-[10px] text-[#F4EDE4] font-bold uppercase mb-1">NEXT PROJECT</span>
              <span className="font-handwritten text-sm text-[#F4EDE4] my-auto py-2">
                Part 2: Production RAG Guide
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION: YOUR CREATIVE LANGUAGE (Creator Memory) ───────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">notebook of your creative patterns</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">YOUR CREATIVE LANGUAGE</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#320B10] border border-[#4A1017] p-5 rounded tactile-shadow space-y-3">
            <h3 className="font-serif-display text-xl font-bold text-[#F4EDE4]">Voice & Structure Observations</h3>
            <p className="text-sm text-[#D9C9BC]/80 leading-relaxed font-sans">
              &ldquo;{creatorMemory.voice.style}&rdquo;
            </p>
            <ul className="space-y-1.5 text-xs font-mono text-[#D9C9BC]/70 pt-2 border-t border-[#4A1017]">
              {creatorMemory.voice.patterns.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="text-[#C94345]">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#320B10] border border-[#4A1017] p-5 rounded tactile-shadow space-y-3">
            <h3 className="font-serif-display text-xl font-bold text-[#F4EDE4]">Content DNA</h3>
            <p className="text-sm text-[#D9C9BC]/80 leading-relaxed italic">
              &ldquo;{creatorMemory.contentDNA}&rdquo;
            </p>
            <div className="pt-2 border-t border-[#4A1017] font-handwritten text-base text-[#C94345]">
              "Keep technical depth high — your audience values proof over hype."
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION: WHAT'S NEXT (Opportunities) ───────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#320B10] pb-3">
          <div>
            <span className="font-handwritten text-lg text-[#C94345] block">collaborator recommendation</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4EDE4]">WHAT&rsquo;S NEXT</h2>
          </div>
        </div>

        <HandDrawnBorder variant="cream" className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-serif-display text-2xl font-bold text-[#F4EDE4]">
                Your audience keeps asking about RAG systems.
              </h3>
              <p className="text-sm text-[#D9C9BC]/80 font-sans">
                You already have 31 audience questions, 4 related videos averaging 82K views, and 2 unused high-quality clips.
              </p>
            </div>

            <button className="px-6 py-3 bg-[#C94345] hover:bg-[#D94B50] text-[#F4EDE4] font-bold text-sm rounded transition-colors shadow-[3px_4px_0px_#110304] whitespace-nowrap">
              Build Follow-up Video →
            </button>
          </div>
        </HandDrawnBorder>
      </section>
    </div>
  );
}

export default DashboardHome;

