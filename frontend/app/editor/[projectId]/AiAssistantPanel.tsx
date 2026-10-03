"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { useEditorStore } from "./store";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export function AiAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm CreatorAI. I can execute commands directly on your timeline. Try saying 'add a text clip' or 'make it grayscale'."
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addClip, tracks, playhead, updateClip, clips, saveHistoryState } = useEditorStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    const cmd = input;
    setInput("");

    try {
      // Build context
      const context = {
        playhead,
        tracks: tracks.map(t => ({ id: t.id, type: t.type })),
        clips: clips.map(c => ({ 
          id: c.id, 
          trackId: c.trackId,
          type: c.type, 
          startTime: c.startTime, 
          duration: c.duration,
          effects: c.effects 
        }))
      };

      // We need projectId. Let's just extract it from URL for simplicity.
      const projectId = window.location.pathname.split("/").pop();

      const res = await fetch(`http://localhost:8000/projects/${projectId}/ai-command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cmd, context }),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      
      if (data.commands && data.commands.length > 0) {
        saveHistoryState(); // Save before applying AI commands
        
        data.commands.forEach((c: any) => {
          if (c.type === "add_text") {
            const textTrack = tracks.find(t => t.type === 'text') || tracks[0];
            if (textTrack) {
              addClip({
                assetId: "ai-text-" + Date.now(),
                trackId: textTrack.id,
                startTime: c.timelineStart ?? playhead,
                duration: c.timelineDuration ?? 3,
                sourceStart: 0,
                sourceEnd: c.timelineDuration ?? 3,
                name: "AI Text",
                type: "text",
                textContent: c.content || "Hello",
                fontSize: 64,
                color: "#ffffff"
              });
            }
          } else if (c.type === "apply_effect") {
            // Apply effect to active video clip
            const activeClips = clips.filter(cl => playhead >= cl.startTime && playhead < (cl.startTime + cl.duration));
            const videoClip = activeClips.find(cl => cl.type === 'video' || cl.type === 'image');
            if (videoClip && c.effectName) {
              const currentEffects = videoClip.effects || [];
              if (!currentEffects.includes(c.effectName)) {
                updateClip(videoClip.id, { effects: [...currentEffects, c.effectName] });
              }
            }
          }
        });
      }

      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.message || "Done." }
      ]);
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I ran into an error processing that command." }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-thin scrollbar-thumb-gray-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 text-sm ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
            <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center ${msg.role === 'assistant' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
              {msg.role === 'assistant' ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className={`rounded-lg p-2.5 max-w-[85%] ${msg.role === 'assistant' ? 'bg-indigo-900/20 border border-indigo-500/20 text-indigo-100' : 'bg-[#1c1c1c] border border-gray-800 text-gray-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 relative shrink-0">
        <input 
          type="text" 
          placeholder="Ask CreatorAI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="w-full bg-[#1c1c1c] border border-gray-700 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
        />
        <button 
          onClick={handleSend}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white bg-[#2a2a2a] rounded-md transition-colors"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
