import React, { useState } from 'react';
import { X } from 'lucide-react';
import { StarRating } from './StarRating';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  promptTitle: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, promptTitle }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm glass rounded-[2.5rem] shadow-2xl p-10 border border-white/10 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Post-Analysis</h3>
        <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-8">{promptTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center flex-col items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Efficiency Rating</span>
            <StarRating rating={rating} size={40} interactive onRate={setRating} />
          </div>

          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Inject feedback (optional)..."
              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white h-32 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 outline-none resize-none placeholder-slate-600 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0}
            className="w-full py-4 btn-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
          >
            Deploy Review
          </button>
        </form>
      </div>
    </div>
  );
};