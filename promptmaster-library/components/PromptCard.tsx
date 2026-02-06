import React, { useState, useMemo } from 'react';
import { Prompt, VariableMap, User } from '../types';
import { interpolateTemplate, extractVariables } from '../utils';
import { Copy, Check, Terminal, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { StarRating } from './StarRating';

interface PromptCardProps {
  prompt: Prompt;
  user: User | null;
  isSaved: boolean;
  onToggleSave: (promptId: string) => void;
  onSelect: () => void;
  onRateClick: (promptId: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  user,
  isSaved,
  onToggleSave,
  onSelect,
  onRateClick
}) => {
  return (
    <div
      onClick={onSelect}
      className="glass rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full group relative overflow-hidden cursor-pointer active:scale-[0.98] shimmer-card"
    >

      {/* Action Overlay Buttons (Top Right) */}
      <div className="absolute top-5 right-5 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(prompt.id);
          }}
          className={`
            p-2.5 rounded-xl shadow-lg transition-all duration-200 backdrop-blur-md
            ${isSaved
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              : 'bg-white/5 text-slate-400 hover:text-red-500 hover:bg-white/10 border border-white/10'}
          `}
          title={isSaved ? "Remove from Saved" : "Save Prompt"}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Header */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/20">
            {prompt.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">{prompt.title}</h3>

        {/* Rating Row */}
        <div className="flex items-center gap-3 mb-4">
          <StarRating rating={prompt.rating} size={14} showValue />
          <span className="text-xs text-slate-600">•</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRateClick(prompt.id);
            }}
            className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {prompt.reviews.length} feedback
          </button>
        </div>

        <p className="text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed font-medium">{prompt.description}</p>

        <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-wrap gap-2 text-slate-500">
            {(prompt.tags || []).slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-bold text-slate-500 px-2 py-1 rounded-md bg-white/5 border border-white/5">#{tag}</span>
            ))}
          </div>

          <div className="text-blue-500/50 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
            <Terminal className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
