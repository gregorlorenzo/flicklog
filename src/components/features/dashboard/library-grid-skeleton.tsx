import { LogEntryCardSkeleton } from "../log/LogEntryCardSkeleton";

export function LibraryGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <LogEntryCardSkeleton key={i} />
            ))}
        </div>
    );
}