"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban, ArrowRight, Video, Search, SlidersHorizontal, LayoutGrid, List, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  platform?: string;
  duration?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/projects", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((err) => console.error("Failed to load projects:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#a91d22]"></div>
          <p className="text-xs font-medium text-slate-500">Loading your projects...</p>
        </div>
      </div>
    );
  }

  // Filter and sort projects
  const filteredProjects = projects
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Workspaces</h1>
          <p className="text-xs text-slate-500 mt-1">Manage all your video pipelines, blueprints, and clip extractions.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "list" ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-16 text-center">
          <div className="mx-auto w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="text-base text-slate-900 font-bold mb-1">
            {searchQuery ? "No matching projects" : "No projects created yet"}
          </h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any projects matching "${searchQuery}".`
              : "Generate your first content blueprint from an idea, upload footage, and export AI clips."}
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="group bg-white rounded-2xl shadow-xs border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center group-hover:bg-[#a91d22] group-hover:text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </div>
                  {project.platform && (
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {project.platform}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#a91d22] transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {project.description || "Video project workspace with AI blueprint and asset library"}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className="text-slate-800 font-semibold flex items-center gap-1 group-hover:text-[#a91d22] transition-colors">
                  Open Studio <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 group-hover:text-[#a91d22] transition-colors">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#a91d22] transition-colors truncate">
                      {project.name}
                    </h3>
                    {project.platform && (
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {project.platform}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    {project.description || "Video project workspace"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-xs">
                <span className="text-slate-400 hidden sm:inline">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className="font-semibold text-slate-700 group-hover:text-[#a91d22] transition-colors flex items-center gap-1">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
