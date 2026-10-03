"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TopNav } from "../../components/dashboard/TopNav";
import { CommandPalette } from "../../components/dashboard/CommandPalette";

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#210709] text-[#F4EDE4]">
      <div className="flex flex-col items-center gap-4">
        <span className="font-serif-display text-3xl font-bold tracking-wide text-[#F4EDE4]">
          STUDIO
        </span>
        <span className="font-handwritten text-[#D9C9BC] text-sm animate-pulse">
          opening your creative workbook...
        </span>
      </div>
    </div>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const fallbackUser = {
      name: "Krish Khandwala",
      email: "krish@creatorai.com",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    };

    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user || fallbackUser);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(fallbackUser);
        setIsLoading(false);
      });
  }, []);

  // ⌘K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-[#210709] text-[#F4EDE4] selection:bg-[#C94345]/30">
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Visually Quiet Editorial Navigation */}
      <TopNav user={user} onCommandOpen={() => setCommandOpen(true)} />

      {/* Main Canvas Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
