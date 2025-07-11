export function LogEntryCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[2/3] w-full rounded-lg bg-muted"></div>
            <div className="mt-2 h-4 w-3/4 rounded bg-muted"></div>
            <div className="mt-1 h-3 w-1/2 rounded bg-muted"></div>
        </div>
    );
}