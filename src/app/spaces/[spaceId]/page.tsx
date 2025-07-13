import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getFlicklogRewind } from '@/lib/data/stats-data';
import { FlicklogRewind } from '@/components/features/dashboard/flicklog-rewind';
import { LibraryGrid } from '@/components/features/dashboard/library-grid';
import { LibraryGridSkeleton } from '@/components/features/dashboard/library-grid-skeleton';
import { PageHeader } from '@/components/shared/page-header';


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

    const breadcrumbs = [
        { href: `/spaces/${space.id}`, label: space.name },
    ];

    return (
        <div>
            <PageHeader
                title={space.name}
                description={space.type === 'PERSONAL'
                    ? 'Your personal viewing history.'
                    : 'A shared library of your collective viewing experiences.'
                }
                breadcrumbs={breadcrumbs}
            />

            <FlicklogRewind entries={rewindEntries} />

            <Suspense fallback={<LibraryGridSkeleton />}>
                <LibraryGrid spaceId={spaceId} />
            </Suspense>
        </div>
    );
}