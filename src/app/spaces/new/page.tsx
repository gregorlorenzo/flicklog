import { CreateSpaceForm } from '@/components/features/space/create-space-form';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/shared/page-header';

/**
 * The page for creating a new Shared Space.
 * This is a server component that renders the CreateSpaceForm.
 * It now includes a dynamic breadcrumb to return to the previous space.
 */
export default async function NewSpacePage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string }>;
}) {
    const resolvedSearchParams = await searchParams;

    const breadcrumbs = [];
    if (resolvedSearchParams.from) {
        const spaceId = resolvedSearchParams.from.split('/spaces/')[1];
        if (spaceId) {
            const fromSpace = await prisma.space.findUnique({
                where: { id: spaceId },
                select: { name: true },
            });
            if (fromSpace) {
                breadcrumbs.push({ href: resolvedSearchParams.from, label: fromSpace.name });
            }
        }
    }

    breadcrumbs.push({ href: '/spaces/new', label: 'Create New Space' });

    return (
        <div className="container py-8">
            <PageHeader
                title="Create a New Shared Space"
                description="A Shared Space is a collaborative library where you and your friends can log movies together. Give it a name to get started."
                breadcrumbs={breadcrumbs}
            />
            <div className="mt-8 max-w-md">
                <CreateSpaceForm />
            </div>
        </div>
    );
}