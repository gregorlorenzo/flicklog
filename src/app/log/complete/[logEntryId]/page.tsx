import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';
import { getTmdbMediaDetails } from '@/lib/tmdb/tmdb-client';
import { CompleteRatingForm } from '@/components/features/log/complete-rating-form';

interface PageProps {
    params: Promise<{ logEntryId: string }>;
}

export default async function CompleteRatingPage({
    params,
}: PageProps) {
    const { logEntryId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return notFound();
    }

    const pendingRating = await prisma.pendingRating.findUnique({
        where: {
            log_entry_id_user_id: {
                log_entry_id: logEntryId,
                user_id: user.id,
            },
            log_entry: {
                ratings: {
                    none: {
                        user_id: user.id,
                    },
                },
            },
        },
        include: {
            log_entry: true,
        },
    });

    if (!pendingRating) {
        return notFound();
    }

    const { log_entry } = pendingRating;

    const mediaDetails = await getTmdbMediaDetails(
        log_entry.tmdb_id,
        log_entry.tmdb_type as 'movie' | 'tv'
    );

    if (!mediaDetails) {
        return <div>Error loading media details. Please try again later.</div>;
    }

    const mediaTitle = 'title' in mediaDetails ? mediaDetails.title : mediaDetails.name;
    const mediaOverview = mediaDetails.overview;
    const posterUrl = buildPosterUrl(mediaDetails.poster_path);

    return (
        <div className="container grid max-w-5xl grid-cols-1 gap-8 py-8 md:grid-cols-3">
            <div className="md:col-span-1">
                <div className="sticky top-24 space-y-4">
                    <Image
                        src={posterUrl}
                        alt={mediaTitle}
                        width={500}
                        height={750}
                        className="rounded-lg"
                    />
                    <h1 className="font-heading text-2xl font-bold">{mediaTitle}</h1>
                    <p className="text-sm text-muted-foreground">{mediaOverview}</p>
                </div>
            </div>
            <div className="md:col-span-2">
                <h2 className="font-heading text-3xl font-semibold">Your Turn!</h2>
                <p className="mt-1 text-lg text-muted-foreground">
                    Add your rating for &quot;{mediaTitle}&quot;.
                </p>
                <div className="mt-8">
                    <CompleteRatingForm logEntryId={log_entry.id} />
                </div>
            </div>
        </div>
    );
}