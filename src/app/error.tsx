'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-2xl font-bold">Oops, something went wrong!</h2>
            <p className="max-w-md text-muted-foreground">
                An unexpected error occurred. You can try to reload the page or go back to the dashboard.
            </p>
            <Button
                onClick={
                    () => reset()
                }
            >
                Try again
            </Button>
        </div>
    );
}