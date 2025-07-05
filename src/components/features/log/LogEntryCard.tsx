import Image from 'next/image';
import { Star } from 'lucide-react';

import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';

export interface LogEntryCardProps {
    tmdbId: string;
    title: string;
    posterPath: string | null;
    releaseYear: string;
    userRating: number;
}

export function LogEntryCard({
    title,
    posterPath,
    releaseYear,
    userRating,
}: LogEntryCardProps) {
    const stars = Array.from({ length: 5 }, (_, i) => (
        <Star
            key={i}
            size={16}
            className={
                i < userRating
                    ? 'text-primary'
                    : 'text-muted-foreground/30'
            }
            fill="currentColor"
        />
    ));

    return (
        <div className="group relative overflow-hidden rounded-lg">
            <Image
                src={buildPosterUrl(posterPath, 'w342')}
                alt={`Poster for ${title}`}
                width={342}
                height={513}
                className="w-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                <h3 className="font-heading text-lg font-bold">{title}</h3>
                <div className="flex items-center justify-between text-sm">
                    <span>{releaseYear}</span>
                    <div className="flex items-center">{stars}</div>
                </div>
            </div>
        </div>
    );
}