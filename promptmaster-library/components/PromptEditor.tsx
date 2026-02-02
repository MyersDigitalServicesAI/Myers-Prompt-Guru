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
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{prompt.title}</h2>
            <p className="text-sm text-slate-500">{prompt.category}</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-md
            ${copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5'}
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied to Clipboard
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Prompt
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Variable Input (The "Outside Box") */}
        <aside className="w-80 border-r border-slate-100 bg-slate-50/50 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Configure Variables</h3>
            </div>

            {promptVariables.length > 0 ? (
              <div className="space-y-4">
                {promptVariables.map(variable => (
                  <div key={variable} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 ml-1">
                      {variable.charAt(0).toUpperCase() + variable.slice(1)}
                    </label>
                    <input
                      type="text"
                      placeholder={`Enter ${variable}...`}
                      value={variableValues[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-600 text-sm flex gap-3">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>No variables found in this prompt. It's ready to use as-is!</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setVariableValues({})}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
            >
              Reset to Template
            </button>
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2">Instructions</h4>
              <p className="text-xs leading-relaxed text-slate-300">
                Fill in the variables on the left. The prompt on the right will update in real-time. Once satisfied, click "Copy Prompt" to use it anywhere.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Area: Real-time Preview */}
        <section className="flex-1 bg-white p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Live Preview</h3>
              <div className="text-xs font-medium">
                {hasUnfilledVariables ? (
                  <span className="text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Waiting for variables...
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Ready for deployment
                  </span>
                )}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-inner min-h-[400px]">
                <div className="absolute top-4 right-4 opacity-50">
                  <Terminal className="w-5 h-5 text-slate-400" />
                </div>
                <div className="font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {filledText}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Prompt Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Est. Tokens</p>
                  <p className="text-xl font-bold text-slate-900">{Math.ceil(filledText.length / 4)}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Words</p>
                  <p className="text-xl font-bold text-slate-900">{filledText.split(/\s+/).filter(Boolean).length}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Variables</p>
                  <p className="text-xl font-bold text-slate-900">{promptVariables.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
