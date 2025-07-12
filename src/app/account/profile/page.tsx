import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditProfileForm } from '@/components/features/account/edit-profile-form';
import { prisma } from '@/lib/db';
import type { Profile } from '@prisma/client';

export default async function AccountProfilePage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile: Profile | null = await prisma.profile.findUnique({
        where: {
            user_id: user.id,
        },
    });

    if (!profile) {
        return <div>Error: Profile not found. Please contact support.</div>;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Account Settings</h1>
                <p className="text-muted-foreground">Manage your public profile details.</p>
            </header>
            <main>
                <EditProfileForm profile={profile} />
            </main>
        </div>
    );
}