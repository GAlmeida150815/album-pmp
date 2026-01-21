"use client";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  initialRating?: number;
  onRate: (score: number) => void;
  readOnly?: boolean;
}

export default function StarRating({
  initialRating = 0,
  onRate,
  readOnly = false,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(initialRating);

  const displayValue = hover !== null ? hover : (rating ?? initialRating);
  console.log(displayValue);
  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number,
  ) => {
    if (readOnly) return;

    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;

    const newValue = percent < 0.5 ? starIndex - 0.5 : starIndex;
    setHover(newValue);
  };

  const handleClick = () => {
    if (readOnly || hover === null) return;
    setRating(hover);
    onRate(hover);
  };

  return (
    <div
      className='flex gap-1'
      onMouseLeave={() => !readOnly && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        let fillPercentage = "0%";
        if (displayValue >= starIndex) {
          fillPercentage = "100%";
        } else if (displayValue >= starIndex - 0.5) {
          fillPercentage = "50%";
        }

        return (
          <button
            key={starIndex}
            disabled={readOnly}
            onClick={handleClick}
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            className={`relative w-[18px] h-[18px] transition-transform duration-200 ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            <Star size={18} className='text-gray-600 absolute top-0 left-0' />

            <div
              className='absolute top-0 left-0 overflow-hidden h-full'
              style={{ width: fillPercentage }}
            >
              <Star
                size={18}
                className='fill-yellow-400 text-yellow-400 min-w-[18px]'
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
