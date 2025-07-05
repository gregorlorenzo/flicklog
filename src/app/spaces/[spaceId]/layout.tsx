import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import type { PropsWithChildren } from 'react';

/**
 * Layout for a specific space.
 * It fetches space data and verifies if the current user is a member.
 * If not, it returns a 404 Not Found page.
 */
export default async function SpaceLayout({
    children,
    params,
}: PropsWithChildren<{ params: { spaceId: string } }>) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return notFound();
    }

    const space = await prisma.space.findFirst({
        where: {
            id: params.spaceId,
            members: {
                some: {
                    user_id: user.id,
                },
            },
        },
    });

    if (!space) {
        return notFound();
    }

    return <>{children}</>;
}