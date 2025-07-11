import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type StatsData = Prisma.PromiseReturnType<typeof getStatsDataForSpace>;
import { getTmdbMediaDetails } from '../tmdb/tmdb-client';

export type RewindEntry = {
    logEntryId: string;
    tmdbId: string;
    tmdbType: string;
    title: string;
    posterPath: string | null;
    watchedOn: Date;
    rating: number;
};

/**
 * Fetches all the data required to build the statistics page for a given space.
 * This includes all log entries, and for each entry, all ratings with the rater's profile.
 *
 * @param spaceId The ID of the space to fetch data for.
 * @returns A promise that resolves to an array of log entries with nested ratings and profiles.
 */
export async function getStatsDataForSpace(spaceId: string) {
    const statsData = await prisma.logEntry.findMany({
        where: {
            space_id: spaceId,
        },
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
                where: {
                    value: {
                        gte: 0,
                    }
                }
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return statsData;
}

/**
 * Fetches log entries that a user watched on the same day/month in previous years.
 *
 * @param userId The ID of the user to fetch rewind data for.
 * @returns A promise that resolves to an array of rewind entries.
 */
export async function getFlicklogRewind(userId: string): Promise<RewindEntry[]> {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const ratingsOnThisDay = await prisma.rating.findMany({
        where: {
            user_id: userId,
            watched_on: {
                lt: new Date(currentYear, today.getMonth(), currentDay),
            },
        },
        include: {
            log_entry: true,
        },
        orderBy: {
            watched_on: 'desc',
        },
    });

    const filteredRatings = ratingsOnThisDay.filter(rating => {
        const watchedDate = new Date(rating.watched_on);
        return watchedDate.getDate() === currentDay && (watchedDate.getMonth() + 1) === currentMonth;
    });


    if (filteredRatings.length === 0) {
        return [];
    }

    const rewindEntries = await Promise.all(
        filteredRatings.map(async (rating) => {
            const details = await getTmdbMediaDetails(
                rating.log_entry.tmdb_id,
                rating.log_entry.tmdb_type as 'movie' | 'tv'
            );

            const getTitle = () => {
                if (!details) return 'Untitled';
                if ('title' in details) return details.title;
                if ('name' in details) return details.name;
                return 'Untitled';
            }

            return {
                logEntryId: rating.log_entry.id,
                tmdbId: rating.log_entry.tmdb_id,
                tmdbType: rating.log_entry.tmdb_type,
                title: getTitle(),
                posterPath: details?.poster_path ?? null,
                watchedOn: rating.watched_on,
                rating: rating.value,
            };
        })
    );

    return rewindEntries;
}