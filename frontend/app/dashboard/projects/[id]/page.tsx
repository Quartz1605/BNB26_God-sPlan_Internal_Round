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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white font-medium shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5 transition-all"
          >
            <Video className="w-5 h-5" />
            Open Editor
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column: AI Generated Content Plan */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Platform & Audience</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {project.platform && <span className="bg-gray-100 px-3 py-1 rounded-full">Platform: {project.platform}</span>}
              {project.duration && <span className="bg-gray-100 px-3 py-1 rounded-full">Duration: {project.duration}</span>}
              {project.audience && <span className="bg-gray-100 px-3 py-1 rounded-full">Audience: {project.audience}</span>}
            </div>
          </div>

          {project.hook && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Hook</h3>
              <p className="text-gray-800 text-sm leading-relaxed p-4 bg-red-50 rounded-xl border border-[#a91d22]/20">{project.hook}</p>
            </div>
          )}
          
          {project.script && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Script</h3>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{project.script}</div>
            </div>
          )}

          {project.sections && project.sections.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Video Blueprint</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {project.sections.map((sec: any, i: number) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-gray-100 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <span className="text-[10px] font-bold">{sec.start}s</span>
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="font-bold text-gray-800 mb-1">{sec.title}</div>
                      <div className="text-xs text-gray-500 mb-3">{sec.purpose}</div>
                      <p className="text-sm text-gray-700 italic border-l-2 border-[#a91d22] pl-3">"{sec.script}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {project.visualPlan && project.visualPlan.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Visual Suggestions</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {project.visualPlan.map((vp: string, i: number) => (
                  <li key={i}>{vp}</li>
                ))}
              </ul>
            </div>
          )}

          {project.cta && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Call to Action</h3>
              <p className="text-gray-800 text-sm">{project.cta}</p>
            </div>
          )}
        </div>

        {/* Right Column: Assets Side Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Assets <span className="bg-white border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-xs shadow-sm">{assets.length}</span>
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="p-2 rounded-xl bg-white border border-gray-200 text-[#a91d22] hover:bg-red-50 hover:border-[#a91d22]/30 transition-colors shadow-sm"
                title="Upload Asset"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center border-dashed">
                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#a91d22] mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-gray-900 text-sm font-medium mb-1">No assets yet</h3>
                <p className="text-gray-500 text-xs mb-4">Upload files for your project</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {assets.map(asset => (
                  <div key={asset._id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#a91d22]/30 transition-all flex flex-col">
                    {/* Preview Area */}
                    <div className="h-32 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                      {asset.asset_type.startsWith('image/') ? (
                        <img src={asset.file_url} alt={asset.filename} className="w-full h-full object-cover" />
                      ) : asset.asset_type.startsWith('video/') ? (
                        <div className="relative w-full h-full bg-gray-900">
                          <video src={asset.file_url} className="w-full h-full object-cover opacity-70" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/80" />
                          </div>
                        </div>
                      ) : (
                        getAssetIcon(asset.asset_type)
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                        <a
                          href={asset.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white backdrop-blur-md transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4 rotate-135 transform origin-center" style={{ transform: 'rotate(135deg)' }} />
                        </a>
                        <button
                          onClick={() => deleteAsset(asset._id)}
                          className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white backdrop-blur-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm truncate" title={asset.filename}>
                        {asset.filename}
                      </h3>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
                        <span className="uppercase font-medium tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                          {asset.asset_type.split('/')[0]}
                        </span>
                        <span>{formatSize(asset.file_size)}</span>
                      </div>
                      {asset.asset_type.startsWith('video/') && (
                        <Link
                          href={`/dashboard/projects/${projectId}/assets/${asset._id}`}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-[#a91d22] border border-gray-200 hover:border-[#a91d22]/30 text-xs font-medium transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          Analyze
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
