"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  FileVideo,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Video,
  Layers,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  platform?: string;
  duration?: string;
}

interface User {
  name: string;
  email: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [assetCount, setAssetCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user and projects
    Promise.all([
      fetch("http://localhost:8000/auth/me", { credentials: "include" }).then(res => res.json()),
      fetch("http://localhost:8000/projects", { credentials: "include" }).then(res => res.json())
    ])
      .then(async ([userData, projectsData]) => {
        if (userData.user) setUser(userData.user);
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);

          // Count total assets across projects
          let totalAssets = 0;
          await Promise.all(
            projectsData.slice(0, 5).map(async (p) => {
              try {
                const res = await fetch(`http://localhost:8000/projects/${p._id}/assets`, { credentials: "include" });
                if (res.ok) {
                  const assets = await res.json();
                  if (Array.isArray(assets)) totalAssets += assets.length;
                }
              } catch (e) {
                // ignore
              }
            })
          );
          setAssetCount(totalAssets);
        }
      })
      .catch(err => console.error("Failed to load dashboard data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#a91d22]"></div>
          <p className="text-xs font-medium text-slate-500">Retrieving project data...</p>
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Studio Engine Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "Creator"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-xl">
            Create AI video blueprints, analyze raw footage, and extract high-engagement short-form clips.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/projects/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Video Project</span>
          </Link>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/projects/new"
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3 group-hover:bg-[#a91d22] group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">AI Project Wizard</h3>
            <p className="text-xs text-slate-500 mt-1">Generate complete script & video blueprint from a prompt</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 group-hover:text-[#a91d22] transition-colors">
            <span>Start plan</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/assets"
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <FileVideo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Media Library</h3>
            <p className="text-xs text-slate-500 mt-1">Browse footage, images, and audio across all projects</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
            <span>View assets</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/creator-dna"
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Creator DNA</h3>
            <p className="text-xs text-slate-500 mt-1">Analyze cadence, tone, and signature style patterns</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
            <span>Analyze style</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/opportunities"
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-3 group-hover:bg-[#a91d22] group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Content Opportunities</h3>
            <p className="text-xs text-slate-500 mt-1">AI-recommended topics and hooks tailored to your audience</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-slate-700 group-hover:text-[#a91d22] transition-colors">
            <span>Explore ideas</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{projects.length}</span>
            <span className="text-xs font-medium text-slate-500">active workspace items</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Indexed Assets</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <FileVideo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{assetCount > 0 ? assetCount : projects.length > 0 ? "Indexed" : "0"}</span>
            <span className="text-xs font-medium text-slate-500">audio/video/image assets</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last Active</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {projects.length > 0 ? (
            <>
              <div className="mt-3">
                <p className="text-sm font-bold text-slate-900 truncate">{projects[0]?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{projects[0]?.description || "Video project workspace"}</p>
              </div>
              <Link
                href={`/dashboard/projects/${projects[0]?._id}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#a91d22] hover:underline"
              >
                <span>Resume project</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-bold text-slate-900">No projects yet</p>
              <p className="text-xs text-slate-500 mt-0.5">Create your first project to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Projects</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to your content production pipelines</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
            <Link
              href="/dashboard/projects"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline shrink-0"
            >
              View all
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-4">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No projects in workspace</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Create your first project to test AI blueprinting, upload video files, and generate viral clip candidates.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project Now</span>
            </Link>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No projects matching "{searchQuery}"
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProjects.slice(0, 5).map((project) => (
              <Link
                key={project._id}
                href={`/dashboard/projects/${project._id}`}
                className="group flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 group-hover:border-[#a91d22]/40 group-hover:text-[#a91d22] transition-colors">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#a91d22] transition-colors truncate">
                        {project.name}
                      </h3>
                      {project.platform && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {project.platform}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">
                      {project.description || "Video project workspace with AI blueprint and asset library"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs">
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-slate-700 group-hover:text-[#a91d22] transition-colors">
                    <span>Manage</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
