"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  FileVideo,
  Settings,
  LogOut,
  Fingerprint,
  Sparkles,
  Video,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  const handleLogout = () => {
    fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      router.push("/");
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-[#a91d22]"></div>
          <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  const workspaceNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Media Assets", href: "/dashboard/assets", icon: FileVideo },
  ];

  const intelligenceNav = [
    { name: "Creator DNA", href: "/dashboard/creator-dna", icon: Fingerprint, badge: "AI" },
    { name: "Opportunities", href: "/dashboard/opportunities", icon: Sparkles, badge: "New" },
  ];

  const settingsNav = [
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Helper to format breadcrumb from pathname
  const pathParts = pathname.split("/").filter(Boolean);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-xs z-20">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#a91d22] flex items-center justify-center text-white shadow-xs">
                <Video className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 tracking-tight leading-none">CreatorAI</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">Studio Workspace</span>
              </div>
            </Link>
          </div>

          {/* Quick Action Button */}
          <div className="p-3">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </Link>
          </div>

          {/* Navigation Sections */}
          <div className="px-3 py-2 space-y-6">
            {/* Workspace section */}
            <div>
              <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspace
              </p>
              <nav className="space-y-1">
                {workspaceNav.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* AI Intelligence section */}
            <div>
              <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Intelligence
              </p>
              <nav className="space-y-1">
                {intelligenceNav.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-[#a91d22] border border-slate-200"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* System section */}
            <div>
              <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Configuration
              </p>
              <nav className="space-y-1">
                {settingsNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User Profile & Footer */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 mb-2">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#a91d22] text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || "Creator"}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">CreatorAI</span>
            {pathParts.map((part, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className={index === pathParts.length - 1 ? "font-semibold text-slate-900 capitalize" : "capitalize"}>
                  {part}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
