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
    <div className="flex items-center gap-1">
      <div className="flex">
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
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star 
                size={size} 
                className={`${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'} transition-colors`} 
              />
            </button>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-medium text-slate-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};