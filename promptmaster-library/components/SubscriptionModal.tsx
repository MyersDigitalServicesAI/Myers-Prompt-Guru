import React, { useState } from 'react';
import { X, Check, Zap, Shield, Sparkles } from 'lucide-react';
import { User } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    // Check for real Stripe Payment Link in environment variable
    const stripeLink = (import.meta as any).env.VITE_STRIPE_PAYMENT_LINK;

    if (stripeLink && stripeLink !== 'your_stripe_payment_link_here') {
      setIsProcessing(true);
      // Redirect to the actual Stripe Payment Link
      window.location.href = stripeLink;
      return;
    }

    // Fallback to simulation for dev/testing
    setIsProcessing(true);
    setTimeout(() => {
      onUpgrade();
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Section */}
        <div className="p-10 text-center relative overflow-hidden border-b border-white/5 bg-white/[0.02]">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
              <Zap className="w-8 h-8 fill-blue-400" />
            </div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">GO <span className="text-blue-500">PRO</span></h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide">UNLOCK THE ULTIMATE PROMPT ARCHITECT</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-10">
          <div className="flex items-baseline justify-center mb-10 gap-2">
            <span className="text-5xl font-black text-white tracking-tighter">$5.00</span>
            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">/ month</span>
          </div>

          <ul className="space-y-5 mb-10">
            {[
              { text: "Access to LLM Guru Architect", color: "text-blue-400" },
              { text: "Edge-Based OCR Analysis", color: "text-blue-400" },
              { text: "Bulk Neural Injection", color: "text-blue-400" },
              { text: "Unlimited Synced Storage", color: "text-blue-400" }
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-slate-300 group">
                <div className="flex-shrink-0 w-6 h-6 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-tight">{item.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-5 btn-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Initiate Upgrade
              </>
            )}
          </button>

          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-center text-slate-600 mt-6">
            SECURE ACCESS • CANCEL ANYTIME • 256-BIT ENCRYPTION
          </p>
        </div>
      </div>
    </div>
  );
};