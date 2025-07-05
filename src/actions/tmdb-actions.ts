'use server';

import { searchMovies, searchTvShows } from '@/lib/tmdb/tmdb-client';

export interface UnifiedSearchResult {
    id: number;
    type: 'movie' | 'tv';
    title: string;
    poster_path: string | null;
    release_year: string;
}

export async function searchTmdb(
    query: string
): Promise<UnifiedSearchResult[]> {
    if (!query) {
        return [];
    }

    try {
        const [movies, tvShows] = await Promise.all([
            searchMovies(query),
            searchTvShows(query),
        ]);

        const unifiedMovies: UnifiedSearchResult[] = movies.map((m) => ({
            id: m.id,
            type: 'movie',
            title: m.title,
            poster_path: m.poster_path,
            release_year: m.release_date ? new Date(m.release_date).getFullYear().toString() : 'N/A',
        }));

        const unifiedTv: UnifiedSearchResult[] = tvShows.map((t) => ({
            id: t.id,
            type: 'tv',
            title: t.name,
            poster_path: t.poster_path,
            release_year: t.first_air_date ? new Date(t.first_air_date).getFullYear().toString() : 'N/A',
        }));

        const combined = [];
        const maxLength = Math.max(unifiedMovies.length, unifiedTv.length);
        for (let i = 0; i < maxLength; i++) {
            if (unifiedMovies[i]) combined.push(unifiedMovies[i]);
            if (unifiedTv[i]) combined.push(unifiedTv[i]);
        }

        return combined.slice(0, 10);

    } catch (error) {
        console.error('Error in searchTmdb server action:', error);
        return [];
    }
}