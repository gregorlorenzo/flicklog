'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SpaceError({
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
        <div className="container py-12">
            <div className="flex flex-col items-center justify-center space-y-4 text-center rounded-lg border-2 border-dashed border-destructive bg-destructive/10 p-12">
                <h2 className="text-2xl font-bold text-destructive">Oops! This space hit a snag.</h2>
                <p className="max-w-md text-muted-foreground">
                    We couldn&apos;t load this space right now. Please try again or return to the main dashboard.
                </p>
                <div className='flex gap-4'>
                    <Button
                        onClick={() => reset()}
                        variant="destructive"
                    >
                        Try again
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}