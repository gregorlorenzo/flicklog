import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getFlicklogRewind } from '@/lib/data/stats-data';
import { FlicklogRewind } from '@/components/features/dashboard/flicklog-rewind';
import { LibraryGrid } from '@/components/features/dashboard/library-grid';
import { LibraryGridSkeleton } from '@/components/features/dashboard/library-grid-skeleton';


export default async function SpacePage({
    params,
}: {
    params: Promise<{ spaceId: string }>;
}) {
    const { spaceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
        return notFound();
    }

    const rewindEntries = user && space.type === 'PERSONAL'
        ? await getFlicklogRewind(user.id)
        : [];

    return (
        <div>
            <header className="mb-8">
                <h1 className="font-heading text-4xl font-bold">{space.name}</h1>
                <p className="text-lg text-muted-foreground">
                    A shared library of your collective viewing experiences.
                </p>
            </header>

            <FlicklogRewind entries={rewindEntries} />

            <Suspense fallback={<LibraryGridSkeleton />}>
                <LibraryGrid spaceId={spaceId} />
            </Suspense>
        </div>
    );
}