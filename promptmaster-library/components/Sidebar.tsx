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
        fixed top-0 left-0 bottom-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">PromptMaster</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          
          {/* AI Tools Section */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">AI Tools</h3>
            <button
              onClick={() => {
                onOpenGuru();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200 border border-purple-500/20 group"
            >
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
              <span>Guru Chat</span>
              {!isPro && (
                 <span className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">PRO</span>
              )}
            </button>
          </div>

          {/* Main Categories */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Discover</h3>
            <nav className="space-y-1">
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
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
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
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">My Library</h3>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  onSelectCategory('saved');
                  onCloseMobile();
                }}
                disabled={!isLoggedIn}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeCategory === 'saved' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isLoggedIn ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed opacity-50'}
                `}
              >
                <Heart className="w-5 h-5" />
                Saved Prompts
              </button>
              
              <button
                onClick={() => {
                  onSelectCategory('history');
                  onCloseMobile();
                }}
                disabled={!isLoggedIn}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeCategory === 'history' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isLoggedIn ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed opacity-50'}
                `}
              >
                <History className="w-5 h-5" />
                History
              </button>
            </nav>
            {!isLoggedIn && (
               <div className="mt-4 px-3 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400 border border-slate-700">
                 Sign in to access your library and history.
               </div>
            )}
          </div>
        </div>

        {/* Pro Banner */}
        {!isPro && (
          <div className="p-4 border-t border-slate-800">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 text-white font-bold mb-1">
                  <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  Go Pro
                </div>
                <p className="text-xs text-blue-100 mb-3">Unlock Guru Chat & Unlimited Prompts.</p>
                <button 
                  onClick={onOpenSubscribe}
                  className="w-full py-1.5 bg-white text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Upgrade $5/mo
                </button>
             </div>
          </div>
        )}

        {isPro && (
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Pro Active
          </div>
        )}
      </aside>
    </>
  );
};