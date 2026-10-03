"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ChevronRight, Check, Hash, Mic, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { creatorMemory, videos, creatorProfile } from "@/data/mockData";

function MemoryCard({
  label,
  children,
  accent = "blue",
}: {
  label: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const accentMap: Record<string, string> = {
    blue: "border-blue-500/15 bg-blue-500/[0.04]",
    emerald: "border-emerald-500/15 bg-emerald-500/[0.04]",
    amber: "border-amber-500/15 bg-amber-500/[0.04]",
    purple: "border-purple-500/15 bg-purple-500/[0.04]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border p-5 ${accentMap[accent] || accentMap.blue}`}
    >
      <span className="text-[9px] font-bold tracking-widest uppercase text-white/25 block mb-4">
        {label}
      </span>
      {children}
    </motion.div>
  );
}

export default function MemoryPage() {
  const { voice, visual, hooks, topics, contentDNA } = creatorMemory;
  const { stats } = creatorProfile;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0B0D] text-white">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase block mb-1.5">
            Intelligence
          </span>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white/90 tracking-tight flex items-center gap-2">
                <BrainCircuit size={22} className="text-blue-400" />
                Creator Memory
              </h1>
              <p className="text-[13px] text-white/35 mt-1">
                CreatorAI understands how you think, create, and communicate. This is your content identity.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/25 bg-[#111214] px-3 py-2 rounded-xl border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Memory synced · {stats.totalVideos} videos analyzed
            </div>
          </div>
        </div>

        {/* Content DNA Banner */}
        <div className="mb-8 p-6 bg-[#0E0F11] border border-white/[0.07] rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05)_0%,transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/25 block mb-2">
              Content DNA
            </span>
            <p className="text-[18px] text-white/80 leading-relaxed font-medium max-w-2xl italic">
              &ldquo;{contentDNA}&rdquo;
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              {[
                { label: "Depth", val: 90, color: "bg-blue-400" },
                { label: "Accessibility", val: 78, color: "bg-emerald-400" },
                { label: "Authenticity", val: 95, color: "bg-amber-400" },
                { label: "Consistency", val: 88, color: "bg-purple-400" },
              ].map((bar) => (
                <div key={bar.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30 w-20">{bar.label}</span>
                  <div className="w-20 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div className={`h-full rounded-full ${bar.color} opacity-70`} style={{ width: `${bar.val}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{bar.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Memory grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {/* Voice */}
          <MemoryCard label="Voice & Delivery" accent="blue">
            <p className="text-[14px] font-medium text-white/80 mb-4 leading-relaxed">
              &ldquo;{voice.style}&rdquo;
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <Mic size={11} className="text-blue-400 flex-shrink-0" />
                Pace: {voice.pace}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <Eye size={11} className="text-blue-400 flex-shrink-0" />
                Tone: {voice.tone}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold">Patterns</span>
              {voice.patterns.map((p) => (
                <div key={p} className="flex items-start gap-2 text-[11px] text-white/40">
                  <Check size={10} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </MemoryCard>

          {/* Topics */}
          <MemoryCard label="Topic DNA" accent="emerald">
            <div className="mb-4">
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-2">Primary</span>
              <div className="flex flex-wrap gap-1.5">
                {topics.primary.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-2">Secondary</span>
              <div className="flex flex-wrap gap-1.5">
                {topics.secondary.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.05] text-white/35 border border-white/[0.06]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-2">Expertise</span>
              <div className="flex flex-wrap gap-1.5">
                {topics.expertise.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-[10px] text-white/30 flex items-center gap-1"
                  >
                    <Hash size={8} className="text-white/20" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </MemoryCard>

          {/* Hook Style */}
          <MemoryCard label="Hook Intelligence" accent="amber">
            <div className="mb-4">
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-2">Preferred Styles</span>
              {hooks.preferred.map((h, i) => (
                <div key={h} className="flex items-center gap-2.5 mb-2">
                  <span className="text-[10px] font-mono text-amber-400/40 w-4">0{i + 1}</span>
                  <span className="text-[13px] font-medium text-white/70">{h}</span>
                </div>
              ))}
            </div>
            <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-2">
                Your Best Hooks
              </span>
              {hooks.topExamples.map((ex) => (
                <p key={ex} className="text-[11px] text-white/40 italic mb-1">&ldquo;{ex}&rdquo;</p>
              ))}
            </div>
            <div>
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-1.5">Avoid</span>
              {hooks.avoid.map((a) => (
                <span key={a} className="text-[10px] text-white/20 line-through block">{a}</span>
              ))}
            </div>
          </MemoryCard>

          {/* Visual Style */}
          <MemoryCard label="Visual Identity" accent="purple">
            <p className="text-[14px] font-medium text-white/80 mb-4 leading-relaxed">
              &ldquo;{visual.style}&rdquo;
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="text-[11px] text-white/40">
                <span className="text-white/25 block text-[9px] uppercase tracking-widest mb-1">Editing style</span>
                {visual.editing}
              </div>
            </div>
            <div>
              <span className="text-[9px] tracking-widest uppercase text-white/20 font-bold block mb-2">Preferences</span>
              {visual.preferences.map((p) => (
                <div key={p} className="flex items-center gap-2 text-[11px] text-white/40 mb-1.5">
                  <div className="w-1 h-1 rounded-full bg-purple-400/50" />
                  {p}
                </div>
              ))}
            </div>
          </MemoryCard>

          {/* Content stats */}
          <MemoryCard label="Your Universe in Numbers" accent="blue">
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: stats.totalVideos, label: "Videos indexed" },
                { val: stats.indexedMoments.toLocaleString(), label: "Indexed moments" },
                { val: stats.unusedClips, label: "Unused clips" },
                { val: stats.opportunities, label: "Opportunities" },
                { val: stats.subscribers, label: "Subscribers" },
                { val: stats.totalViews, label: "Total views" },
              ].map((s) => (
                <div key={s.label} className="p-2.5 rounded-xl bg-[#0B0B0D] border border-white/[0.06]">
                  <div className="text-[16px] font-bold text-white/80 mb-0.5">{s.val}</div>
                  <div className="text-[10px] text-white/25">{s.label}</div>
                </div>
              ))}
            </div>
          </MemoryCard>

          {/* Patterns */}
          <MemoryCard label="Recurring Patterns" accent="emerald">
            <p className="text-[12px] text-white/35 mb-4">
              Patterns detected across your last 48 videos
            </p>
            {[
              { pattern: "Starts with the real problem, not the solution", freq: "94% of videos" },
              { pattern: "Uses personal failure stories as evidence", freq: "67% of videos" },
              { pattern: "Ends with a clear, single takeaway", freq: "88% of videos" },
              { pattern: "Shows code or terminal in first 90 seconds", freq: "71% of videos" },
              { pattern: "Mentions what not to do before what to do", freq: "52% of videos" },
            ].map((p) => (
              <div key={p.pattern} className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-white/[0.04] last:border-0 last:mb-0 last:pb-0">
                <p className="text-[11px] text-white/55 leading-snug">{p.pattern}</p>
                <span className="text-[10px] font-mono text-emerald-400/60 flex-shrink-0">{p.freq}</span>
              </div>
            ))}
          </MemoryCard>
        </div>

        {/* Recent videos used for memory */}
        <div className="bg-[#0E0F11] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] font-bold tracking-widest text-white/30 uppercase">
              Memory Built From
            </span>
            <button className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors">
              View all analyzed content
              <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {videos.slice(0, 4).map((v) => (
              <div key={v.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#111214] border border-white/[0.05] hover:border-white/10 transition-colors cursor-pointer group">
                <div
                  className="w-10 h-7 rounded-md bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${v.thumbnail})` }}
                />
                <p className="text-[10px] text-white/45 line-clamp-2 leading-snug group-hover:text-white/65 transition-colors">
                  {v.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
