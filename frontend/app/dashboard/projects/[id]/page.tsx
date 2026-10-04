"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Trash2,
  X,
  Loader2,
  Play,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Layers,
  ExternalLink,
  Target,
  Sliders,
  Scissors
} from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  hook?: string;
  script?: string;
  sections?: any[];
  visualPlan?: string[];
  cta?: string;
  platform?: string;
  duration?: string;
  audience?: string;
}

interface Asset {
  _id: string;
  filename: string;
  asset_type: string;
  file_size: number;
  file_url: string;
  status: string;
  created_at: string;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"blueprint" | "assets">("blueprint");
  const [copiedScript, setCopiedScript] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjectData = async () => {
    try {
      const [projRes, assetsRes] = await Promise.all([
        fetch(`http://localhost:8000/projects/${projectId}`, { credentials: "include" }),
        fetch(`http://localhost:8000/projects/${projectId}/assets`, { credentials: "include" }),
      ]);

      if (!projRes.ok) throw new Error("Failed to fetch project");

      setProject(await projRes.json());
      const assetsData = await assetsRes.json();
      if (Array.isArray(assetsData)) setAssets(assetsData);
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 12, 90));
      }, 250);

      const res = await fetch(`http://localhost:8000/projects/${projectId}/assets`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        await fetchProjectData();
        setIsUploadModalOpen(false);
      } else {
        alert("Upload failed. Please check file format and try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/assets/${assetId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setAssets(assets.filter((a) => a._id !== assetId));
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  const copyScriptToClipboard = () => {
    if (project?.script) {
      navigator.clipboard.writeText(project.script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const getAssetIcon = (type: string) => {
    if (type.startsWith("video/")) return <Video className="w-6 h-6 text-slate-700" />;
    if (type.startsWith("image/")) return <ImageIcon className="w-6 h-6 text-slate-700" />;
    if (type.startsWith("audio/")) return <Music className="w-6 h-6 text-slate-700" />;
    return <FileText className="w-6 h-6 text-slate-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#a91d22]"></div>
          <p className="text-xs font-medium text-slate-500">Loading project studio...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-4">
            <Link
              href="/dashboard/projects"
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Back to Projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  Project Workspace
                </span>
                {project.platform && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {project.platform}
                  </span>
                )}
                {project.duration && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {project.duration}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {project.description || "Video project workspace with AI blueprint and asset library."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Asset</span>
            </button>
            <Link
              href={`/editor/${projectId}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Open Video Editor</span>
            </Link>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "blueprint"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Overview & Blueprint
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "assets"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>Media Assets</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === "assets" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              {assets.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "blueprint" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Blueprint Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hook Card */}
            {project.hook && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Target Hook
                </span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-200 border-l-4 border-l-[#a91d22]">
                  "{project.hook}"
                </p>
              </div>
            )}

            {/* Script Card */}
            {project.script && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Production Script
                  </span>
                  <button
                    onClick={copyScriptToClipboard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? "Copied" : "Copy text"}</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                  {project.script}
                </div>
              </div>
            )}

            {/* Blueprint Timeline */}
            {project.sections && project.sections.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Video Timeline
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Section Breakdown</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    {project.sections.length} Milestones
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                  {project.sections.map((sec: any, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-800 text-white font-mono text-[10px] font-bold shadow-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {sec.start}s
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-xs">
                        <div className="font-semibold text-slate-900 text-sm mb-0.5">{sec.title}</div>
                        <div className="text-[10px] font-medium text-slate-500 mb-2 uppercase tracking-wider">{sec.purpose}</div>
                        <p className="text-xs text-slate-700 italic border-l-2 border-[#a91d22] pl-3 py-0.5 bg-white rounded-r">
                          "{sec.script}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info & Visual Plan (1 Col) */}
          <div className="space-y-6">
            {/* Visual Suggestions */}
            {project.visualPlan && project.visualPlan.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Visual Direction
                </span>
                <ul className="space-y-2.5">
                  {project.visualPlan.map((vp: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a91d22] mt-1.5 shrink-0"></span>
                      <span>{vp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Note */}
            {project.cta && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Call to Action (CTA)
                </span>
                <p className="text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {project.cta}
                </p>
              </div>
            )}

            {/* Quick Assets Widget */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Assets Summary
                </span>
                <button
                  onClick={() => setActiveTab("assets")}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                >
                  View all ({assets.length})
                </button>
              </div>

              {assets.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Video className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">No assets attached yet</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-3 text-xs font-semibold text-[#a91d22] hover:underline"
                  >
                    + Upload first footage
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.slice(0, 3).map((a) => (
                    <div key={a._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-medium text-slate-800 truncate max-w-[160px]">{a.filename}</span>
                      <span className="text-slate-400 text-[11px]">{formatSize(a.file_size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Media Assets Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Project Assets</h2>
              <p className="text-xs text-slate-500">Video footage, audio tracks, and images attached to this project</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </button>
          </div>

          {assets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xs border border-dashed border-slate-300 p-16 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No media files in this project</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                Upload raw video recordings to enable AI transcript evaluation, hook extraction, and visual verification.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Media File</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className="group bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail / Preview Area */}
                  <div className="h-36 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    {asset.asset_type.startsWith("image/") ? (
                      <img src={asset.file_url} alt={asset.filename} className="w-full h-full object-cover" />
                    ) : asset.asset_type.startsWith("video/") ? (
                      <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                        <video src={asset.file_url} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/90" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400">{getAssetIcon(asset.asset_type)}</div>
                    )}

                    {/* Overlay Action Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={asset.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-black/60 hover:bg-black/90 rounded-lg text-white backdrop-blur-xs transition-colors"
                        title="View Original"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => deleteAsset(asset._id)}
                        className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white backdrop-blur-xs transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Asset Details */}
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
                    </div>

                    {asset.asset_type.startsWith("video/") && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={`/dashboard/projects/${projectId}/assets/${asset._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#a91d22] hover:text-white text-slate-800 text-xs font-semibold transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Analysis</span>
                        </Link>
                        <Link
                          href={`/dashboard/projects/${projectId}/editor/${asset._id}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Quick Clip Editor"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Upload Project Asset</h3>
              <button
                onClick={() => !isUploading && setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {isUploading ? (
                <div className="py-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#a91d22] animate-spin"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-0.5">Uploading Media File...</h4>
                    <p className="text-xs text-slate-500">{uploadProgress}% uploaded to storage</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-[#a91d22] h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mx-auto w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-slate-900 mb-3 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-900 text-xs">Click to browse or drop file here</p>
                    <p className="text-[11px] text-slate-500 mt-1">Supports Video (MP4, MOV), Audio, Images</p>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="video/*,image/*,audio/*,text/*"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
