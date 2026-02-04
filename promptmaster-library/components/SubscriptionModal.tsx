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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Section */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4 border border-blue-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
            <p className="text-slate-400 text-sm">Unlock the full power of PromptMaster</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-baseline justify-center mb-8">
            <span className="text-4xl font-bold text-slate-900">$5.00</span>
            <span className="text-slate-500 ml-1">/ month</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-700">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm font-medium">Access to <span className="text-blue-600 font-bold">LLM Guru</span> (Prompt Architect)</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Edge-Based <span className="text-blue-600 font-bold">Screenshot & Photo</span> Extraction</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Batch / <span className="text-blue-600 font-bold">Bulk Upload</span> existing prompts</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Unlimited Library Storage</span>
            </li>
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Subscribe Now
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-400 mt-4">
            Secure payment via MockStripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};