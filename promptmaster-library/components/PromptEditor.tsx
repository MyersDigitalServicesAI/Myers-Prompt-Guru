import React, { useState, useMemo } from 'react';
import { Prompt, VariableMap } from '../types';
import { interpolateTemplate, extractVariables } from '../utils';
import { Copy, Check, ArrowLeft, Sparkles, Terminal, Info } from 'lucide-react';

interface PromptEditorProps {
  prompt: Prompt;
  onClose: () => void;
  onCopySuccess: (promptId: string) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, onClose, onCopySuccess }) => {
  const [variableValues, setVariableValues] = useState<VariableMap>({});
  const [copied, setCopied] = useState(false);

  // Extract variables specific to this prompt
  const promptVariables = useMemo(() => extractVariables([prompt.template]), [prompt.template]);

  const filledText = interpolateTemplate(prompt.template, variableValues);
  const hasUnfilledVariables = /\[(.*?)\]/.test(filledText);

  const handleVariableChange = (key: string, val: string) => {
    setVariableValues(prev => ({ ...prev, [key]: val }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(filledText);
    setCopied(true);
    onCopySuccess(prompt.id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] animate-in slide-in-from-right duration-500 ease-out z-50">
      {/* Header */}
      <header className="px-8 py-5 glass border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{prompt.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 uppercase tracking-widest">{prompt.category}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 shadow-2xl
            ${copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'btn-primary text-white hover:shadow-blue-500/20 hover:-translate-y-1'}
          `}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" /> Copy Prompt
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Variable Input */}
        <aside className="w-96 glass border-r border-white/5 overflow-y-auto p-8 flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6 text-white">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-black text-xs uppercase tracking-[0.2em]">Variables</h3>
            </div>

            {promptVariables.length > 0 ? (
              <div className="space-y-6">
                {promptVariables.map(variable => (
                  <div key={variable} className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {variable}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${variable}...`}
                      value={variableValues[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none transition-all placeholder-slate-600 shadow-inner"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 text-sm flex gap-4 leading-relaxed">
                <Info className="w-6 h-6 flex-shrink-0" />
                <p>This architect has no dynamic variables. It is optimized and ready for immediate deployment.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-auto">
            <button
              onClick={() => setVariableValues({})}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
            >
              Reset Architect
            </button>
            <div className="p-6 glass bg-white/5 rounded-3xl border border-white/5">
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-3">Guide</h4>
              <p className="text-xs leading-relaxed text-slate-400 font-medium">
                Inject your specifics into the variables. The real-time constructor on the right reflects your architectural changes instantly.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Area: Real-time Preview */}
        <section className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-white/[0.02]">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-lg tracking-tight">Constructor Preview</h3>
              <div className="text-[10px] font-black tracking-widest uppercase">
                {hasUnfilledVariables ? (
                  <span className="text-amber-500 flex items-center gap-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                    Pending Configuration
                  </span>
                ) : (
                  <span className="text-emerald-500 flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Optimized & Ready
                  </span>
                )}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative glass border border-white/10 rounded-[2.5rem] p-10 shadow-2xl min-h-[500px]">
                <div className="absolute top-6 right-8 opacity-20">
                  <Terminal className="w-6 h-6 text-blue-400" />
                </div>
                <div className="font-mono text-slate-200 whitespace-pre-wrap leading-loose text-base selection:bg-blue-500/30">
                  {filledText}
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
              <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-6">Architectural Metrics</h4>
              <div className="grid grid-cols-3 gap-8">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Est. Complexity</p>
                  <p className="text-2xl font-black text-white">{Math.ceil(filledText.length / 4)} <span className="text-xs text-slate-600 font-bold tracking-normal uppercase ml-1">Tokens</span></p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Volume</p>
                  <p className="text-2xl font-black text-white">{filledText.split(/\s+/).filter(Boolean).length} <span className="text-xs text-slate-600 font-bold tracking-normal uppercase ml-1">Words</span></p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Structure</p>
                  <p className="text-2xl font-black text-white">{promptVariables.length} <span className="text-xs text-slate-600 font-bold tracking-normal uppercase ml-1">Injectors</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
