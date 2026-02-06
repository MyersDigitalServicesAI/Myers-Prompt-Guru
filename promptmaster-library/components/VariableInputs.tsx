import React from 'react';
import { VariableMap } from '../types';
import { Sparkles, X, RefreshCw } from 'lucide-react';

interface VariableInputsProps {
  variables: string[];
  values: VariableMap;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export const VariableInputs: React.FC<VariableInputsProps> = ({ variables, values, onChange, onClear }) => {
  if (variables.length === 0) return null;

  return (
    <div className="glass rounded-[2rem] shadow-2xl border border-white/5 p-8 mb-10 transition-all duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10"></div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Dynamic Neural Variables</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time prompt mutation engine</p>
          </div>
        </div>

        {Object.keys(values).some(k => values[k]) && (
          <button
            onClick={onClear}
            className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-500 hover:text-red-400 transition-all px-4 py-2 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20"
          >
            <X className="w-4 h-4" />
            Void All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {variables.map((variable) => (
          <div key={variable} className="relative group">
            <label
              htmlFor={`var-${variable}`}
              className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1 group-hover:text-blue-400 transition-colors"
            >
              {variable}
            </label>
            <div className="relative">
              <input
                id={`var-${variable}`}
                type="text"
                value={values[variable] || ''}
                onChange={(e) => onChange(variable, e.target.value)}
                placeholder={`Set ${variable.toLowerCase()}...`}
                className="w-full pl-4 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-600 shadow-inner"
              />
              {/* Active Indicator dot */}
              {values[variable] && (
                <div className="absolute right-4 top-4 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};