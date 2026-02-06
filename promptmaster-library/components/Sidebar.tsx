import React from 'react';
import { Category } from '../types';
import {
  Layout, Code, PenTool, TrendingUp, Briefcase, Palette,
  GraduationCap, Layers, Heart, History, Sparkles, Zap
} from 'lucide-react';

interface SidebarProps {
  activeCategory: Category | 'saved' | 'history';
  onSelectCategory: (category: Category | 'saved' | 'history') => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  isLoggedIn: boolean;
  isPro: boolean;
  onOpenGuru: () => void;
  onOpenSubscribe: () => void;
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  [Category.ALL]: Layout,
  [Category.CODING]: Code,
  [Category.WRITING]: PenTool,
  [Category.MARKETING]: TrendingUp,
  [Category.BUSINESS]: Briefcase,
  [Category.CREATIVE]: Palette,
  [Category.LEARNING]: GraduationCap,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  isOpen,
  onCloseMobile,
  isLoggedIn,
  isPro,
  onOpenGuru,
  onOpenSubscribe
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 glass border-r border-white/5 transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="btn-primary p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white">MYERS<span className="text-blue-500">PROMPTGURU</span></h1>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-10">

          {/* AI Tools Section */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Intelligence</h3>
            <button
              onClick={() => {
                onOpenGuru();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-200 border border-purple-500/20 group shadow-lg shadow-purple-500/5"
            >
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Guru Architect</span>
              {!isPro && (
                <span className="ml-auto text-[10px] bg-white/5 text-slate-400 px-2 py-1 rounded-lg border border-white/10">PRO</span>
              )}
            </button>
          </div>

          {/* Main Categories */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Library</h3>
            <nav className="space-y-1.5">
              {Object.values(Category).map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || Layout;
                const isActive = activeCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory(cat);
                      onCloseMobile();
                    }}
                    className={`
                      w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {cat}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Library */}
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Workspace</h3>
            <nav className="space-y-1.5">
              <button
                onClick={() => {
                  onSelectCategory('saved');
                  onCloseMobile();
                }}
                disabled={!isLoggedIn}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${activeCategory === 'saved'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : isLoggedIn ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 cursor-not-allowed opacity-50'}
                `}
              >
                <Heart className="w-5 h-5" />
                Favorites
              </button>

              <button
                onClick={() => {
                  onSelectCategory('history');
                  onCloseMobile();
                }}
                disabled={!isLoggedIn}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${activeCategory === 'history'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : isLoggedIn ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 cursor-not-allowed opacity-50'}
                `}
              >
                <History className="w-5 h-5" />
                Recent History
              </button>
            </nav>
          </div>
        </div>

        {/* Pro Banner */}
        {!isPro && (
          <div className="p-6 border-t border-white/5">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                <Zap className="w-20 h-20 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white font-black mb-1">
                  <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  UNLEASH PRO
                </div>
                <p className="text-[11px] text-blue-100/80 mb-4 font-medium">Access full AI Architect features and OCR extraction.</p>
                <button
                  onClick={onOpenSubscribe}
                  className="w-full py-2.5 bg-white text-blue-700 text-xs font-black rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-lg"
                >
                  Upgrade Now — $5/mo
                </button>
              </div>
            </div>
          </div>
        )}

        {isPro && (
          <div className="p-6 border-t border-white/5 text-[10px] font-black text-slate-500 flex items-center justify-center gap-2 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse"></span> PRO SUBSCRIPTION ACTIVE
          </div>
        )}
      </aside>
    </>
  );
};