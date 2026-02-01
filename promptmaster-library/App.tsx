import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PromptCard } from './components/PromptCard';
import { AuthModal } from './components/AuthModal';
import { ReviewModal } from './components/ReviewModal';
import { BulkAddModal } from './components/BulkAddModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { GuruChat } from './components/GuruChat';
import { Category, VariableMap, User, SortOption, Prompt, Comment } from './types';
import { PROMPTS } from './data';
import { extractVariables } from './utils';
import { ExtractedPrompt } from './services/gemini';
import { Menu, Search, Filter, LogIn, LogOut, User as UserIcon, Star, Plus, Info, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  // --- Global State ---
  const [activeCategory, setActiveCategory] = useState<Category | 'saved' | 'history'>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [variableValues, setVariableValues] = useState<VariableMap>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State (Mutable for ratings)
  const [allPrompts, setAllPrompts] = useState<Prompt[]>(PROMPTS);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Feature State
  const [isGuruOpen, setIsGuruOpen] = useState(false);

  // Review State
  const [reviewPromptId, setReviewPromptId] = useState<string | null>(null);

  // Bulk Add State
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);

  // Filter & Sort State
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.POPULAR);
  const [minRating, setMinRating] = useState<number>(0);

  // --- Load User from LocalStorage ---
  useEffect(() => {
    const savedUser = localStorage.getItem('promptmaster_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // --- Filtering Logic ---
  const filteredPrompts = useMemo(() => {
    let filtered = allPrompts;

    // 1. Category Filter
    if (activeCategory === 'saved' && user) {
      filtered = filtered.filter(p => user.savedPrompts.includes(p.id));
    } else if (activeCategory === 'history' && user) {
      // Get unique prompt IDs from history (most recent first)
      const historyIds = [...new Set(user.history.map(h => h.promptId))];
      filtered = historyIds
        .map(id => allPrompts.find(p => p.id === id))
        .filter((p): p is Prompt => !!p);
    } else if (activeCategory !== Category.ALL && activeCategory !== 'saved' && activeCategory !== 'history') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // 2. Advanced Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      // Parse tokens handling basic spaces. (Quotes support could be added but space split is standard for this scope)
      const tokens = query.match(/[^\s"]+|"[^"]*"/g) || [];
      
      const constraints = tokens.map(token => {
        const cleanToken = token.replace(/^"|"$/g, '');
        if (cleanToken.startsWith('-')) return { type: 'exclude', value: cleanToken.slice(1) };
        if (cleanToken.startsWith('var:')) return { type: 'variable', value: cleanToken.slice(4) };
        if (cleanToken.startsWith('tag:')) return { type: 'tag', value: cleanToken.slice(4) };
        if (cleanToken.startsWith('#')) return { type: 'tag', value: cleanToken.slice(1) };
        return { type: 'include', value: cleanToken };
      });

      filtered = filtered.filter(p => {
        const searchableText = `${p.title} ${p.description} ${p.template} ${p.tags?.join(' ') || ''}`.toLowerCase();
        const promptVars = extractVariables([p.template]).map(v => v.toLowerCase());
        const promptTags = (p.tags || []).map(t => t.toLowerCase());

        return constraints.every(c => {
          if (!c.value) return true; // Ignore empty tokens
          
          switch (c.type) {
            case 'exclude':
              return !searchableText.includes(c.value);
            case 'variable':
              return promptVars.includes(c.value);
            case 'tag':
              return promptTags.some(t => t.includes(c.value));
            case 'include':
            default:
              return searchableText.includes(c.value);
          }
        });
      });
    }

    // 3. Min Rating Filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // 4. Sorting
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case SortOption.NEWEST:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case SortOption.RATING:
          return b.rating - a.rating;
        case SortOption.POPULAR:
        default:
          // Weighted mix of rating and review count
          const scoreA = a.rating * (a.reviews.length + 1);
          const scoreB = b.rating * (b.reviews.length + 1);
          return scoreB - scoreA;
      }
    });
  }, [allPrompts, activeCategory, searchQuery, user, sortOption, minRating]);

  // --- Actions ---

  const handleLogin = (newUser: User) => {
    // Merge if existing data in localstorage for this email (mock logic)
    setUser(newUser);
    localStorage.setItem('promptmaster_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuruOpen(false);
    setActiveCategory(Category.ALL);
    localStorage.removeItem('promptmaster_user');
  };

  const handleUpgrade = () => {
    if (!user) return;
    const updatedUser = { ...user, isPro: true };
    setUser(updatedUser);
    localStorage.setItem('promptmaster_user', JSON.stringify(updatedUser));
  };

  const handleOpenGuru = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else if (!user.isPro) {
      setSubscriptionModalOpen(true);
    } else {
      setIsGuruOpen(true);
    }
  };

  const toggleSave = (promptId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const isSaved = user.savedPrompts.includes(promptId);
    const newSaved = isSaved 
      ? user.savedPrompts.filter(id => id !== promptId)
      : [...user.savedPrompts, promptId];
    
    const updatedUser = { ...user, savedPrompts: newSaved };
    setUser(updatedUser);
    localStorage.setItem('promptmaster_user', JSON.stringify(updatedUser));
  };

  const addToHistory = (promptId: string) => {
    if (!user) return;
    const newHistory = [{ promptId, timestamp: new Date().toISOString() }, ...user.history];
    // Keep last 50
    const trimmed = newHistory.slice(0, 50);
    const updatedUser = { ...user, history: trimmed };
    setUser(updatedUser);
    localStorage.setItem('promptmaster_user', JSON.stringify(updatedUser));
  };

  const submitReview = (rating: number, text: string) => {
    if (!reviewPromptId || !user) return;
    
    setAllPrompts(prev => prev.map(p => {
      if (p.id === reviewPromptId) {
        const newReview: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          userName: user.name,
          rating,
          text,
          createdAt: new Date().toISOString()
        };
        const updatedReviews = [newReview, ...p.reviews];
        // Recalculate average
        const avg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        return { ...p, reviews: updatedReviews, rating: avg };
      }
      return p;
    }));
  };

  const handleBulkImport = (extracted: ExtractedPrompt[]) => {
    const newPrompts: Prompt[] = extracted.map(item => ({
      id: crypto.randomUUID(),
      title: item.title,
      description: item.description,
      template: item.template,
      category: item.category,
      tags: item.tags,
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString()
    }));

    setAllPrompts(prev => [...newPrompts, ...prev]);
  };

  const handleVariableChange = (key: string, val: string) => {
    setVariableValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Navigation */}
      <Sidebar 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        isLoggedIn={!!user}
        isPro={user?.isPro || false}
        onOpenGuru={handleOpenGuru}
        onOpenSubscribe={() => setSubscriptionModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4 w-full max-w-4xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Search... (Try 'var:Topic', '-python', or '#seo')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative group/tooltip">
                   <Info className="h-4 w-4 text-slate-400" />
                   <div className="absolute right-0 top-6 w-64 p-3 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                     <p className="font-semibold mb-1 text-white">Advanced Search:</p>
                     <ul className="space-y-1">
                       <li><code className="bg-slate-700 px-1 rounded">var:name</code> - Contains variable</li>
                       <li><code className="bg-slate-700 px-1 rounded">-text</code> - Exclude text</li>
                       <li><code className="bg-slate-700 px-1 rounded">#tag</code> - Filter by tag</li>
                     </ul>
                   </div>
                </div>
              </div>
            </div>

            {/* Sorting & Filter Controls */}
            <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-4">
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="text-sm font-medium text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-blue-600"
              >
                {Object.values(SortOption).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>

              <select 
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="text-sm font-medium text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-blue-600"
              >
                <option value={0}>All Ratings</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
          </div>
          
          {/* User Auth & Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Guru Button for Pro Users */}
            {user?.isPro && (
              <button 
                onClick={() => setIsGuruOpen(!isGuruOpen)}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all border ${isGuruOpen ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200'}`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden lg:inline">Guru Chat</span>
              </button>
            )}

             <button
              onClick={() => {
                if (!user) setAuthModalOpen(true);
                else if (!user.isPro) setSubscriptionModalOpen(true);
                else setIsBulkAddOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              title={!user?.isPro ? "Upgrade to Add Prompts" : "Add New Prompts"}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">Add Prompts</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                  <div className="flex items-center gap-1">
                    {user.isPro && <span className="text-[10px] font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 py-0.5 rounded shadow-sm">PRO</span>}
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </div>
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200">
                  {user.name[0].toUpperCase()}
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Log Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto pb-20">
            
            {/* Category Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {activeCategory === 'saved' ? 'Saved Prompts' : 
                   activeCategory === 'history' ? 'Recently Used' : 
                   activeCategory}
                </h2>
                <p className="text-slate-500 mt-1">
                  {filteredPrompts.length} result{filteredPrompts.length !== 1 ? 's' : ''} found
                  {minRating > 0 && ` with ${minRating}+ stars`}
                </p>
              </div>
              
              {/* Mobile Add Button */}
              <button
                onClick={() => {
                  if (!user) setAuthModalOpen(true);
                  else if (!user.isPro) setSubscriptionModalOpen(true);
                  else setIsBulkAddOpen(true);
                }}
                className="sm:hidden w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Prompts
              </button>
            </div>

            {/* Prompts Grid */}
            {filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => (
                  <PromptCard 
                    key={prompt.id} 
                    prompt={prompt} 
                    variableValues={variableValues}
                    onVariableChange={handleVariableChange}
                    user={user}
                    isSaved={user?.savedPrompts.includes(prompt.id) || false}
                    onToggleSave={toggleSave}
                    onCopy={addToHistory}
                    onRateClick={(id) => {
                      if (!user) setAuthModalOpen(true);
                      else setReviewPromptId(id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Filter className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No prompts found</h3>
                <p className="text-slate-500 mt-1 max-w-sm">
                  {searchQuery 
                    ? `No results matching "${searchQuery}"` 
                    : "Try adjusting your filters or category selection."}
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery(''); 
                    setActiveCategory(Category.ALL);
                    setMinRating(0);
                  }}
                  className="mt-6 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Side Panels & Modals */}
      <GuruChat 
        isOpen={isGuruOpen} 
        onClose={() => setIsGuruOpen(false)} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onUpgrade={handleUpgrade}
      />

      <ReviewModal 
        isOpen={!!reviewPromptId}
        onClose={() => setReviewPromptId(null)}
        onSubmit={submitReview}
        promptTitle={allPrompts.find(p => p.id === reviewPromptId)?.title || ''}
      />
      
      <BulkAddModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
};

export default App;