import Image from 'next/image';
import { Star, Users } from 'lucide-react';
import { Prisma } from '@prisma/client';

import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type RatingWithUser = Prisma.RatingGetPayload<{
    include: {
        user: {
            select: {
                user_id: true;
                display_name: true;
                avatar_url: true;
            };
        };
    };
}>;

export interface LogEntryCardProps {
    title: string;
    posterPath: string | null;
    releaseYear: string;
    ratings?: RatingWithUser[];
}

function getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export function LogEntryCard({
    title,
    posterPath,
    releaseYear,
    ratings = [],
}: LogEntryCardProps) {
    const totalRating = ratings.reduce((acc, r) => acc + r.value, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
    const averageRatingDisplay = averageRating > 0 ? averageRating.toFixed(1) : '-';

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
                    <div className="flex items-center gap-2">
                        <Star size={16} className="text-primary" fill="currentColor" />
                        <span className="font-semibold">{averageRatingDisplay}</span>
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className="flex items-center -space-x-2">
                                        {ratings.slice(0, 3).map(({ user }) => (
                                            <Avatar key={user.user_id} className="h-5 w-5 border-2 border-black">
                                                <AvatarImage src={user.avatar_url ?? undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(user.display_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {ratings.length === 0 && (
                                            <Users size={16} className="text-muted-foreground" />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {ratings.length > 0 ? (
                                        <ul className="space-y-1 text-xs">
                                            {ratings.map((r) => (
                                                <li key={r.user.user_id} className="flex items-center gap-2">
                                                    <span>{r.user.display_name}:</span>
                                                    <span className="font-bold">{r.value.toFixed(1)} ★</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs">No ratings yet.</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}