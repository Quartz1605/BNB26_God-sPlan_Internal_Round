"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, FileVideo, Settings, LogOut } from "lucide-react";

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
      <div className="flex h-screen w-screen items-center justify-center bg-[#fdfdfc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#a91d22] border-t-transparent"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Assets", href: "/dashboard/assets", icon: FileVideo },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#fcfbf9] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e5e5e5] shadow-sm flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-[#e5e5e5]">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b151b] to-[#c7262c]">
              CreatorAi
            </span>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white shadow-md shadow-red-900/20"
                      : "text-gray-600 hover:bg-red-50 hover:text-[#a91d22]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#e5e5e5]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full ring-2 ring-[#a91d22]/20 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#a91d22] font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
