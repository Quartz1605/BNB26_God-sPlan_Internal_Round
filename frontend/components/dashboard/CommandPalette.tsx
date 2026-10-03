"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Film, Scissors, Bot, Lightbulb, Archive, BrainCircuit, X, Mic, LayoutGrid, Repeat2 } from "lucide-react";

const commands = [
  {
    group: "Actions",
    items: [
      { id: "upload", label: "Upload video", icon: Upload, shortcut: "⌘ U", description: "Import from local or URL" },
      { id: "create", label: "Create new project", icon: Film, shortcut: "⌘ N", description: "Start a new content project" },
      { id: "editor", label: "Open editor", icon: Scissors, shortcut: "⌘ E", description: "Open the video editor" },
      { id: "record", label: "Start recording", icon: Mic, shortcut: null, description: "Record directly in the browser" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { id: "agent", label: "Ask AI Agent", icon: Bot, shortcut: "⌘ J", description: "Ask your AI creator agent anything" },
      { id: "clips", label: "Generate clips from video", icon: Scissors, shortcut: null, description: "Auto-generate clips from existing content" },
      { id: "repurpose", label: "Repurpose content", icon: Repeat2, shortcut: null, description: "One piece of content → many formats" },
    ],
  },
  {
    group: "Explore",
    items: [
      { id: "opportunities", label: "View content opportunities", icon: Lightbulb, shortcut: null, description: "See AI-discovered content opportunities" },
      { id: "unused", label: "Find unused footage", icon: Archive, shortcut: null, description: "Recover content you haven't used yet" },
      { id: "memory", label: "Open creator memory", icon: BrainCircuit, shortcut: null, description: "See how CreatorAI understands your style" },
      { id: "library", label: "Browse content library", icon: LayoutGrid, shortcut: null, description: "All your videos, clips, and assets" },
    ],
  },
];

const recentSearches = [
  "clips where I mention AI agents",
  "unused footage from podcast #17",
  "high-performing hooks",
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const allItems = commands.flatMap((g) => g.items);
  const filteredGroups = query
    ? [
        {
          group: "Results",
          items: allItems.filter(
            (cmd) =>
              cmd.label.toLowerCase().includes(query.toLowerCase()) ||
              cmd.description.toLowerCase().includes(query.toLowerCase())
          ),
        },
      ]
    : commands;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed top-[22%] left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] px-4">
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-[#17181B] rounded-2xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
                <Search size={15} className="text-white/35 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  placeholder='Try "find unused footage" or "generate clips"...'
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-[10px] font-mono text-white/25 px-1.5 py-0.5 rounded bg-white/5 border border-white/8 hover:text-white/50 transition-colors ml-1"
                >
                  Esc
                </button>
              </div>

              {/* Recent searches (when empty) */}
              {!query && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase">Recent Searches</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="text-[11px] text-white/40 hover:text-white/70 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.07] hover:bg-white/[0.08] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Commands */}
              <div className="max-h-[380px] overflow-y-auto pb-2">
                {filteredGroups.map((group) => (
                  <div key={group.group} className="mt-2">
                    <div className="px-4 py-1">
                      <span className="text-[10px] font-bold tracking-widest text-white/25 uppercase">
                        {group.group}
                      </span>
                    </div>
                    {group.items.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors group/item text-left"
                          onClick={onClose}
                        >
                          <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center border border-white/[0.08] group-hover/item:border-white/15 group-hover/item:bg-white/[0.09] transition-colors shrink-0">
                            <Icon size={13} className="text-white/45 group-hover/item:text-white/75" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-white/75 group-hover/item:text-white transition-colors">
                              {cmd.label}
                            </div>
                            <div className="text-[11px] text-white/30">{cmd.description}</div>
                          </div>
                          {cmd.shortcut && (
                            <span className="text-[10px] text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded-md border border-white/8 font-mono shrink-0">
                              {cmd.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {filteredGroups[0]?.items.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-white/25">
                    No commands match &ldquo;{query}&rdquo;
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-[11px] text-white/20">
                <span>
                  <kbd className="font-mono">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="font-mono">↵</kbd> select
                </span>
                <span>
                  <kbd className="font-mono">Esc</kbd> close
                </span>
                <span className="ml-auto text-white/15">⌘K to open anywhere</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
