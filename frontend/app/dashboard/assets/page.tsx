"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileVideo,
  Video,
  Image as ImageIcon,
  Music,
  FileText,
  Search,
  ExternalLink,
  Sparkles,
  Play,
  ArrowRight,
  Filter,
  FolderKanban
} from "lucide-react";

interface AssetItem {
  _id: string;
  filename: string;
  asset_type: string;
  file_size: number;
  file_url: string;
  projectId: string;
  projectName: string;
  created_at: string;
}

export default function GlobalAssetsPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "video" | "image" | "audio">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        const projRes = await fetch("http://localhost:8000/projects", { credentials: "include" });
        if (!projRes.ok) throw new Error("Failed to fetch projects");
        const projects = await projRes.json();

        if (Array.isArray(projects)) {
          const allAssetsList: AssetItem[] = [];
          await Promise.all(
            projects.map(async (p: any) => {
              try {
                const assetRes = await fetch(`http://localhost:8000/projects/${p._id}/assets`, {
                  credentials: "include",
                });
                if (assetRes.ok) {
                  const projectAssets = await assetRes.json();
                  if (Array.isArray(projectAssets)) {
                    projectAssets.forEach((a: any) => {
                      allAssetsList.push({
                        ...a,
                        projectId: p._id,
                        projectName: p.name,
                      });
                    });
                  }
                }
              } catch (e) {
                // Ignore individual project fetch errors
              }
            })
          );
          setAssets(allAssetsList);
        }
      } catch (err) {
        console.error("Failed to load global assets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAssets();
  }, []);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    if (filterType === "video") return asset.asset_type.startsWith("video/");
    if (filterType === "image") return asset.asset_type.startsWith("image/");
    if (filterType === "audio") return asset.asset_type.startsWith("audio/");
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Media Library</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and organize all video, audio, and visual assets across your project workspaces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {assets.length} Total Assets
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or project..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            All ({assets.length})
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === "video" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Videos ({assets.filter(a => a.asset_type.startsWith("video/")).length})
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === "image" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Images ({assets.filter(a => a.asset_type.startsWith("image/")).length})
          </button>
          <button
            onClick={() => setFilterType("audio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              filterType === "audio" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Audio ({assets.filter(a => a.asset_type.startsWith("audio/")).length})
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#a91d22]"></div>
            <p className="text-xs font-medium text-slate-500">Indexing workspace assets...</p>
          </div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-16 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
            <FileVideo className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {searchQuery ? "No matching assets found" : "No media uploaded yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Upload footage in any project workspace to see it consolidated here.
          </p>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Go to Projects</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={`${asset.projectId}-${asset._id}`}
              className="group bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div className="h-36 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                {asset.asset_type.startsWith("image/") ? (
                  <img src={asset.file_url} alt={asset.filename} className="w-full h-full object-cover" />
                ) : asset.asset_type.startsWith("video/") ? (
                  <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                    <video src={asset.file_url} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-7 h-7 text-white/90" />
                    </div>
                  </div>
                ) : asset.asset_type.startsWith("audio/") ? (
                  <Music className="w-8 h-8 text-slate-400" />
                ) : (
                  <FileText className="w-8 h-8 text-slate-400" />
                )}

                <a
                  href={asset.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 rounded-lg text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Open source file"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Information */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs truncate" title={asset.filename}>
                    {asset.filename}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span className="uppercase font-semibold tracking-wider bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                      {asset.asset_type.split("/")[0]}
                    </span>
                    <span>{formatSize(asset.file_size)}</span>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <FolderKanban className="w-3 h-3 text-slate-400 shrink-0" />
                    <Link
                      href={`/dashboard/projects/${asset.projectId}`}
                      className="truncate hover:text-[#a91d22] hover:underline"
                    >
                      {asset.projectName}
                    </Link>
                  </div>
                </div>

                {asset.asset_type.startsWith("video/") && (
                  <Link
                    href={`/dashboard/projects/${asset.projectId}/assets/${asset._id}`}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#a91d22] hover:text-white text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Analyze Clips</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
