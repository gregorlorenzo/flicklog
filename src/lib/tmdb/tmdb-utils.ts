/**
 * A utility function to build a full image URL for a TMDB poster.
 * This is a synchronous function that can be used safely on the client or server.
 * The base URL is hardcoded as it is highly stable.
 *
 * @param posterPath - The path from the TMDB API (e.g., /f89U3ADr1oiB1s9Gz0gSbn0QhTm.jpg)
 * @param size - The desired poster size. Defaults to 'w500'.
 * @returns {string} The full, absolute URL for the image, or a placeholder.
 */
export function buildPosterUrl(posterPath: string | null, size: string = 'w500'): string {
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

    if (!posterPath) {
        return '/placeholder-poster.png';
    }
    return `${TMDB_IMAGE_BASE_URL}${size}${posterPath}`;
}