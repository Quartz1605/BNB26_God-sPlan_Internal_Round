"use client";

import { Construction } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4 animate-in fade-in">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
        <Construction className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Global Assets View</h1>
      <p className="text-gray-500 max-w-md">
        This feature is currently under development. Soon you'll be able to view and manage all your assets across all projects from here.
      </p>
    </div>
  );
}
