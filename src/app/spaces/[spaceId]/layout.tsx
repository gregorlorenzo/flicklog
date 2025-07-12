import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import type { PropsWithChildren } from 'react';
import Link from 'next/link';
import { SpaceSwitcher } from '@/components/shared/space-switcher';
import { buttonVariants } from '@/components/ui/button';
import { LayoutGrid, Settings } from 'lucide-react';
import { UserNav } from '@/components/shared/user-nav';
import { Separator } from '@/components/ui/separator';
import { ThemeToggleSwitch } from '@/components/shared/theme-toggle-switch';

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

    const userProfilePromise = prisma.profile.findUnique({
        where: { user_id: user.id },
    });

    const { spaceId } = await params;

    const spacePromise = prisma.space.findFirst({
        where: {
            id: spaceId,
            members: {
                some: {
                    user_id: user.id,
                },
            },
        },
    });

    const [userProfile, space] = await Promise.all([userProfilePromise, spacePromise]);

    if (!space) {
        return notFound();
    }

    return (
        <div>
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
                <div className="container flex h-16 items-center">
                    <div className="flex items-center space-x-4">
                        <SpaceSwitcher currentSpaceId={spaceId} />
                        {/* Group navigation links together */}
                        <nav className="hidden md:flex items-center space-x-2">
                            <Link
                                href={`/spaces/${spaceId}/stats`}
                                className={buttonVariants({ variant: 'ghost' })}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Stats
                            </Link>
                            <Link
                                href={`/spaces/${spaceId}/settings`}
                                className={buttonVariants({ variant: 'ghost' })}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </nav>
                    </div>

                    <div className="ml-auto flex items-center space-x-4">
                        <Link
                            href={`/spaces/${spaceId}/log/new`}
                            className={buttonVariants({ variant: 'default' })}
                        >
                            + Log New
                        </Link>
                        <ThemeToggleSwitch />
                        <Separator orientation="vertical" className="h-8" />
                        <UserNav
                            email={user.email}
                            avatarUrl={userProfile?.avatar_url}
                            displayName={userProfile?.display_name}
                        />
                    </div>
                </div>
            </header>
            <main className="container py-8">{children}</main>
        </div>
    );
}