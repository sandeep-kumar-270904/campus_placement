import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AiBadge({ text = 'AI Generated', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 text-indigo-300 border border-indigo-500/25 shadow-sm ${className}`}
      title="Synthesized by AI. Fully editable and verified by institutional placement policies."
    >
      <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
      <span>{text}</span>
    </span>
  );
}
