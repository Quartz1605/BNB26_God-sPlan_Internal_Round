"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderKanban, FileVideo, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
}

interface User {
  name: string;
  email: string;
}

export default function DashboardHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user and projects
    Promise.all([
      fetch("http://localhost:8000/auth/me", { credentials: "include" }).then(res => res.json()),
      fetch("http://localhost:8000/projects", { credentials: "include" }).then(res => res.json())
    ])
    .then(([userData, projectsData]) => {
      if (userData.user) setUser(userData.user);
      if (Array.isArray(projectsData)) setProjects(projectsData);
    })
    .catch(err => console.error("Failed to load dashboard data:", err))
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-gray-500">Here's what's happening with your content today.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a91d22] to-[#c7262c] text-white font-medium shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:border-red-100 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#a91d22]">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:border-red-100 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#a91d22]">
            <FileVideo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:border-red-100 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#a91d22]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Processing Assets</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No projects yet</h3>
            <p className="text-gray-500 text-sm mb-6">Get started by creating your first project.</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.slice(0, 5).map(project => (
              <Link 
                key={project._id} 
                href={`/dashboard/projects/${project._id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
              >
                <div>
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-[#a91d22] transition-colors">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description || 'No description'}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
