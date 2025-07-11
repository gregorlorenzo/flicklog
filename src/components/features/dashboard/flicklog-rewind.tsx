import { RewindEntry } from '@/lib/data/stats-data';
import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface FlicklogRewindProps {
    entries: RewindEntry[];
}

export function FlicklogRewind({ entries }: FlicklogRewindProps) {
    if (entries.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-2xl font-semibold">Flicklog Rewind</h2>
            <p className="mb-6 text-muted-foreground">On this day in your Flicklog history...</p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                    <div key={entry.logEntryId} className="flex items-center space-x-4">
                        <Image
                            src={buildPosterUrl(entry.posterPath, 'w185')}
                            alt={entry.title}
                            width={80}
                            height={120}
                            className="rounded-md object-cover"
                        />
                        <div className="flex-grow">
                            <p className="font-bold">{entry.title}</p>
                            <p className="text-sm text-muted-foreground">
                                You watched this on{' '}
                                <span className="font-medium text-foreground">
                                    {format(new Date(entry.watchedOn), 'MMMM d, yyyy')}
                                </span>
                            </p>
                            <p className="mt-1 flex items-center font-semibold">
                                <Star className="mr-1 h-4 w-4 text-primary" fill="currentColor" />
                                {entry.rating.toFixed(1)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}