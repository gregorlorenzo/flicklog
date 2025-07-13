import { LibraryGridSkeleton } from '@/components/features/dashboard/library-grid-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function SpaceLoading() {
    return (
        <div>
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    {/* Left side skeleton */}
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-9 w-[200px]" />
                        <Skeleton className="hidden h-9 w-24 md:block" />
                        <Skeleton className="hidden h-9 w-24 md:block" />
                    </div>
                    {/* Right side skeleton */}
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-8 w-px" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="container py-8">
                {/* PageHeader skeleton */}
                <div className="mb-8 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                </div>

                {/* The existing skeleton for the library grid */}
                <LibraryGridSkeleton />
            </main>
        </div>
    );
}