"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Sparkles, Scissors, Layers, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already authenticated
    fetch("http://localhost:8000/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          router.push("/dashboard");
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-[#a91d22]"></div>
          <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">Connecting to Studio...</span>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login";
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-slate-200">
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#a91d22] flex items-center justify-center text-white shadow-sm">
              <Video className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">CreatorAI</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              FastAPI Engine Online
            </div>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Sign In
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-5xl mx-auto w-full">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-xs mb-8">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[#a91d22] font-semibold text-[10px] uppercase tracking-wider">
            New
          </span>
          <span>Transcript-first AI video analysis and clipping engine</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 text-center max-w-3xl leading-[1.15]">
          Intelligent video clipping for modern creators.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 text-center max-w-2xl leading-relaxed">
          Upload full-length footage. CreatorAI transcribes audio, identifies high-retention hooks, scores viral potential, and prepares ready-to-edit clips.
        </p>

        {/* Auth CTA Card */}
        <div className="mt-10 w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <button
            onClick={handleLogin}
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.99] transition-all"
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure OAuth 2.0 • Zero password storage</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
              <Sparkles className="w-4 h-4 text-[#a91d22]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Transcript Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deepgram-powered speech recognition paired with LLM context scanning for strong hooks and clear topics.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
              <Scissors className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Intelligent Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every candidate segment is evaluated on hook strength, clarity, pacing, and visual continuity before clipping.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-3">
              <Layers className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Multi-Track Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fine-tune cuts, overlay text graphics, adjust aspect ratios (16:9, 9:16), and export directly to your workflow.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">CreatorAI</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>FastAPI Backend</span>
            <span>Cloudinary Storage</span>
            <span>Deepgram Transcription</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
