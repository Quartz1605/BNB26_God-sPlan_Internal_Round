"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Video, Music, Trash2, X, Loader2, Play, Sparkles } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjectData = async () => {
    try {
      const [projRes, assetsRes] = await Promise.all([
        fetch(`http://localhost:8000/projects/${projectId}`, { credentials: "include" }),
        fetch(`http://localhost:8000/projects/${projectId}/assets`, { credentials: "include" })
      ]);

      if (!projRes.ok) throw new Error("Failed to fetch project");

      setProject(await projRes.json());
      setAssets(await assetsRes.json());
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
      // Simulate progress for UI purposes since fetch doesn't support progress directly easily
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

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
        setAssets(assets.filter(a => a._id !== assetId));
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  const getAssetIcon = (type: string) => {
    if (type.startsWith("video/")) return <Video className="w-8 h-8 text-blue-500" />;
    if (type.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-emerald-500" />;
    if (type.startsWith("audio/")) return <Music className="w-8 h-8 text-purple-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a91d22]"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.description || "No description provided."}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/editor/${projectId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Video className="w-5 h-5" />
            Open Editor
          </Link>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white font-medium shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5 transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload Asset
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Project Assets <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{assets.length}</span>
        </h2>

        {assets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center border-dashed">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-[#a91d22] mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No assets uploaded yet</h3>
            <p className="text-gray-500 text-sm mb-6">Upload videos, images, audio, or text files to get started.</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#a91d22]/20 text-[#a91d22] font-medium hover:bg-red-50 transition-colors"
            >
              Upload your first asset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map(asset => (
              <div key={asset._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#a91d22]/30 transition-all">
                {/* Preview Area */}
                <div className="aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden">
                  {asset.asset_type.startsWith('image/') ? (
                    <img src={asset.file_url} alt={asset.filename} className="w-full h-full object-cover" />
                  ) : asset.asset_type.startsWith('video/') ? (
                    <div className="relative w-full h-full bg-gray-900">
                      <video src={asset.file_url} className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-10 h-10 text-white/80" />
                      </div>
                    </div>
                  ) : (
                    getAssetIcon(asset.asset_type)
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-md transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 rotate-135 transform origin-center" style={{ transform: 'rotate(135deg)' }} />
                      {/* Using ArrowLeft rotated as a generic "open" icon if external-link is missing */}
                    </a>
                    <button
                      onClick={() => deleteAsset(asset._id)}
                      className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white backdrop-blur-md transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate" title={asset.filename}>
                    {asset.filename}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="uppercase font-medium tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                      {asset.asset_type.split('/')[0]}
                    </span>
                    <span>{formatSize(asset.file_size)}</span>
                  </div>
                  {asset.asset_type.startsWith('video/') && (
                    <Link
                      href={`/dashboard/projects/${projectId}/assets/${asset._id}`}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white text-xs font-medium shadow-md shadow-red-900/20 hover:shadow-lg hover:shadow-red-900/30 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Analyze & Clip
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Upload Asset</h3>
              <button
                onClick={() => !isUploading && setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isUploading ? (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#a91d22] animate-spin"></div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Uploading your file...</h4>
                    <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#a91d22] h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-red-50/50 hover:border-[#a91d22]/30 transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mx-auto w-12 h-12 bg-gray-50 group-hover:bg-red-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#a91d22] mb-3 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-gray-900">Click to browse or drag file here</p>
                    <p className="text-sm text-gray-500 mt-1">Supports Video, Image, Audio, and Text</p>
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
