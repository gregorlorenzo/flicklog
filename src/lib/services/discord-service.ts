import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';
import { getTmdbMediaDetails, TmdbMovieDetails } from '@/lib/tmdb/tmdb-client';
import type { LogEntry, Profile, Rating, Comment } from '@prisma/client';

export type DiscordNotificationData = {
    logEntry: LogEntry;
    rating: Rating & { user: Profile; comments: Comment[] };
};

function isMovie(details: any): details is TmdbMovieDetails {
    return details !== null && 'title' in details;
}

async function constructDiscordEmbed(notificationData: DiscordNotificationData) {
    const { logEntry, rating } = notificationData;
    const { user, comments } = rating;

    const mediaDetails = await getTmdbMediaDetails(
        logEntry.tmdb_id,
        logEntry.tmdb_type as 'movie' | 'tv'
    );

    if (!mediaDetails) {
        console.error(`Could not fetch media details for tmdbId: ${logEntry.tmdb_id}`);
        return null;
    }

    const title = isMovie(mediaDetails) ? mediaDetails.title : mediaDetails.name;
    const releaseYear = (isMovie(mediaDetails) ? mediaDetails.release_date : mediaDetails.first_air_date)?.substring(0, 4);

    const quickTakeComment = comments.find(c => c.type === 'QUICK_TAKE');
    const stars = '⭐'.repeat(Math.floor(rating.value)) + (rating.value % 1 !== 0 ? '✨' : '');

    let description = `**${rating.value.toFixed(1)}** ${stars}\n`;
    if (quickTakeComment) {
        description += `> ${quickTakeComment.content}`;
    }

    const embed = {
        content: `${user.display_name} just logged a new entry!`,
        embeds: [
            {
                title: `${title} (${releaseYear})`,
                url: `https://www.themoviedb.org/${logEntry.tmdb_type}/${logEntry.tmdb_id}`,
                description: description,
                color: 13915497,
                image: {
                    url: buildPosterUrl(mediaDetails.poster_path, 'w500'),
                },
                author: {
                    name: `${user.display_name} (@${user.username})`,
                    icon_url: user.avatar_url ?? undefined,
                },
                footer: {
                    text: 'Logged with Flicklog',
                    icon_url: 'https://i.imgur.com/hC4zF24.png',
                },
                timestamp: new Date().toISOString(),
            },
        ],
    };

    return embed;
}

export async function postToDiscord(webhookUrl: string, notificationData: DiscordNotificationData) {
    const payload = await constructDiscordEmbed(notificationData);

    if (!payload) {
        console.error("Failed to construct Discord embed, aborting post.");
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Discord API Error: ${response.status} ${response.statusText}`, await response.json());
        }
    } catch (error) {
        console.error("Failed to post notification to Discord:", error);
    }
}