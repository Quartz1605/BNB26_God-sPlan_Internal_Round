"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        throw new Error("Failed to create project");
      }

      const project = await res.json();
      router.push(`/dashboard/projects/${project._id}`);
    } catch (err) {
      setError("Failed to create project. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Project</h1>
          <p className="text-sm text-gray-500 mt-1">Start a new content creation workflow.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a91d22]/20 focus:border-[#a91d22] transition-all bg-gray-50/50 hover:bg-white"
            placeholder="e.g. My Next Youtube Video"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a91d22]/20 focus:border-[#a91d22] transition-all resize-none bg-gray-50/50 hover:bg-white"
            placeholder="Optional project description..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white font-medium shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
