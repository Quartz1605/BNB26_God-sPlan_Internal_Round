"use client";

import { useState, useEffect } from "react";
import { Fingerprint, CheckCircle2, Play, Video, Loader2, Sparkles, BookOpen, MessageSquare, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Asset {
  _id: string;
  filename: string;
  status: string;
  created_at: string;
  file_url: string;
  analysis_status?: string;
}

export default function CreatorDNAPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [dna, setDna] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDna = async () => {
    try {
      const res = await fetch("http://localhost:8000/creator/dna", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDna(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      // First fetch projects to get all assets. We will just use the first project for this MVP to simplify.
      const projRes = await fetch("http://localhost:8000/projects", {
        credentials: "include",
      });
      const projects = await projRes.json();
      if (projects.length > 0) {
        const assetRes = await fetch(`http://localhost:8000/projects/${projects[0]._id}/assets`, {
          credentials: "include",
        });
        const data = await assetRes.json();
        // Filter only video assets that have completed analysis
        setAssets(data.filter((a: any) => a.asset_type?.startsWith("video") && !a.is_clip));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchDna();
      await fetchAssets();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      interval = setInterval(async () => {
        const res = await fetch("http://localhost:8000/creator/dna", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDna(data);
          if (data?.status !== "processing" && data?.status !== "queued") {
            setIsAnalyzing(false);
            clearInterval(interval);
          }
        }
      }, 5000);
    };

    if (isAnalyzing || dna?.status === "processing" || dna?.status === "queued") {
      startPolling();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing, dna?.status]);

  const handleToggleAsset = (id: string) => {
    const next = new Set(selectedAssets);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedAssets(next);
  };

  const handleAnalyze = async () => {
    if (selectedAssets.size === 0) return;
    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await fetch("http://localhost:8000/creator/dna/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_ids: Array.from(selectedAssets) }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to start analysis");
      }
      await fetchDna();
    } catch (err: any) {
      setError(err.message);
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#a91d22]" />
      </div>
    );
  }

  const isProcessing = dna?.status === "processing" || dna?.status === "queued";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-[#a91d22]" />
          Creator DNA
        </h1>
        <p className="mt-2 text-gray-500 max-w-2xl">
          CreatorAI analyzes your historical content to understand your unique style, tone, and storytelling patterns. This builds your Creator DNA, powering intelligent recommendations.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isProcessing ? (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center shadow-sm">
          <Loader2 className="w-12 h-12 text-[#a91d22] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing your Creator DNA...</h2>
          <p className="text-gray-500">
            We are analyzing your selected videos to discover patterns in your communication, hooks, and storytelling.
            This may take a few minutes.
          </p>
        </div>
      ) : dna?.status === "completed" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-[#e5e5e5] p-6 rounded-xl shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                DNA Profile Active
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Version {dna.version} • Based on {dna.analysis_metadata?.videos_analyzed || 0} videos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-400">
                Last updated {dna.updated_at ? formatDistanceToNow(new Date(dna.updated_at), { addSuffix: true }) : "recently"}
              </p>
              <button
                onClick={() => setDna({ ...dna, status: "idle" })} // Temporary hack to show the selection screen
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Add more videos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity */}
            <div className="bg-white border border-[#e5e5e5] p-6 rounded-xl shadow-sm">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Fingerprint className="w-5 h-5 text-gray-400" />
                Identity & Topics
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Primary Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {dna.identity?.primary_topics?.map((topic: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-red-50 text-[#a91d22] text-xs font-medium rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Style</h4>
                  <div className="flex flex-wrap gap-2">
                    {dna.communication?.style?.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hooks & Storytelling */}
            <div className="bg-white border border-[#e5e5e5] p-6 rounded-xl shadow-sm">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-gray-400" />
                Hooks & Storytelling
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dominant Hooks</h4>
                  <div className="flex flex-wrap gap-2">
                    {dna.hooks?.dominant_types?.map((h: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Structure</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {dna.storytelling?.structure?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Strengths & Gaps */}
            <div className="bg-white border border-[#e5e5e5] p-6 rounded-xl shadow-sm col-span-1 md:col-span-2">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                Strengths & Content Gaps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Content Strengths</h4>
                    <ul className="space-y-2">
                      {dna.strengths?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Opportunities / Gaps</h4>
                    <ul className="space-y-2">
                      {dna.content_gaps?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e5e5e5]">
            <h2 className="text-lg font-bold text-gray-900">Select Videos for Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">Choose representative videos to build your baseline Creator DNA.</p>
          </div>
          
          <div className="p-6">
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No videos available</h3>
                <p className="text-sm text-gray-500 mt-1">Upload and analyze some videos in the Assets tab first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset) => {
                  const isSelected = selectedAssets.has(asset._id);
                  return (
                    <div
                      key={asset._id}
                      onClick={() => handleToggleAsset(asset._id)}
                      className={`relative cursor-pointer group rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                        isSelected ? "border-[#a91d22] bg-red-50/50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="aspect-video bg-gray-900 relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate flex-1" title={asset.filename}>
                            {asset.filename}
                          </p>
                          <div className={`w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center ${
                            isSelected ? "bg-[#a91d22] border-[#a91d22]" : "border-gray-300"
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(asset.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-[#e5e5e5] bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedAssets.size} video{selectedAssets.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleAnalyze}
              disabled={selectedAssets.size === 0 || isAnalyzing}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 flex items-center gap-2 ${
                selectedAssets.size === 0 || isAnalyzing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#a91d22] hover:bg-[#8b151b] shadow-xs"
              }`}
            >
              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAnalyzing ? "Analyzing..." : "Analyze Creator DNA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
