import { LogForm } from '@/components/features/log/LogForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function NewLogPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const personalSpace = await prisma.space.findFirst({
        where: {
            owner_id: user.id,
            type: 'PERSONAL',
        },
        select: {
            id: true,
        },
    });

    if (!personalSpace) {
        console.error(`Could not find a personal space for user: ${user.id}`);
        redirect('/');
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Log a New Entry</h1>
                <p className="text-muted-foreground">
                    Find a movie or TV show and record your thoughts.
                </p>
            </header>

            <LogForm spaceId={personalSpace.id} />
        </div>
    );
}