'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

import { useRealtimeSubscription } from '@/hooks/use-realtime-subscription';
import type { PendingRating } from '@prisma/client';

/**
 * A provider component that sets up a real-time subscription
 * for pending rating notifications and displays them as toasts.
 * It only activates when a user is logged in.
 */
export function RealtimeNotificationProvider() {
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };

        getUser();
    }, [pathname]);

    const handleNewPendingRating = (payload: PendingRating) => {
        console.log('New pending rating received:', payload);

        toast.info("Your Turn! You have a new item to rate.", {
            description: "A new movie or show was logged in one of your shared spaces.",
            action: {
                label: "View",
                onClick: () => {
                    console.log("View action clicked");
                }
            }
        });
    };

    useRealtimeSubscription<PendingRating>(
        'PendingRating',
        `user_id=eq.${user?.id}`,
        handleNewPendingRating
    );

    return null;
}