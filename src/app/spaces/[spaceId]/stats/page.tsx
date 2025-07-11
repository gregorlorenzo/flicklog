import { getStatsDataForSpace } from '@/lib/data/stats-data';
import { calculateCriticStats, calculateAgreementStats } from '@/lib/data/stats-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';

interface StatsPageProps {
    params: {
        spaceId: string;
    };
}

export default async function StatsPage({ params }: StatsPageProps) {
    const data = await getStatsDataForSpace(params.spaceId);

    if (!data || data.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold">Statistics</h1>
                <div className="mt-6 rounded-lg border bg-card p-8 text-center text-muted-foreground">
                    <p>Not enough data to generate stats yet.</p>
                    <p>Log some more entries to see your stats here!</p>
                </div>
            </div>
        );
    }

    const { greatDivide, perfectHarmony } = await calculateAgreementStats(data);
    const { toughestCritic, mostGenerous } = calculateCriticStats(data);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Statistics</h1>

            {/* Critic's Corner Section */}
            <div>
                <h2 className="mb-4 text-2xl font-semibold">Critic's Corner</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Most Generous</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {mostGenerous ? (
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={mostGenerous.avatarUrl ?? ''} />
                                        <AvatarFallback>{mostGenerous.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{mostGenerous.displayName}</p>
                                        <p className="flex items-center text-sm text-muted-foreground">
                                            Avg. Rating: {mostGenerous.averageRating.toFixed(2)}
                                            <Star className="ml-1 h-4 w-4 text-primary" fill="currentColor" />
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No data available.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Toughest Critic</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {toughestCritic ? (
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={toughestCritic.avatarUrl ?? ''} />
                                        <AvatarFallback>{toughestCritic.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{toughestCritic.displayName}</p>
                                        <p className="flex items-center text-sm text-muted-foreground">
                                            Avg. Rating: {toughestCritic.averageRating.toFixed(2)}
                                            <Star className="ml-1 h-4 w-4 text-primary" fill="currentColor" />
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No data available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- The Great Divide --- */}
            <div>
                <h2 className="mb-4 text-2xl font-semibold">The Great Divide</h2>
                {greatDivide.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {greatDivide.slice(0, 4).map(film => (
                            <div key={film.logEntryId} className="space-y-2">
                                <Image
                                    src={buildPosterUrl(film.posterPath)}
                                    alt={film.title}
                                    width={342}
                                    height={513}
                                    className="rounded-lg object-cover"
                                />
                                <div className="text-center">
                                    {film.ratings.map((r, i) => (
                                        <span key={i} className="mr-2 text-sm">
                                            {r.user.displayName?.split(' ')[0]}: <strong>{r.value}★</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Not enough rating variety to find divisive films. Invite some friends and log more movies!</p>
                )}
            </div>

            {/* --- Perfect Harmony --- */}
            <div>
                <h2 className="mb-4 text-2xl font-semibold">Perfect Harmony</h2>
                {perfectHarmony.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {perfectHarmony.slice(0, 4).map(film => (
                            <div key={film.logEntryId} className="space-y-2">
                                <Image
                                    src={buildPosterUrl(film.posterPath)}
                                    alt={film.title}
                                    width={342}
                                    height={513}
                                    className="rounded-lg object-cover"
                                />
                                <div className="text-center">
                                    <span className="text-sm">
                                        Everyone rated: <strong>{film.averageRating}★</strong>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No films that everyone rated the same have been found yet.</p>
                )}
            </div>
        </div>
    );
}