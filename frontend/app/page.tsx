"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CinematicVideoWall } from "../components/landing/CinematicVideoWall";

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
          router.push("/home");
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
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-sm font-medium tracking-widest uppercase">Finding your creative universe</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0505] selection:bg-red-500/30">
      <CinematicVideoWall />
      
      {/* Features Section */}
      <section className="relative bg-[#1a0505] py-32 px-4 border-t border-red-900/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Everything you've ever made. <br className="hidden md:block"/>Instantly searchable.</h3>
            <p className="text-lg text-red-100/60 max-w-2xl mx-auto">
              Our AI processes your entire video library, understanding context, emotion, and content so you can find the perfect clip in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#280b0b] border border-red-900/30 rounded-2xl p-8 hover:bg-[#320e0e] transition-colors group">
              <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mb-6 text-red-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Semantic Search</h4>
              <p className="text-red-100/60 leading-relaxed">Describe a moment, an emotion, or a topic. CreatorAI finds the exact timestamp across years of content.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#280b0b] border border-red-900/30 rounded-2xl p-8 hover:bg-[#320e0e] transition-colors group">
              <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mb-6 text-red-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Smart Auto-Edit</h4>
              <p className="text-red-100/60 leading-relaxed">Turn hours of raw footage into engaging shorts. The AI automatically identifies hooks and formats them.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#280b0b] border border-red-900/30 rounded-2xl p-8 hover:bg-[#320e0e] transition-colors group">
              <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mb-6 text-red-300 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Unified Archive</h4>
              <p className="text-red-100/60 leading-relaxed">Connect your YouTube, Twitch, and local drives. One beautifully organized dashboard for all your assets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-b from-[#1a0505] to-[#280b0b] border-t border-red-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80')] bg-cover bg-center opacity-[0.03] mix-blend-overlay" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to unlock your archives?</h2>
          <p className="text-xl text-red-100/70 mb-10 max-w-2xl mx-auto">Join thousands of creators who are already using CreatorAI to scale their content production.</p>
          <button 
            onClick={() => router.push("/home")}
            className="px-10 py-5 bg-white text-[#280b0b] font-bold rounded-full text-lg hover:scale-105 transition-transform shadow-xl shadow-red-900/20"
          >
            Start your free trial
          </button>
        </div>
      </section>
    </main>
  );
}
