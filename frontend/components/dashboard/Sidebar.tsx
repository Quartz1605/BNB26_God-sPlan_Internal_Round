"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Film,
  Clapperboard,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Scissors,
  Bot,
  Repeat2,
  BrainCircuit,
  Network,
  Users,
  Lightbulb,
  LineChart,
  FolderOpen,
  Library,
  CalendarDays,
  Settings,
  ChevronDown,
  ChevronRight,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navGroups = [
  {
    title: "",
    items: [
      { name: "Home", icon: Home, href: "/home" },
      { name: "My Studio", icon: Film, href: "/home/studio" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { name: "All Content", icon: LayoutGrid, href: "/home/library" },
      { name: "Videos", icon: Clapperboard, href: "/home/videos" },
      { name: "Scripts", icon: FileText, href: "/home/scripts" },
      { name: "Assets", icon: ImageIcon, href: "/home/assets" },
    ],
  },
  {
    title: "AI WORKSPACE",
    items: [
      { name: "AI Clip Lab", icon: Sparkles, href: "/home/ai-clips" },
      { name: "AI Editor", icon: Scissors, href: "/home/ai-editor" },
      { name: "AI Agent", icon: Bot, href: "/home/ai-agent" },
      { name: "Hook Lab", icon: Zap, href: "/home/hook-lab" },
      { name: "Repurpose", icon: Repeat2, href: "/home/repurpose" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "Creator Memory", icon: BrainCircuit, href: "/home/memory" },
      { name: "Content Graph", icon: Network, href: "/home/graph" },
      { name: "Audience", icon: Users, href: "/home/audience" },
      { name: "Opportunities", icon: Lightbulb, href: "/home/opportunities" },
      { name: "Analytics", icon: LineChart, href: "/home/analytics" },
    ],
  },
  {
    title: "WORKSPACE",
    items: [
      { name: "Projects", icon: FolderOpen, href: "/home/projects" },
      { name: "Collections", icon: Library, href: "/home/collections" },
      { name: "Publishing", icon: CalendarDays, href: "/home/publishing" },
      { name: "Settings", icon: Settings, href: "/home/settings" },
    ],
  },
];

interface SidebarProps {
  user: any;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ user, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 236 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen flex flex-col bg-[#120506] border-r border-red-950/40 text-white flex-shrink-0 overflow-hidden relative z-30"
    >
      {/* Top Header */}
      <div className="h-[60px] flex items-center px-4 border-b border-red-950/40 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 via-rose-700 to-red-900 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-950/80 border border-red-400/30">
              <span className="text-[12px] font-black text-white leading-none">C</span>
            </div>
            <span className="font-extrabold text-white tracking-tight text-[14px] truncate bg-clip-text text-transparent bg-gradient-to-r from-white via-red-100 to-red-300">
              CreatorAI
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-md">
              <span className="text-[12px] font-black text-white">C</span>
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg hover:bg-red-950/40 flex items-center justify-center text-red-200/30 hover:text-red-200 transition-colors flex-shrink-0"
          >
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-red-950/30">
          <button className="flex items-center justify-between w-full px-3 py-2 bg-[#1b080a] border border-red-900/30 rounded-xl hover:bg-[#250b0e] hover:border-red-600/30 transition-all text-[12px] shadow-inner">
            <span className="text-red-100/80 font-semibold truncate">CreatorAI Studio</span>
            <ChevronDown size={12} className="text-red-400/40 flex-shrink-0 ml-1" />
          </button>
        </div>
      )}

      {/* Collapsed toggle */}
      {collapsed && (
        <div className="px-2 py-2 border-b border-red-950/30">
          <button
            onClick={onToggleCollapse}
            className="w-full h-8 rounded-xl hover:bg-red-950/40 flex items-center justify-center text-red-300/40 hover:text-red-200 transition-colors"
          >
            <PanelLeftOpen size={14} />
          </button>
        </div>
      )}

      {/* Nav Links — Scrollbar hidden & sleek spacing */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3 flex flex-col gap-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {group.title && !collapsed && (
              <span className="text-[9px] font-extrabold text-red-300/30 tracking-widest px-2 mb-1 uppercase font-mono">
                {group.title}
              </span>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all relative group/link ${
                    isActive
                      ? "bg-[#25090c] text-white border border-red-800/30 shadow-sm shadow-red-950/50"
                      : "text-red-200/50 hover:text-white hover:bg-red-950/30"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <Icon
                    size={15}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-red-500" : "text-red-300/40 group-hover/link:text-red-300"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-red-500 to-rose-600 shadow-[0_0_8px_#ef4444]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile */}
      {!collapsed && (
        <div className="p-3 border-t border-red-950/40 flex-shrink-0 bg-[#120506]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-8 h-8 rounded-full bg-[#250b0e] bg-cover bg-center flex-shrink-0 border border-red-500/30 shadow-md"
              style={{
                backgroundImage: user?.picture ? `url(${user.picture})` : undefined,
              }}
            >
              {!user?.picture && (
                <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-red-200 rounded-full bg-gradient-to-br from-red-900 to-rose-950">
                  {user?.name?.[0] || "K"}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold text-white leading-tight truncate">
                {user?.name || "Krish"}
              </span>
              <span className="text-[10px] text-red-300/40 leading-tight truncate font-mono">
                @{user?.name?.toLowerCase().replace(/\s/g, "") || "krishk"}
              </span>
            </div>
            <button className="ml-auto text-red-300/30 hover:text-red-200 transition-colors">
              <Settings size={13} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-red-950/30 border border-red-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-[10px] font-medium text-red-200/50 truncate">Creator Memory synced</span>
          </div>
        </div>
      )}

      {/* Collapsed bottom */}
      {collapsed && (
        <div className="p-2 border-t border-red-950/40">
          <div
            className="w-8 h-8 rounded-full mx-auto bg-[#250b0e] bg-cover bg-center border border-red-500/30"
            style={{ backgroundImage: user?.picture ? `url(${user.picture})` : undefined }}
          >
            {!user?.picture && (
              <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-red-200 rounded-full bg-gradient-to-br from-red-900 to-rose-950">
                {user?.name?.[0] || "K"}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
