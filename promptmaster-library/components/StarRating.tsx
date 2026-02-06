import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  max?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onRate,
  showValue = false
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (interactive && onRate) onRate(starValue);
              }}
              className={`${interactive ? 'cursor-pointer hover:scale-125 transition-all duration-300' : 'cursor-default'}`}
            >
              <Star
                size={size}
                className={`${isFilled ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-700'} transition-all duration-500`}
              />
            </button>
          );
        })}
      </div>
      {showValue && <span className="text-xs font-black text-slate-500 ml-2 uppercase tracking-widest">{rating.toFixed(1)} UNITS</span>}
    </div>
  );
};