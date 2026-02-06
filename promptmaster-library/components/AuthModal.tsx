import React, { useState } from 'react';
import { User } from '../types';
import { X, Mail, User as UserIcon, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate backend auth
    const user: User = {
      name: isLogin ? (email.split('@')[0] || 'User') : name,
      email: email,
      isPro: false,
      savedPrompts: [],
      history: []
    };
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md glass rounded-[2.5rem] shadow-2xl p-10 transform transition-all border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'Neural Access' : 'New Developer'}
          </h2>
          <p className="text-slate-400 mt-2 text-sm font-medium leading-relaxed">
            {isLogin ? 'Synchronize your architectural library' : 'Join PROMPTGURU to architect and deploy units'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none transition-all placeholder-slate-600 shadow-inner"
                  placeholder="Architect Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Protocol</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none transition-all placeholder-slate-600 shadow-inner"
                placeholder="you@protocol.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none transition-all placeholder-slate-600 shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 btn-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95"
          >
            {isLogin ? 'Initiate Link' : 'Register Architect'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs font-bold tracking-tight">
          <span className="text-slate-500">
            {isLogin ? "No authorization? " : "Already registered? "}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 font-black hover:text-blue-400 transition-colors uppercase tracking-widest ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};