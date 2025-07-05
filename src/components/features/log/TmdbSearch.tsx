'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import Image from 'next/image';

import { searchTmdb, UnifiedSearchResult } from '@/actions/tmdb-actions';
import { Input } from '@/components/ui/input';
import { buildPosterUrl } from '@/lib/tmdb/tmdb-utils';
import { LogEntryFormValues } from '@/lib/schemas/log-schema';
import { LoaderCircle, Search, XCircle } from 'lucide-react';

export function TmdbSearch() {
    const { setValue, watch, resetField } = useFormContext<LogEntryFormValues>();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UnifiedSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<UnifiedSearchResult | null>(null);

    const selectedTmdbId = watch('tmdbId');

    useEffect(() => {
        if (selectedTmdbId || query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(() => {
            searchTmdb(query).then((res) => {
                setResults(res);
                setIsLoading(false);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query, selectedTmdbId]);

    const handleSelect = (item: UnifiedSearchResult) => {
        setValue('tmdbId', item.id.toString(), { shouldValidate: true });
        setValue('tmdbType', item.type, { shouldValidate: true });

        setSelectedItem(item);
        setResults([]);
        setQuery('');
    };

    const handleClear = () => {
        resetField('tmdbId');
        resetField('tmdbType');
        setSelectedItem(null);
    };

    if (selectedItem) {
        return (
            <div className="relative flex items-center space-x-4 rounded-lg border bg-muted p-4">
                <Image
                    src={buildPosterUrl(selectedItem.poster_path, 'w92')}
                    alt={selectedItem.title}
                    width={48}
                    height={72}
                    className="rounded-md"
                />
                <div className="flex-grow">
                    <p className="font-bold">{selectedItem.title}</p>
                    <p className="text-sm text-muted-foreground">{selectedItem.release_year} · <span className="uppercase">{selectedItem.type}</span></p>
                </div>
                <button type="button" onClick={handleClear} className="text-muted-foreground transition-colors hover:text-foreground">
                    <XCircle className="h-6 w-6" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for a movie or TV show..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                />
                {isLoading && <LoaderCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
            </div>

            {results.length > 0 && (
                <div className="absolute top-full z-10 mt-2 w-full max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg">
                    <ul>
                        {results.map((item) => (
                            <li key={`${item.type}-${item.id}`}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    className="flex w-full items-center space-x-4 p-3 text-left transition-colors hover:bg-accent"
                                >
                                    <Image
                                        src={buildPosterUrl(item.poster_path, 'w92')}
                                        alt={item.title}
                                        width={40}
                                        height={60}
                                        className="rounded"
                                    />
                                    <div>
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.release_year} · <span className="uppercase">{item.type}</span></p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}