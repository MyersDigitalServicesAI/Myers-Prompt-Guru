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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-800">
          <div className="bg-indigo-100 p-1.5 rounded-md">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold">Dynamic Variables</h2>
        </div>
        
        {Object.keys(values).some(k => values[k]) && (
          <button 
            onClick={onClear}
            className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors font-medium px-2 py-1 hover:bg-red-50 rounded"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500 mb-4">
        Fill in the boxes below to instantly update all matching placeholders (e.g., [Topic]) across all prompts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variables.map((variable) => (
          <div key={variable} className="relative group">
            <label 
              htmlFor={`var-${variable}`}
              className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
            >
              {variable}
            </label>
            <div className="relative">
              <input
                id={`var-${variable}`}
                type="text"
                value={values[variable] || ''}
                onChange={(e) => onChange(variable, e.target.value)}
                placeholder={`Enter ${variable.toLowerCase()}...`}
                className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              {/* Active Indicator dot */}
              {values[variable] && (
                <div className="absolute right-3 top-3 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};