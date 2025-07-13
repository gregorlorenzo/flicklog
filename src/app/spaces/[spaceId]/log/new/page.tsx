import { LogForm } from '@/components/features/log/LogForm';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';

export default async function NewLogInSpacePage({
    params,
}: {
    params: Promise<{ spaceId: string }>;
}) {
    const { spaceId } = await params;

    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
        return notFound();
    }

    const breadcrumbs = [
        { href: `/spaces/${space.id}`, label: space.name },
        { href: `/spaces/${space.id}/log/new`, label: 'Log New Entry' },
    ];

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <PageHeader
                title="Log a New Entry"
                description="Find a movie or TV show and record your thoughts."
                breadcrumbs={breadcrumbs}
            />
            <LogForm spaceId={spaceId} />
        </div>
    );
}