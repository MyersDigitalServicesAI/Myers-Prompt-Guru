import React, { useState, useMemo } from 'react';
import { Prompt, VariableMap, User } from '../types';
import { interpolateTemplate, extractVariables } from '../utils';
import { Copy, Check, Terminal, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { StarRating } from './StarRating';

interface PromptCardProps {
  prompt: Prompt;
  variableValues: VariableMap;
  onVariableChange: (key: string, value: string) => void;
  user: User | null;
  isSaved: boolean;
  onToggleSave: (promptId: string) => void;
  onCopy: (promptId: string) => void;
  onRateClick: (promptId: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  variableValues, 
  onVariableChange,
  user,
  isSaved,
  onToggleSave,
  onCopy,
  onRateClick
}) => {
  const [copied, setCopied] = useState(false);

  const filledText = interpolateTemplate(prompt.template, variableValues);
  const hasUnfilledVariables = /\[(.*?)\]/.test(filledText);
  
  // Extract variables specific to this prompt
  const promptVariables = useMemo(() => extractVariables([prompt.template]), [prompt.template]);

  const handleCopy = () => {
    navigator.clipboard.writeText(filledText);
    setCopied(true);
    onCopy(prompt.id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      
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
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex justify-between items-start mb-2 pr-20">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {prompt.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{prompt.title}</h3>
        
        {/* Rating Row */}
        <div className="flex items-center gap-3 mb-2">
          <StarRating rating={prompt.rating} size={14} showValue />
          <span className="text-xs text-slate-400">•</span>
          <button 
            onClick={() => onRateClick(prompt.id)}
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            {prompt.reviews.length} reviews
          </button>
        </div>

        <p className="text-sm text-slate-500 mt-2 line-clamp-2 min-h-[40px]">{prompt.description}</p>
      </div>

      {/* Variable Inputs Section */}
      {promptVariables.length > 0 && (
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-3 text-slate-600">
             <Sparkles className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-xs font-semibold uppercase tracking-wider">Variables</span>
          </div>
          <div className="space-y-3">
            {promptVariables.map(variable => (
              <div key={variable}>
                <input 
                  type="text"
                  placeholder={`[${variable}]`}
                  value={variableValues[variable] || ''}
                  onChange={(e) => onVariableChange(variable, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-5 bg-slate-50/50">
        <div className="relative font-mono text-sm bg-slate-100 text-slate-700 p-4 rounded-lg border border-slate-200 min-h-[160px] whitespace-pre-wrap leading-relaxed shadow-inner">
          {filledText}
          
          {Object.keys(variableValues).length === 0 && (
             <div className="absolute top-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <Terminal className="w-4 h-4 text-slate-400" />
             </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex items-center justify-between">
        <div className="text-xs text-slate-400 font-medium">
           {hasUnfilledVariables ? (
             <span className="text-amber-600 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending variables
             </span>
           ) : (
             <span className="text-green-600 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ready to use
             </span>
           )}
        </div>

        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm
            ${copied 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-md hover:-translate-y-0.5'}
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
};