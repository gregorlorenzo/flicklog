'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStarRatingProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    size?: number;
}

export function OnboardingStarRating({
    value,
    onChange,
    min = 0,
    max = 5,
    size = 28,
}: OnboardingStarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starValue: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const isHalf = (e.clientX - rect.left) / rect.width < 0.5;
        let currentHover = isHalf ? starValue - 0.5 : starValue;

        // Clamp the hover value to the allowed range
        if (currentHover < min) currentHover = min;
        if (currentHover > max) currentHover = max;

        setHoverValue(currentHover);
    };

    const handleClick = () => {
        if (hoverValue !== undefined) {
            onChange(hoverValue);
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
                const isDisabled = starValue < min || starValue - 0.5 > max;

                return (
                    <div
                        key={starValue}
                        className={cn(
                            'relative cursor-pointer',
                            isDisabled && 'cursor-not-allowed opacity-30'
                        )}
                        onMouseMove={(e) => !isDisabled && handleMouseMove(e, starValue)}
                        onClick={() => !isDisabled && handleClick()}
                    >
                        <Star
                            size={size}
                            className="text-muted-foreground/50"
                            fill="currentColor"
                        />
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