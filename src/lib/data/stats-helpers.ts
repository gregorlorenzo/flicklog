import { StatsData } from './stats-data';
import { getMovieDetails, getTvShowDetails } from '../tmdb/tmdb-client';

type UserStats = {
    userId: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    totalRatings: number;
    averageRating: number;
};

export type CriticStats = {
    toughestCritic: UserStats | null;
    mostGenerous: UserStats | null;
    memberStats: UserStats[];
};

type FilmStats = {
    logEntryId: string;
    tmdbId: string;
    tmdbType: string;
    posterPath: string | null;
    title: string;
    ratings: { value: number; user: { displayName: string | null } }[];
    ratingCount: number;
    averageRating: number;
    stdDev: number;
};

export type AgreementStats = {
    greatDivide: FilmStats[];
    perfectHarmony: FilmStats[];
};

/**
 * Calculates the "Toughest Critic" (lowest average rating) and "Most Generous"
 * member (highest average rating) from the provided stats data.
 *
 * @param data The raw data fetched from getStatsDataForSpace.
 * @returns An object containing the toughest critic, most generous member, and a list of all member stats.
 */
export function calculateCriticStats(data: StatsData): CriticStats {
    const userRatings: Record<string, { total: number; count: number; profile: UserStats }> = {};

    data.forEach(logEntry => {
        logEntry.ratings.forEach(rating => {
            const user = rating.user;
            if (!user) return;

            if (!userRatings[user.user_id]) {
                userRatings[user.user_id] = {
                    total: 0,
                    count: 0,
                    profile: {
                        userId: user.user_id,
                        username: user.username,
                        displayName: user.display_name,
                        avatarUrl: user.avatar_url,
                        totalRatings: 0,
                        averageRating: 0,
                    },
                };
            }

            userRatings[user.user_id].total += rating.value;
            userRatings[user.user_id].count += 1;
        });
    });

    const memberStats = Object.values(userRatings).map(stat => {
        const averageRating = stat.count > 0 ? stat.total / stat.count : 0;
        stat.profile.totalRatings = stat.count;
        stat.profile.averageRating = averageRating;
        return stat.profile;
    }).filter(stat => stat.totalRatings > 0);

    if (memberStats.length === 0) {
        return { toughestCritic: null, mostGenerous: null, memberStats: [] };
    }

    let toughestCritic = memberStats[0];
    let mostGenerous = memberStats[0];

    for (const stat of memberStats) {
        if (stat.averageRating < toughestCritic.averageRating) {
            toughestCritic = stat;
        }
        if (stat.averageRating > mostGenerous.averageRating) {
            mostGenerous = stat;
        }
    }

    if (memberStats.length === 1) {
        return { toughestCritic: memberStats[0], mostGenerous: memberStats[0], memberStats };
    }

    return { toughestCritic, mostGenerous, memberStats };
}

/**
 * Calculates "The Great Divide" (most divisive films) and "Perfect Harmony"
 * (films everyone agrees on) from the provided stats data.
 *
 * @param data The raw data fetched from getStatsDataForSpace.
 * @returns An object containing lists of divisive and harmonious films.
 */
export async function calculateAgreementStats(data: StatsData): Promise<AgreementStats> {
    const filmStatsPromises = data
        .filter(logEntry => logEntry.ratings.length >= 2)
        .map(async (logEntry) => {
            const ratings = logEntry.ratings.map(r => r.value);
            const sum = ratings.reduce((a, b) => a + b, 0);
            const count = ratings.length;
            const average = sum / count;

            const stdDev = Math.sqrt(
                ratings.map(x => Math.pow(x - average, 2)).reduce((a, b) => a + b, 0) / count
            );

            let details;
            const numericId = parseInt(logEntry.tmdb_id, 10);

            try {
                if (logEntry.tmdb_type === 'movie') {
                    details = await getMovieDetails(numericId);
                } else {
                    details = await getTvShowDetails(numericId);
                }
            } catch (error) {
                console.error(`Failed to fetch details for ${logEntry.tmdb_type}:${logEntry.tmdb_id}`, error);
                details = null;
            }

            const getTitle = () => {
                if (!details) return 'Untitled';
                if ('title' in details) return details.title; 
                if ('name' in details) return details.name;
                return 'Untitled';
            };

            return {
                logEntryId: logEntry.id,
                tmdbId: logEntry.tmdb_id,
                tmdbType: logEntry.tmdb_type,
                posterPath: details?.poster_path ?? null,
                title: getTitle(),
                ratings: logEntry.ratings.map(r => ({ value: r.value, user: { displayName: r.user.display_name } })),
                ratingCount: count,
                averageRating: average,
                stdDev: isNaN(stdDev) ? 0 : stdDev,
            };
        });

    const filmStats = await Promise.all(filmStatsPromises);

    const greatDivide = [...filmStats].sort((a, b) => b.stdDev - a.stdDev);
    const perfectHarmony = filmStats.filter(film => film.stdDev === 0 && film.averageRating >= 4);

    return { greatDivide, perfectHarmony };
}