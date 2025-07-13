import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
    getTmdbMediaDetails,
    type TmdbMovieDetails,
    type TmdbTvShowDetails,
} from '@/lib/tmdb/tmdb-client';
import { LogEntryCard } from '@/components/features/log/LogEntryCard';
import { EmptyState } from '@/components/shared/empty-state';
import { Film } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type LogEntryWithDetails = Prisma.LogEntryGetPayload<{
    include: {
        ratings: {
            include: {
                user: {
                    select: {
                        user_id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
            },
        };
    };
}>;

type EnrichedLogEntry = LogEntryWithDetails & {
    mediaDetails: TmdbMovieDetails | TmdbTvShowDetails | null;
};

function isMovie(details: any): details is TmdbMovieDetails {
    return details !== null && 'title' in details;
}

function getMediaTitle(details: EnrichedLogEntry['mediaDetails']): string {
    if (!details) return 'Loading...';
    return isMovie(details) ? details.title : details.name;
}

function getReleaseYear(details: EnrichedLogEntry['mediaDetails']): string {
    if (!details) return '';
    const dateString = isMovie(details)
        ? details.release_date
        : details.first_air_date;
    return dateString ? dateString.substring(0, 4) : '';
}

async function getLogEntriesForSpace(spaceId: string) {
    // Artificial delay to demonstrate loading state
    await new Promise(resolve => setTimeout(resolve, 1500));

    const logEntries = await prisma.logEntry.findMany({
        where: { space_id: spaceId },
        include: {
            ratings: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: {
                            user_id: true,
                            username: true,
                            display_name: true,
                            avatar_url: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return logEntries;
}

interface LibraryGridProps {
    spaceId: string;
}

export async function LibraryGrid({ spaceId }: LibraryGridProps) {
    const logEntries = await getLogEntriesForSpace(spaceId);

    const enrichedLogEntries: EnrichedLogEntry[] = await Promise.all(
        logEntries.map(async (entry) => {
            const mediaDetails = await getTmdbMediaDetails(
                entry.tmdb_id,
                entry.tmdb_type as 'movie' | 'tv'
            );
            return {
                ...entry,
                mediaDetails,
            };
        })
    );

    if (enrichedLogEntries.length === 0) {
        return (
            <EmptyState
                icon={Film}
                title="Library is Empty"
                description="Log your first movie or TV show in this space to get started."
            >
                <Button asChild>
                    <Link href={`/spaces/${spaceId}/log/new`}>+ Log New Entry</Link>
                </Button>
            </EmptyState>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {enrichedLogEntries.map((entry) => (
                <div key={entry.id}>
                    <LogEntryCard
                        title={getMediaTitle(entry.mediaDetails)}
                        posterPath={entry.mediaDetails?.poster_path ?? null}
                        releaseYear={getReleaseYear(entry.mediaDetails)}
                        ratings={entry.ratings}
                    />
                </div>
            ))}
        </div>
    );
}