// src/lib/tmdb-client.ts

import { cache } from 'react';

/**
 * A server-side-only client for interacting with The Movie Database (TMDB) API.
 * This module should not be imported into any client-side components.
 *
 * @see https://developer.themoviedb.org/reference/intro/getting-started
 */

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not defined in environment variables');
}

// --- Helper Types ---
interface TmdbImageConfig {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
}

interface TmdbApiConfig {
    images: TmdbImageConfig;
}


export interface TmdbMovieSearchResult {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
}

export interface TmdbTvSearchResult {
    id: number;
    name: string;
    poster_path: string | null;
    first_air_date: string;
}

export interface TmdbMovieDetails {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    runtime: number;
    genres: { id: number; name: string }[];
}

interface TmdbPaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface TmdbTvShowDetails {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    episode_run_time: number[];
    number_of_seasons: number;
    genres: { id: number; name: string }[];
}

// --- API Functions ---

/**
 * Fetches the TMDB API configuration, which is needed to construct image URLs.
 * This function's result is cached across requests using Next.js's caching mechanisms.
 * We use `React.cache` to memoize the request within a single server render pass.
 *
 * @returns {Promise<TmdbImageConfig>} The image configuration object.
 */
export const getTmdbImageConfig = cache(async (): Promise<TmdbImageConfig> => {
    console.log('Fetching TMDB API Configuration...');

    const url = `${TMDB_API_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
        },
        next: {
            tags: ['tmdb_config'],
        },
    };

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.error(`Failed to fetch TMDB config: ${res.status} ${res.statusText}`);
            throw new Error('Failed to fetch TMDB configuration');
        }
        const data: TmdbApiConfig = await res.json();
        return data.images;
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw new Error('Could not fetch TMDB configuration.');
    }
});

/**
 * Searches for movies on TMDB based on a query string.
 * This is not cached as results are dynamic per query.
 *
 * @param query - The user's search term.
 * @returns {Promise<TmdbMovieSearchResult[]>} A list of movie search results.
 */
export async function searchMovies(query: string): Promise<TmdbMovieSearchResult[]> {
    if (!query) return [];

    const url = `${TMDB_API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1&api_key=${TMDB_API_KEY}`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
        },
        cache: 'no-store' as RequestCache,
    };

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.error(`Failed to search movies: ${res.status} ${res.statusText}`);
            throw new Error('Failed to search for movies.');
        }
        const data: TmdbPaginatedResponse<TmdbMovieSearchResult> = await res.json();
        return data.results.slice(0, 10);
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw new Error('Could not search for movies.');
    }
}

/**
 * Searches for TV shows on TMDB based on a query string.
 * This is not cached as results are dynamic per query.
 *
 * @param query - The user's search term.
 * @returns {Promise<TmdbTvSearchResult[]>} A list of TV show search results.
 */
export async function searchTvShows(query: string): Promise<TmdbTvSearchResult[]> {
    if (!query) return [];

    const url = `${TMDB_API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1&api_key=${TMDB_API_KEY}`;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
        },
        cache: 'no-store' as RequestCache,
    };

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.error(`Failed to search TV shows: ${res.status} ${res.statusText}`);
            throw new Error('Failed to search for TV shows.');
        }
        const data: TmdbPaginatedResponse<TmdbTvSearchResult> = await res.json();
        return data.results.slice(0, 10);
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw new Error('Could not search for TV shows.');
    }
}

/**
 * Fetches detailed information for a specific movie from TMDB.
 * The result of this function is cached by Next.js fetch.
 *
 * @param movieId - The ID of the movie to fetch.
 * @returns {Promise<TmdbMovieDetails>} The detailed movie object.
 */
export async function getMovieDetails(movieId: number): Promise<TmdbMovieDetails> {
    const url = `${TMDB_API_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
        },
        // We can let Next.js cache this for a long time.
        // Revalidating once a day is a sensible default for movie details.
        next: {
            revalidate: 3600 * 24,
        },
    };

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.error(`Failed to get movie details: ${res.status} ${res.statusText}`);
            throw new Error(`Failed to get details for movie ID: ${movieId}`);
        }
        const data: TmdbMovieDetails = await res.json();
        return data;
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw new Error('Could not fetch movie details.');
    }
}

/**
 * Fetches detailed information for a specific TV show from TMDB.
 * The result of this function is cached by Next.js fetch.
 *
 * @param tvId - The ID of the TV show to fetch.
 * @returns {Promise<TmdbTvShowDetails>} The detailed TV show object.
 */
export async function getTvShowDetails(tvId: number): Promise<TmdbTvShowDetails> {
    const url = `${TMDB_API_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
        },
        next: {
            revalidate: 3600 * 24,
        },
    };

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.error(`Failed to get TV show details: ${res.status} ${res.statusText}`);
            throw new Error(`Failed to get details for TV show ID: ${tvId}`);
        }
        const data: TmdbTvShowDetails = await res.json();
        return data;
    } catch (error) {
        console.error('TMDB API Error:', error);
        throw new Error('Could not fetch TV show details.');
    }
}

/**
 * Fetches the detailed information for a specific movie or TV show.
 * This is a higher-level abstraction that calls the correct specific function.
 * It also handles potential errors gracefully by returning null.
 *
 * @param id The TMDB ID of the media (as a string, will be parsed).
 * @param type The type of media, 'movie' or 'tv'.
 * @returns The detailed media object from TMDB API or null on error.
 */
export async function getTmdbMediaDetails(
    id: string,
    type: 'movie' | 'tv'
): Promise<TmdbMovieDetails | TmdbTvShowDetails | null> {
    try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new Error('Invalid media ID provided.');
        }

        if (type === 'movie') {
            return await getMovieDetails(numericId);
        } else if (type === 'tv') {
            return await getTvShowDetails(numericId);
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error in getTmdbMediaDetails for ${type}:${id}:`, error);
        return null;
    }
}