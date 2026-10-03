"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Settings2, ChevronDown, ChevronUp } from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Optional settings
  const [platform, setPlatform] = useState("YouTube");
  const [duration, setDuration] = useState("5 min");
  const [tone, setTone] = useState("Educational");
  const [audience, setAudience] = useState("Beginners");

  const examplePrompts = [
    "Explain AI agents to beginners",
    "Create a video about my startup",
    "Make a 10-minute tutorial on RAG",
    "Tell the story of how I built my app"
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Phase 1: Just simulate a loading state for now
    setTimeout(() => {
      setIsGenerating(false);
      alert("Phase 1 complete! Phase 2 will implement Gemini integration here.");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 py-12 flex flex-col items-center">
      {/* Header */}
      <div className="text-center space-y-3 relative w-full">
        <Link 
          href="/dashboard" 
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-3">
          CreatorAI <Sparkles className="w-6 h-6 text-[#a91d22]" />
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Turn your idea into a complete content plan.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleGenerate} className="w-full max-w-3xl space-y-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#a91d22]/20 to-red-400/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 flex flex-col items-center gap-6">
            <h2 className="text-xl font-semibold text-gray-800 self-start">What do you want to create?</h2>
            
            <textarea
              rows={5}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='"I want to make a video explaining how MCP works and why developers should care about it..."'
              className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-lg rounded-2xl border border-gray-200 focus:border-[#a91d22] focus:ring-4 focus:ring-[#a91d22]/10 p-6 resize-none transition-all placeholder:text-gray-400 text-gray-800"
            />
            
            {/* Example Prompts */}
            <div className="w-full">
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((ep, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(ep)}
                    className="text-sm px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-[#a91d22]/40 hover:bg-red-50 hover:text-[#a91d22] transition-colors"
                  >
                    {ep}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Settings Toggle */}
            <div className="w-full pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                Customize (Optional)
                {showSettings ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
              
              {/* Optional Settings Panel */}
              {showSettings && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-[#a91d22]/20 focus:border-[#a91d22] outline-none">
                      <option>YouTube</option>
                      <option>YouTube Shorts</option>
                      <option>Instagram Reels</option>
                      <option>TikTok</option>
                      <option>LinkedIn</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</label>
                    <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-[#a91d22]/20 focus:border-[#a91d22] outline-none">
                      <option>30 sec</option>
                      <option>60 sec</option>
                      <option>3 min</option>
                      <option>5 min</option>
                      <option>10 min</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tone</label>
                    <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-[#a91d22]/20 focus:border-[#a91d22] outline-none">
                      <option>Educational</option>
                      <option>Storytelling</option>
                      <option>Professional</option>
                      <option>Energetic</option>
                      <option>Casual</option>
                      <option>Cinematic</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Audience</label>
                    <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:ring-2 focus:ring-[#a91d22]/20 focus:border-[#a91d22] outline-none">
                      <option>Beginners</option>
                      <option>Developers</option>
                      <option>Professionals</option>
                      <option>General audience</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full mt-4 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#a91d22] hover:bg-[#c7262c] text-white font-semibold text-lg shadow-xl shadow-red-900/20 hover:shadow-2xl hover:shadow-red-900/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                "Generate Content Plan"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
