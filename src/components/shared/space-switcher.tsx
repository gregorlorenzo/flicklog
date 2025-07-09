import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { SpaceSwitcherClient } from './space-switcher-client';

/**
 * A server component that fetches the user's spaces and renders
 * a client component to handle the switching logic.
 *
 * @param props - The component props.
 * @param props.currentSpaceId - The ID of the currently viewed space, to show it as selected.
 */
export async function SpaceSwitcher({
    currentSpaceId,
}: {
    currentSpaceId: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const spaces = await prisma.space.findMany({
        where: {
            members: {
                some: {
                    user_id: user.id,
                },
            },
        },
        orderBy: [
            { type: 'asc' },
            { name: 'asc' }
        ]
    });

    const currentSpace = spaces.find(s => s.id === currentSpaceId);

    if (!currentSpace) {
        return notFound();
    }

    return (
        <SpaceSwitcherClient
            currentSpace={currentSpace}
            spaces={spaces}
        />
    );
}