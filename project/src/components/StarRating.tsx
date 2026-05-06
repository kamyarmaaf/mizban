import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({
  rating,
  totalRatings,
  size = 'md',
  interactive = false,
  onRate
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleClick = (value: number) => {
    if (!interactive) return;
    setSelectedRating(value);
    onRate?.(value);
  };

  const handleMouseEnter = (value: number) => {
    if (!interactive) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
  };

  const displayRating = interactive ? (hoverRating || selectedRating) : rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;
          const isPartiallyFilled = value - 0.5 <= displayRating && displayRating < value;

          return (
            <button
              key={value}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`transition-all ${
                interactive
                  ? 'cursor-pointer hover:scale-110 active:scale-95'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isPartiallyFilled
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : interactive && hoverRating >= value
                    ? 'fill-yellow-300 text-yellow-300'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          );
        })}
      </div>
      {!interactive && (
        <div className="flex items-center gap-1">
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
            {rating.toFixed(1)}
          </span>
          {totalRatings !== undefined && (
            <span className={`text-gray-500 ${textSizeClasses[size]}`}>
              ({totalRatings.toLocaleString('fa-IR')})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
