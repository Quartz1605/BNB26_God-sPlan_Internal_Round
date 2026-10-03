"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Settings2,
  ChevronDown,
  ChevronUp,
  Video,
  CheckCircle2,
  Clock,
  Target,
  FileText,
  Lightbulb,
  Radio,
  ArrowRight
} from "lucide-react";

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

  const [plan, setPlan] = useState<any>(null);

  const examplePrompts = [
    "Explain AI agents to beginners with clear real-world examples",
    "Create a high-energy demo video about my developer tool startup",
    "Make a 10-minute deep-dive tutorial on RAG architecture",
    "Tell the story of how our team scaled to 100k users"
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setPlan(null);
    try {
      const res = await fetch("http://localhost:8000/projects/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt, platform, duration, tone, audience }),
      });

      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();

      // Setup initial selected options
      data.selectedTitle = data.titleOptions[0];
      data.selectedHook = data.hookOptions[0];
      setPlan(data);
    } catch (err) {
      alert("Couldn't generate your content plan. Please verify the backend service is running and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!plan) return;
    try {
      const res = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: plan.selectedTitle,
          description: plan.objective,
          platform: platform,
          audience: audience,
          duration: duration,
          hook: plan.selectedHook,
          script: plan.script,
          sections: plan.timeline,
          visualPlan: plan.visualSuggestions,
          cta: plan.cta,
          thumbnailPrompt: plan.thumbnailPrompt
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      router.push(`/dashboard/projects/${project._id}`);
    } catch (err) {
      alert("Failed to create project. Please try again.");
    }
  };

  if (plan) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 py-4">
        {/* Step Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlan(null)}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Back to prompt"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Step 2 of 2
                </span>
                <span className="text-xs text-slate-500">Plan Generated</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Review Content Blueprint</h1>
            </div>
          </div>

          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Confirm & Launch Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Video Title
              </label>
              <span className="text-[11px] text-slate-400">Choose best option</span>
            </div>
            <select
              className="w-full text-base font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:bg-white text-slate-900"
              value={plan.selectedTitle}
              onChange={(e) => setPlan({ ...plan, selectedTitle: e.target.value })}
            >
              {plan.titleOptions.map((t: string, i: number) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Hook Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Opening Hook Variation
            </label>
            <div className="space-y-2.5">
              {plan.hookOptions.map((hook: string, i: number) => {
                const isSelected = plan.selectedHook === hook;
                return (
                  <label
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#a91d22] bg-red-50/50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hook"
                      className="mt-0.5 accent-[#a91d22]"
                      checked={isSelected}
                      onChange={() => setPlan({ ...plan, selectedHook: hook })}
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                      "{hook}"
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Video Blueprint Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Timeline Structure</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pacing and section breakdown planned by AI</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {plan.timeline.length} Sections
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              {plan.timeline.map((sec: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-800 text-white font-mono text-[10px] font-bold shadow-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {sec.start}s
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-xs">
                    <div className="font-semibold text-slate-900 text-sm mb-0.5">{sec.title}</div>
                    <div className="text-[11px] font-medium text-slate-500 mb-2 uppercase tracking-wider">{sec.purpose}</div>
                    <p className="text-xs text-slate-700 italic border-l-2 border-[#a91d22] pl-3 py-0.5 bg-white rounded-r">
                      "{sec.script}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Confirmation Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setPlan(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Modify Direction
            </button>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Confirm & Launch Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
          Step 1 of 2 • Planning
        </span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          Create New Video Project
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Describe the core concept or topic. CreatorAI synthesizes high-retention hooks, timeline milestones, and production scripts.
        </p>
      </div>

      {/* Main Creation Card */}
      <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              What do you want to create?
            </label>
            <span className="text-[11px] text-slate-400">
              {prompt.length} characters
            </span>
          </div>

          <textarea
            rows={5}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "I want to create a video explaining how MCP works, why Anthropic developed it, and how engineers can build tools with it..."'
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 p-4 resize-none transition-all placeholder:text-slate-400 text-slate-900"
          />
        </div>

        {/* Prompt Suggestions */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-slate-400" />
            Quick prompt starters:
          </span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ep, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(ep)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
              >
                {ep}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters Accordion */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-slate-900 py-1"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-500" />
              <span>Project Parameters (Platform, Duration, Tone, Audience)</span>
            </div>
            {showSettings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showSettings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400 text-slate-800"
                >
                  <option>YouTube</option>
                  <option>YouTube Shorts</option>
                  <option>Instagram Reels</option>
                  <option>TikTok</option>
                  <option>LinkedIn</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400 text-slate-800"
                >
                  <option>30 sec</option>
                  <option>60 sec</option>
                  <option>3 min</option>
                  <option>5 min</option>
                  <option>10 min</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400 text-slate-800"
                >
                  <option>Educational</option>
                  <option>Storytelling</option>
                  <option>Professional</option>
                  <option>Energetic</option>
                  <option>Casual</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-slate-400 text-slate-800"
                >
                  <option>Beginners</option>
                  <option>Developers</option>
                  <option>Professionals</option>
                  <option>General audience</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#a91d22] hover:bg-[#8b151b] text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Prompt & Generating Blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Content Blueprint</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
