import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/features/account/edit-profile-form';
import { prisma } from '@/lib/db';
import type { Profile } from '@prisma/client';
import { PageHeader } from '@/components/shared/page-header';

interface PageProps {
    searchParams: Promise<{ from?: string }> | { from?: string };
}

export default async function AccountProfilePage({
    searchParams,
}: PageProps) {
    const resolvedSearchParams = await Promise.resolve(searchParams);
    
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }
    
    const profile: Profile | null = await prisma.profile.findUnique({
        where: { user_id: user.id },
    });
    
    if (!profile) {
        return <div>Error: Profile not found. Please contact support.</div>;
    }
    
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
    
    breadcrumbs.push({ href: '/account/profile', label: 'My Account' });
    
    return (
        <div className="container mx-auto max-w-2xl py-8">
            <PageHeader
                title="Account Settings"
                description="Manage your public profile details."
                breadcrumbs={breadcrumbs}
            />
            <main>
                <EditProfileForm profile={profile} />
            </main>
        </div>
    );
}