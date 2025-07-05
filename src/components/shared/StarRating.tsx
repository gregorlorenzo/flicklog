'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    onChange: (value: number) => void;
    size?: number;
}

export function StarRating({ value, onChange, size = 28 }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starValue: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const isHalf = (e.clientX - rect.left) / rect.width < 0.5;
        setHoverValue(isHalf ? starValue - 0.5 : starValue);
    };

    const handleClick = (starValue: number) => {
        if (starValue === value) {
            onChange(0);
        } else {
            onChange(starValue);
        }
    };

    return (
        <div
            className="flex items-center space-x-1"
            onMouseLeave={() => setHoverValue(undefined)}
        >
            {stars.map((starValue) => {
                const displayValue = hoverValue !== undefined ? hoverValue : value;
                const isFilled = displayValue >= starValue;
                const isHalf = displayValue >= starValue - 0.5 && displayValue < starValue;

                return (
                    <div
                        key={starValue}
                        className="relative cursor-pointer"
                        onMouseMove={(e) => handleMouseMove(e, starValue)}
                        onClick={() => handleClick(hoverValue ?? 0)}
                    >
                        {/* Background Star (empty) */}
                        <Star
                            size={size}
                            className="text-muted-foreground/50"
                            fill="currentColor"
                        />
                        {/* Foreground Star (filled) */}
                        <div
                            className={cn(
                                'absolute top-0 left-0 h-full overflow-hidden transition-all duration-100',
                                isFilled ? 'w-full' : isHalf ? 'w-1/2' : 'w-0'
                            )}
                        >
                            <Star
                                size={size}
                                className="text-primary"
                                fill="currentColor"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}