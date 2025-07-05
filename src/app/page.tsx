import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getMovieDetails } from '@/lib/tmdb/tmdb-client';
import { LogEntryCard, LogEntryCardProps } from '@/components/features/log/LogEntryCard';
import Link from 'next/link';

type DisplayLogEntry = LogEntryCardProps;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const userLogs = await prisma.logEntry.findMany({
    where: {
      space: {
        owner_id: user.id,
        type: 'PERSONAL',
      },
    },
    include: {
      ratings: {
        where: { user_id: user.id },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const tmdbDetailsPromises = userLogs
    .filter(log => log.tmdb_type === 'movie')
    .map(log => getMovieDetails(Number(log.tmdb_id)));

  const tmdbDetails = await Promise.all(tmdbDetailsPromises);

  const displayEntries: DisplayLogEntry[] = userLogs
    .map(log => {
      const tmdbDetail = tmdbDetails.find(d => d.id === Number(log.tmdb_id));
      const userRating = log.ratings[0];

      if (!tmdbDetail || !userRating) {
        return null;
      }

      return {
        tmdbId: log.tmdb_id,
        title: tmdbDetail.title,
        posterPath: tmdbDetail.poster_path,
        releaseYear: new Date(tmdbDetail.release_date).getFullYear().toString(),
        userRating: userRating.value,
      };
    })
    .filter((entry): entry is DisplayLogEntry => entry !== null);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Your Library</h1>
          <p className="text-muted-foreground">
            All the movies and shows you&apos;ve logged.
          </p>
        </div>
        <Link href="/log/new">
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            + Log New Entry
          </button>
        </Link>
      </header>

      {displayEntries.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {displayEntries.map(entry => (
            <LogEntryCard key={entry.tmdbId} {...entry} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
          <p className="text-lg font-semibold">Your library is empty.</p>
          <p className="text-muted-foreground">
            Log your first entry to see it here.
          </p>
        </div>
      )}
    </div>
  );
}