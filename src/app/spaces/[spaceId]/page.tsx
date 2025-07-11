import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
    getTmdbMediaDetails,
    type TmdbMovieDetails,
    type TmdbTvShowDetails,
} from '@/lib/tmdb/tmdb-client';
import { LogEntryCard } from '@/components/features/log/LogEntryCard';
import { getFlicklogRewind } from '@/lib/data/stats-data';
import { FlicklogRewind } from '@/components/features/dashboard/flicklog-rewind';
import { createClient } from '@/lib/supabase/server';

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


export default async function SpacePage({
    params,
}: {
    params: Promise<{ spaceId: string }>;
}) {
    const { spaceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const space = await prisma.space.findUnique({ where: { id: spaceId } });

    if (!space) {
        return notFound();
    }

    const [logEntries, rewindEntries] = await Promise.all([
        getLogEntriesForSpace(spaceId),
        user && space.type === 'PERSONAL' ? getFlicklogRewind(user.id) : Promise.resolve([])
    ]);

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

    return (
        <div>
            <header className="mb-8">
                <h1 className="font-heading text-4xl font-bold">{space.name}</h1>
                <p className="text-lg text-muted-foreground">
                    A shared library of your collective viewing experiences.
                </p>
            </header>

            <FlicklogRewind entries={rewindEntries} />

            {enrichedLogEntries.length > 0 ? (
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
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50 p-12 text-center">
                    <h3 className="text-xl font-semibold">Library is Empty</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Log your first movie or TV show in this space to get started.
                    </p>
                </div>
            )}
        </div>
    );
}