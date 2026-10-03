"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, User, Video, Mic, Upload, FileText, Scissors, FolderPlus } from "lucide-react";

interface TopNavProps {
  user?: any;
  title?: string;
  onCommandOpen?: () => void;
}

export function TopNav({ user, onCommandOpen }: TopNavProps) {
  const pathname = usePathname();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const navTabs = [
    { name: "Studio", href: "/home" },
    { name: "Library", href: "/home/library" },
    { name: "Projects", href: "/home/projects" },
    { name: "Moments", href: "/home/ai-clips" },
    { name: "Ideas", href: "/home/opportunities" },
    { name: "Audience", href: "/home/audience" },
    { name: "Publishing", href: "/home/publishing" },
  ];

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-[#320B10] bg-[#210709] text-[#F4EDE4] shrink-0 z-30 sticky top-0">
      {/* Left: Brand */}
      <div className="flex items-center gap-8">
        <Link href="/home" className="flex items-center gap-2.5 group">
          <span className="font-serif-display text-2xl font-bold tracking-tight text-[#F4EDE4] group-hover:text-[#C94345] transition-colors">
            CreatorAI
          </span>
          <span className="text-[11px] font-handwritten text-[#D9C9BC] border-l border-[#4A1017] pl-2.5 py-0.5">
            studio
          </span>
        </Link>

        {/* Center: Quiet Editorial Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`transition-colors relative py-1 text-xs tracking-wide uppercase font-mono ${
                  isActive
                    ? "text-[#F4EDE4] font-bold"
                    : "text-[#D9C9BC]/50 hover:text-[#F4EDE4]"
                }`}
              >
                {tab.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C94345]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, + Create, Profile */}
      <div className="flex items-center gap-4">
        {/* Command bar / Search */}
        <button
          onClick={onCommandOpen}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#320B10] border border-[#4A1017] rounded text-xs text-[#D9C9BC]/60 hover:text-[#F4EDE4] hover:border-[#8E2630] transition-all font-mono"
        >
          <Search size={13} className="text-[#8E2630]" />
          <span className="hidden lg:inline text-[11px]">Search creative history...</span>
          <kbd className="text-[9px] bg-[#4A1017] px-1.5 py-0.5 rounded text-[#D9C9BC]/80">⌘K</kbd>
        </button>

        {/* Physical Studio Tool: + Create Button */}
        <div className="relative">
          <button
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C94345] text-[#F4EDE4] font-bold text-xs rounded hover:bg-[#D94B50] transition-colors shadow-[2px_3px_0px_#110304] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <Plus size={14} />
            <span>Create</span>
          </button>

          {/* Tool Dropdown */}
          {createMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#320B10] border border-[#4A1017] rounded shadow-[4px_5px_0px_#110304] py-1.5 z-50">
              {[
                { label: "Record Footage", icon: Video },
                { label: "Upload Asset", icon: Upload },
                { label: "Start Project", icon: FolderPlus },
                { label: "Create Clip", icon: Scissors },
                { label: "Write Script", icon: FileText },
                { label: "Import Library", icon: Mic },
              ].map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.label}
                    onClick={() => setCreateMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#F4EDE4] hover:bg-[#4A1017] transition-colors text-left"
                  >
                    <ToolIcon size={13} className="text-[#C94345]" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile */}
        <Link
          href="/home/settings"
          className="w-8 h-8 rounded bg-[#320B10] border border-[#4A1017] flex items-center justify-center text-xs font-bold text-[#F4EDE4] hover:border-[#C94345] transition-colors"
        >
          {user?.name?.[0] || "K"}
        </Link>
      </div>
    </header>
  );
}
