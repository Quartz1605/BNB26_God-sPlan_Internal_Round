"use client";

import { useState, useEffect } from "react";
import { Sparkles, Fingerprint, Lightbulb, Target, Compass, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Opportunity {
  title: string;
  concept: string;
  why_this_fits: string;
  creator_dna_match: number;
  supporting_patterns: string[];
  suggested_hook: string;
  suggested_format: string;
  target_topic: string;
  confidence: number;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [dna, setDna] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [dnaRes, oppRes] = await Promise.all([
          fetch("http://localhost:8000/creator/dna", { credentials: "include" }),
          fetch("http://localhost:8000/creator/dna/opportunities", { credentials: "include" })
        ]);
        
        if (dnaRes.ok) {
          setDna(await dnaRes.json());
        }
        
        if (oppRes.ok) {
          const oppData = await oppRes.json();
          setOpportunities(oppData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const startPolling = () => {
      interval = setInterval(async () => {
        const res = await fetch("http://localhost:8000/creator/dna/opportunities", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data);
          if (data?.status !== "processing" && data?.status !== "queued") {
            setIsGenerating(false);
            clearInterval(interval);
          }
        }
      }, 5000);
    };

    if (isGenerating || opportunities?.status === "processing" || opportunities?.status === "queued") {
      startPolling();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, opportunities?.status]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("http://localhost:8000/creator/dna/opportunities/generate", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate opportunities");
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };
  
  const handleCreateContent = async (opp: Opportunity) => {
    try {
        // Here we create a new project with the opportunity title
        const res = await fetch("http://localhost:8000/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: opp.title,
                description: opp.concept,
            }),
            credentials: "include"
        });
        
        if (res.ok) {
            const project = await res.json();
            // In a real app we might pass the opportunity to the editor state via DB
            router.push(`/editor/${project._id}`);
        }
    } catch(err) {
        console.error(err);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#a91d22]" />
      </div>
    );
  }

  if (!dna || dna.status !== "completed") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#a91d22]" />
            Content Opportunities
          </h1>
          <p className="mt-2 text-gray-500 max-w-2xl">
            Discover what to create next based on your Creator DNA.
          </p>
        </div>
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center shadow-sm">
          <Fingerprint className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Creator DNA Required</h2>
          <p className="text-gray-500 mb-6">
            We need to understand your Creator DNA before we can suggest content opportunities.
          </p>
          <button
            onClick={() => router.push("/dashboard/creator-dna")}
            className="px-6 py-2.5 bg-[#a91d22] hover:bg-[#8b151b] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Go to Creator DNA
          </button>
        </div>
      </div>
    );
  }

  const isProcessing = opportunities?.status === "processing" || opportunities?.status === "queued" || isGenerating;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#a91d22]" />
            Content Opportunities
          </h1>
          <p className="mt-2 text-gray-500 max-w-2xl">
            Data-driven ideas tailored to your unique style, audience, and historical performance.
          </p>
        </div>
        {!isProcessing && (
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium shadow-sm transition-colors"
          >
            Refresh Ideas
          </button>
        )}
      </div>

      {isProcessing ? (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center shadow-sm">
          <Loader2 className="w-12 h-12 text-[#a91d22] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generating Opportunities...</h2>
          <p className="text-gray-500">
            We are analyzing your Creator DNA to find high-potential topics, formats, and angles for your next video.
          </p>
        </div>
      ) : opportunities?.opportunities?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {opportunities.opportunities.map((opp: Opportunity, idx: number) => (
            <div key={idx} className="bg-white border border-[#e5e5e5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-[#e5e5e5] flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-red-50 text-[#a91d22] text-xs font-bold uppercase tracking-wider rounded-full">
                      {opp.target_topic}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Fingerprint className="w-3 h-3" />
                      {Math.round(opp.creator_dna_match * 100)}% DNA Match
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                <p className="text-gray-600 text-sm mb-6">{opp.concept}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Compass className="w-4 h-4 text-gray-400" />
                      Why this fits
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {opp.why_this_fits}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Suggested Hook
                    </h4>
                    <p className="text-sm text-gray-900 font-medium italic">
                      "{opp.suggested_hook}"
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                 <div className="text-xs text-gray-500">
                    Format: <span className="font-medium text-gray-700">{opp.suggested_format}</span>
                 </div>
                 <button 
                    onClick={() => handleCreateContent(opp)}
                    className="flex items-center gap-2 text-sm font-medium text-[#a91d22] hover:text-red-800 transition-colors"
                 >
                    Create Content <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-12 text-center shadow-sm">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to find new ideas?</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Click below to generate personalized content opportunities based on your historical patterns.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-[#a91d22] hover:bg-[#8b151b] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Generate Opportunities
          </button>
        </div>
      )}
    </div>
  );
}
