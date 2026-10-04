"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Check, AlertCircle, RefreshCw } from "lucide-react";

interface UploadManagerProps {
  projectId: string;
  onUploadComplete: () => void;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function UploadManager({ projectId, onUploadComplete }: UploadManagerProps) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newTasks = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      setTasks(prev => [...prev, ...newTasks]);
      
      // Start uploads
      newTasks.forEach(task => startUpload(task));
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startUpload = async (task: UploadTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'uploading', progress: 0 } : t));

    try {
      // 1. Init Upload
      const initRes = await fetch(`http://localhost:8000/projects/${projectId}/assets/upload/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          filename: task.file.name,
          content_type: task.file.type || "application/octet-stream",
          file_size: task.file.size
        })
      });

      if (!initRes.ok) throw new Error("Failed to initialize upload");
      
      const { upload_url, asset_id, s3_key } = await initRes.json();

      // 2. Direct S3 Upload via XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", upload_url, true);
        xhr.setRequestHeader("Content-Type", task.file.type || "application/octet-stream");
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress } : t));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during S3 upload"));
        xhr.send(task.file);
      });

      // 3. Complete Upload
      const completeRes = await fetch(`http://localhost:8000/projects/${projectId}/assets/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          asset_id,
          s3_key,
          status: "success"
        })
      });

      if (!completeRes.ok) throw new Error("Failed to complete upload");

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t));
      onUploadComplete();
    } catch (err: any) {
      console.error("Upload error:", err);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', error: err.message || "Upload failed" } : t));
      
      // If we failed after init, we should ideally tell backend it failed, but not strictly required if we have cleanup cron.
    }
  };

  const retryUpload = (task: UploadTask) => {
    startUpload(task);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="mb-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        multiple 
        accept="video/mp4,video/quicktime,video/webm,image/*,audio/*"
        className="hidden" 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md"
      >
        <Upload className="w-4 h-4" />
        Upload Clips
      </button>

      {tasks.length > 0 && (
        <div className="mt-3 space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="bg-gray-800 border border-gray-700 rounded-md p-2 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="truncate max-w-[150px] font-medium text-gray-200" title={task.file.name}>
                  {task.file.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{(task.file.size / (1024 * 1024)).toFixed(1)}MB</span>
                  {task.status === 'error' && (
                    <button onClick={() => retryUpload(task)} className="text-gray-400 hover:text-white" title="Retry">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                  {task.status !== 'uploading' && (
                    <button onClick={() => removeTask(task.id)} className="text-gray-500 hover:text-red-400" title="Remove">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              {task.status === 'uploading' && (
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${task.progress}%` }} 
                  />
                </div>
              )}
              
              {task.status === 'completed' && (
                <div className="flex items-center gap-1 text-green-400 mt-1">
                  <Check className="w-3 h-3" />
                  <span>Uploaded</span>
                </div>
              )}
              
              {task.status === 'error' && (
                <div className="flex items-center gap-1 text-red-400 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">{task.error}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
