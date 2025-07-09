'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { RealtimeChannel, Session, SupabaseClient } from '@supabase/supabase-js';

import { useSupabase } from '@/components/providers/supabase-provider';

type PendingRatingPayload = {
    payload: {
        record: {
            log_entry_id: string;
            user_id: string;
        };
        schema: string;
        table: string;
        commit_timestamp: string;
        type: 'INSERT' | 'UPDATE' | 'DELETE';
        old_record: any;
    };
    event: string;
    type: 'broadcast';
};

const setupRealtimeChannel = async (supabase: SupabaseClient, session: Session) => {
    await supabase.realtime.setAuth(session.access_token);
    const userId = session.user.id;
    const channelName = `user-notifications:${userId}`;
    const channel = supabase.channel(channelName, {
        config: { private: true },
    });
    return channel;
};

export function RealtimeNotificationProvider() {
    const router = useRouter();
    const supabase = useSupabase();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const getInitialSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };
        getInitialSession();
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, currentSession) => {
                setSession(currentSession);
            }
        );
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    useEffect(() => {
        if (!session) return;

        let channel: RealtimeChannel | undefined;

        const initAndSubscribe = async () => {
            channel = await setupRealtimeChannel(supabase, session);

            channel
                .on(
                    'broadcast',
                    { event: 'new_pending_rating' },
                    (message: PendingRatingPayload) => {
                        console.log('Broadcast notification received!', message);
                        toast.info(`Your Turn! You have a new item to rate.`);
                        router.refresh();
                    }
                )
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') {
                        console.log(`Realtime SUBSCRIBED to channel: ${channel?.topic}`);
                    }
                    if (err) {
                        console.error(`Realtime channel error for ${channel?.topic}:`, err.message);
                    }
                });
        };

        initAndSubscribe();

        return () => {
            if (channel) {
                supabase.removeChannel(channel).then(() => {
                    console.log(`Realtime unsubscribed from user channel.`);
                });
            }
        };
    }, [session, supabase, router]);

    return null;
}