"use client";

import { useEffect, useState, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  Scissors,
  Clock,
  Star,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Download,
  Film,
  RefreshCw,
  Zap,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

interface Asset {
  _id: string;
  filename: string;
  asset_type: string;
  file_size: number;
  file_url: string;
  status: string;
  analysis_status?: string;
  analysis_progress?: number;
  analysis_step?: string;
  video_metadata?: {
    duration: number;
    width: number;
    height: number;
    fps: number;
    codec: string;
    has_audio: boolean;
  };
}

interface ClipCandidate {
  candidate_id: string;
  start: number;
  end: number;
  duration: number;
  title: string;
  hook: string;
  summary: string;
  reason: string;
  scores: {
    hook: number;
    clarity: number;
    value: number;
    entertainment: number;
    visual_interest: number;
    pacing: number;
  };
  overall_score: number;
  status: string;
}

interface AnalysisResult {
  status: string;
  progress: number;
  step: string;
  video_summary: string;
  topics: string[];
  clip_candidates: ClipCandidate[];
  video_metadata: Record<string, any>;
  error?: string;
}

interface GeneratedClip {
  _id: string;
  filename: string;
  file_url: string;
  file_size: number;
  source_start: number;
  source_end: number;
  duration: number;
  clip_title: string;
  created_at: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-24 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value * 10}%`,
            background: value >= 8 ? '#16a34a' : value >= 6 ? '#ca8a04' : '#dc2626',
          }}
        />
      </div>
      <span className="text-[11px] font-medium text-gray-700 w-6 text-right">{value.toFixed(0)}</span>
    </div>
  );
}

// ─── Analysis Progress Steps ────────────────────────────────

const ANALYSIS_STEPS = [
  { key: "Loading video", label: "Video loaded" },
  { key: "Downloading from S3", label: "Video accessed" },
  { key: "Extracting metadata", label: "Metadata extracted" },
  { key: "Understanding speech", label: "Understanding speech" },
  { key: "Understanding visuals", label: "Understanding visuals" },
  { key: "Finding strongest moments", label: "Finding best moments" },
  { key: "Complete", label: "Recommendations ready" },
];

function AnalysisProgress({ currentStep, progress }: { currentStep: string; progress: number }) {
  const currentIndex = ANALYSIS_STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-3">
      {ANALYSIS_STEPS.map((step, i) => {
        const isDone = i < currentIndex || currentStep === "Complete";
        const isCurrent = i === currentIndex && currentStep !== "Complete";

        return (
          <div key={step.key} className="flex items-center gap-3">
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : isCurrent ? (
              <Loader2 className="w-5 h-5 text-[#a91d22] animate-spin shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 shrink-0" />
            )}
            <span className={`text-sm ${isDone ? "text-gray-700" : isCurrent ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Clip Preview Player ──────────────────────────────────────

function ClipPreview({
  videoUrl,
  start,
  end,
  onClose,
}: {
  videoUrl: string;
  start: number;
  end: number;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(start);
  const [isMuted, setIsMuted] = useState(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = start;

    const handleTimeUpdate = () => {
      if (video.currentTime >= end) {
        video.pause();
        video.currentTime = start;
        setIsPlaying(false);
      }
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [start, end]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime >= end || video.currentTime < start) {
        video.currentTime = start;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const progress = ((currentTime - start) / (end - start)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#a91d22]" />
            <span className="text-sm font-medium text-white">
              Clip Preview — {formatTime(start)} → {formatTime(end)}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm px-3 py-1 hover:bg-gray-800 rounded-lg transition-colors">
            Close
          </button>
        </div>

        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            muted={isMuted}
            playsInline
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#a91d22] rounded-full transition-all duration-100"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 bg-[#a91d22] hover:bg-[#c7262c] rounded-full text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {formatTime(currentTime)} / {formatTime(end)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clip Candidate Card ──────────────────────────────────────

function ClipCandidateCard({
  candidate,
  index,
  onPreview,
  onEdit,
  onGenerate,
  isGenerating,
}: {
  candidate: ClipCandidate;
  index: number;
  onPreview: () => void;
  onEdit: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#a91d22]/20 transition-all overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#a91d22] flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{candidate.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 font-mono">
                  {formatTime(candidate.start)} → {formatTime(candidate.end)}
                </span>
                <span className="text-[10px] text-gray-400">
                  ({candidate.duration.toFixed(0)}s)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-gray-900">{candidate.overall_score.toFixed(1)}</span>
          </div>
        </div>

        {/* Hook quote */}
        <p className="text-sm text-gray-600 italic border-l-2 border-[#a91d22]/30 pl-3 mb-3 line-clamp-2">
          "{candidate.hook}"
        </p>

        {/* Reason */}
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{candidate.reason}</p>

        {/* Scores (expandable) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 transition-colors"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          Score breakdown
        </button>

        {expanded && (
          <div className="space-y-1.5 mb-4 p-3 bg-gray-50 rounded-xl">
            <ScoreBar label="Hook" value={candidate.scores.hook} />
            <ScoreBar label="Clarity" value={candidate.scores.clarity} />
            <ScoreBar label="Value" value={candidate.scores.value} />
            <ScoreBar label="Entertainment" value={candidate.scores.entertainment} />
            <ScoreBar label="Visual" value={candidate.scores.visual_interest} />
            <ScoreBar label="Pacing" value={candidate.scores.pacing} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Play className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Scissors className="w-4 h-4" />
            Edit Clip
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGenerating ? "Generating..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────

export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string; assetId: string }>;
}) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  const assetId = unwrappedParams.assetId;
  const router = useRouter();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [generatedClips, setGeneratedClips] = useState<GeneratedClip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatingClipId, setGeneratingClipId] = useState<string | null>(null);
  const [previewCandidate, setPreviewCandidate] = useState<ClipCandidate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch asset data and presigned URL
  const fetchData = useCallback(async () => {
    try {
      const [assetRes, urlRes] = await Promise.all([
        fetch(`${API_BASE}/projects/${projectId}/assets/${assetId}/analysis`, {
          credentials: "include",
        }),
        fetch(`${API_BASE}/projects/${projectId}/assets/${assetId}/presigned-url`, {
          credentials: "include",
        }),
      ]);

      if (urlRes.ok) {
        const urlData = await urlRes.json();
        setVideoUrl(urlData.url);
      }

      if (assetRes.ok) {
        const analysisData = await assetRes.json();
        setAnalysis(analysisData);

        if (analysisData.status === "processing") {
          setIsAnalyzing(true);
        } else {
          setIsAnalyzing(false);
        }
      }

      // Fetch generated clips
      const clipsRes = await fetch(
        `${API_BASE}/projects/${projectId}/assets/${assetId}/clips`,
        { credentials: "include" }
      );
      if (clipsRes.ok) {
        const clipsData = await clipsRes.json();
        if (Array.isArray(clipsData)) setGeneratedClips(clipsData);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, assetId]);

  useEffect(() => {
    // Check auth
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) router.push("/");
      })
      .catch(() => router.push("/"));

    fetchData();
  }, [fetchData, router]);

  // Polling for analysis progress
  useEffect(() => {
    if (isAnalyzing) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `${API_BASE}/projects/${projectId}/assets/${assetId}/analysis`,
            { credentials: "include" }
          );
          if (res.ok) {
            const data = await res.json();
            setAnalysis(data);
            if (data.status !== "processing") {
              setIsAnalyzing(false);
              // Refresh all data
              fetchData();
            }
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 2000);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [isAnalyzing, projectId, assetId, fetchData]);

  const handleAnalyze = async () => {
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/assets/${assetId}/analyze`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to start analysis");
      }

      setIsAnalyzing(true);
      setAnalysis((prev) =>
        prev
          ? { ...prev, status: "processing", progress: 5, step: "Queued" }
          : {
            status: "processing",
            progress: 5,
            step: "Queued",
            video_summary: "",
            topics: [],
            clip_candidates: [],
            video_metadata: {},
          }
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateClip = async (candidate: ClipCandidate) => {
    setGeneratingClipId(candidate.candidate_id);
    try {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/assets/${assetId}/clips`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_id: candidate.candidate_id,
            title: candidate.title,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate clip");
      }

      // Refresh clips
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingClipId(null);
    }
  };

  const handleEditClip = (candidate: ClipCandidate) => {
    // Navigate to editor with clip parameters
    const params = new URLSearchParams({
      assetId: assetId,
      start: candidate.start.toString(),
      end: candidate.end.toString(),
      title: candidate.title,
    });
    router.push(`/dashboard/projects/${projectId}/editor/${assetId}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a91d22]"></div>
      </div>
    );
  }

  const candidates = analysis?.clip_candidates || [];
  const isCompleted = analysis?.status === "completed";
  const isFailed = analysis?.status === "failed";
  const isProcessing = analysis?.status === "processing";
  const hasNeverAnalyzed = !analysis?.status || analysis?.status === "none";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              AI Video Analysis
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              AI-powered clip detection and generation
            </p>
          </div>
        </div>
      </div>

      {/* Video Preview + Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Video Preview (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full aspect-video object-contain"
                playsInline
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
                <Film className="w-12 h-12 text-gray-700" />
              </div>
            )}
          </div>

          {/* Analysis Summary */}
          {isCompleted && analysis?.video_summary && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                AI Summary
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{analysis.video_summary}</p>
              {analysis.topics && analysis.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {analysis.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-50 text-[#a91d22] px-2.5 py-1 rounded-full font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analysis Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Analysis Control */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {hasNeverAnalyzed && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#a91d22]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Video Analysis</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Let AI find the best moments in your video and suggest clips ready for short-form content.
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Find Best Clips
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-[#a91d22] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Analyzing your video...</h3>
                    <p className="text-xs text-gray-500">This usually takes 1-3 minutes</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[#a91d22] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${analysis?.progress || 0}%` }}
                  />
                </div>

                <AnalysisProgress
                  currentStep={analysis?.step || "Queued"}
                  progress={analysis?.progress || 0}
                />
              </div>
            )}

            {isFailed && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analysis Failed</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {analysis?.error || "Something went wrong. Please try again."}
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry Analysis
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Analysis Complete</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    AI found{" "}
                    <span className="font-bold text-[#a91d22]">{candidates.length}</span>{" "}
                    potential clips in your video
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-analyze
                </button>
              </div>
            )}
          </div>

          {/* Video Metadata */}
          {analysis?.video_metadata && Object.keys(analysis.video_metadata).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Video Info
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {analysis.video_metadata.duration && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Duration</span>
                    <p className="text-sm font-medium text-gray-900">{formatTime(analysis.video_metadata.duration)}</p>
                  </div>
                )}
                {analysis.video_metadata.width && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Resolution</span>
                    <p className="text-sm font-medium text-gray-900">{analysis.video_metadata.width}×{analysis.video_metadata.height}</p>
                  </div>
                )}
                {analysis.video_metadata.fps && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">FPS</span>
                    <p className="text-sm font-medium text-gray-900">{analysis.video_metadata.fps}</p>
                  </div>
                )}
                {analysis.video_metadata.codec && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Codec</span>
                    <p className="text-sm font-medium text-gray-900">{analysis.video_metadata.codec}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            ×
          </button>
        </div>
      )}

      {/* Clip Candidates */}
      {isCompleted && candidates.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#a91d22]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                AI Found {candidates.length} Potential Clips
              </h2>
              <p className="text-sm text-gray-500">
                Preview, edit, or export these moments as short-form content
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {candidates.map((candidate, index) => (
              <ClipCandidateCard
                key={candidate.candidate_id}
                candidate={candidate}
                index={index}
                onPreview={() => setPreviewCandidate(candidate)}
                onEdit={() => handleEditClip(candidate)}
                onGenerate={() => handleGenerateClip(candidate)}
                isGenerating={generatingClipId === candidate.candidate_id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generated Clips */}
      {generatedClips.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-[#a91d22]" />
            Generated Clips
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {generatedClips.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {generatedClips.map((clip) => (
              <div
                key={clip._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-video bg-gray-900 relative">
                  <video
                    src={clip.file_url}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <a
                      href={clip.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                    >
                      <Play className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {clip.clip_title || clip.filename}
                  </h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="font-mono">
                      {formatTime(clip.source_start)} → {formatTime(clip.source_end)}
                    </span>
                    <span>{formatSize(clip.file_size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewCandidate && videoUrl && (
        <ClipPreview
          videoUrl={videoUrl}
          start={previewCandidate.start}
          end={previewCandidate.end}
          onClose={() => setPreviewCandidate(null)}
        />
      )}
    </div>
  );
}
