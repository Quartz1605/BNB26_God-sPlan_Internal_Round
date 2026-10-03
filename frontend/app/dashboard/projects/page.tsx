"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/projects", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(err => console.error("Failed to load projects:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a91d22]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Projects</h1>
          <p className="mt-1 text-gray-500">Manage all your content operations in one place.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white font-medium shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
            <FolderKanban className="w-10 h-10" />
          </div>
          <h3 className="text-xl text-gray-900 font-semibold mb-2">No projects found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first project to start organizing your assets, generating clips, and streamlining your workflow.</p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Project Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link 
              key={project._id} 
              href={`/dashboard/projects/${project._id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#a91d22]/30 transition-all flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-red-50 text-[#a91d22] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#a91d22] transition-colors line-clamp-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 flex-1 line-clamp-2 mb-4">
                {project.description || "No description"}
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className="text-[#a91d22] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
