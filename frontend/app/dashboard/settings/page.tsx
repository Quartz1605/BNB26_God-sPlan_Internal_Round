"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4 animate-in fade-in">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
        <Settings className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-gray-500 max-w-md">
        Manage your account preferences, billing, and integrations.
      </p>
    </div>
  );
}
