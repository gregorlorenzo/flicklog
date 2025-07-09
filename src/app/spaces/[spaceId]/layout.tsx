import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { SpaceSwitcher } from '@/components/shared/space-switcher';
import { buttonVariants } from '@/components/ui/button';

/**
 * Layout for a specific space.
 * It fetches space data, verifies membership, and renders a shared header
 * with a space switcher and other actions.
 */
export default async function SpaceLayout({
    children,
    params,
}: PropsWithChildren<{ params: Promise<{ spaceId: string }> }>) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return notFound();
    }

    const { spaceId } = await params;

    const space = await prisma.space.findFirst({
        where: {
            id: spaceId,
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

    return (
        <div>
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    <SpaceSwitcher currentSpaceId={spaceId} />

                    <Link
                        href={`/spaces/${spaceId}/log/new`}
                        className={buttonVariants({ variant: 'default' })}
                    >
                        + Log New Entry
                    </Link>

                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}