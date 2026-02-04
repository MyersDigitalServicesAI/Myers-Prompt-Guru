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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Rate this Prompt</h3>
        <p className="text-sm text-slate-500 mb-4">{promptTitle}</p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-6">
            <StarRating rating={rating} size={32} interactive onRate={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            className="w-full p-3 border border-slate-200 rounded-lg text-sm mb-4 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />

          <button
            type="submit"
            disabled={rating === 0}
            className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};