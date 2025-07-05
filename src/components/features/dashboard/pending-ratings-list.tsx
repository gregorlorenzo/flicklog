import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getTmdbMediaDetails } from '@/lib/tmdb/tmdb-client';
import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type MediaDetails = Awaited<ReturnType<typeof getTmdbMediaDetails>>;

async function getPendingRatingsForCurrentUser() {
    const pendingRatings = await prisma.pendingRating.findMany({
        include: {
            log_entry: {
                include: {
                    space: true,
                },
            },
        },
        orderBy: {
            log_entry: {
                createdAt: 'desc',
            },
        },
    });

    const enrichedRatings = await Promise.all(
        pendingRatings.map(async (pr) => {
            const mediaDetails = await getTmdbMediaDetails(
                pr.log_entry.tmdb_id,
                pr.log_entry.tmdb_type as 'movie' | 'tv'
            );
            return {
                ...pr,
                mediaDetails,
            };
        })
    );

    return enrichedRatings;
}

export async function PendingRatingsList() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const pendingRatings = await getPendingRatingsForCurrentUser();

    if (pendingRatings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Turn!</CardTitle>
                    <CardDescription>
                        Movies and shows logged by others in your shared spaces will appear
                        here for you to rate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50 p-8 text-center">
                        <h3 className="text-xl font-semibold">All Caught Up!</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            You have no pending ratings.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Helper function to get title/name from different media types
    const getMediaTitle = (details: MediaDetails) => {
        if (!details) return 'Untitled';
        return 'title' in details ? details.title : details.name;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Turn!</CardTitle>
                <CardDescription>
                    You have {pendingRatings.length} item(s) to rate in your shared
                    spaces.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {pendingRatings.map(({ log_entry, mediaDetails }) => (
                        <li
                            key={log_entry.id}
                            className="flex items-center justify-between gap-4 rounded-lg border p-3"
                        >
                            <div className="flex items-center gap-4">
                                <Image
                                    src={buildPosterUrl(mediaDetails?.poster_path ?? null)}
                                    alt={getMediaTitle(mediaDetails)}
                                    width={40}
                                    height={60}
                                    className="rounded-md object-cover"
                                />
                                <div>
                                    <p className="font-semibold">{getMediaTitle(mediaDetails)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        In space: {log_entry.space.name}
                                    </p>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href={`/log/complete/${log_entry.id}`}>Rate Now</Link>
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}