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
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-hidden cursor-pointer active:scale-95"
    >

      {/* Action Overlay Buttons (Top Right) */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(prompt.id);
          }}
          className={`
            p-2 rounded-full shadow-sm transition-all duration-200
            ${isSaved
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100'}
          `}
          title={isSaved ? "Remove from Saved" : "Save Prompt"}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Header */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 pr-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 uppercase tracking-wider">
            {prompt.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{prompt.title}</h3>

        {/* Rating Row */}
        <div className="flex items-center gap-3 mb-3">
          <StarRating rating={prompt.rating} size={14} showValue />
          <span className="text-xs text-slate-400">•</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRateClick(prompt.id);
            }}
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            {prompt.reviews.length} reviews
          </button>
        </div>

        <p className="text-sm text-slate-500 line-clamp-3 mb-4">{prompt.description}</p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex -space-x-1">
            {(prompt.tags || []).slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 mr-1">#{tag}</span>
            ))}
          </div>

          <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
            <Terminal className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
