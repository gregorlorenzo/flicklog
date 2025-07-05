'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeCallback<T> = (payload: T) => void;

/**
 * A generic React hook for subscribing to Supabase Realtime changes on a specific table.
 *
 * @param tableName The name of the table to subscribe to.
 * @param filter The RLS filter to apply (e.g., `user_id=eq.${userId}`).
 * @param onInsert A callback function to run when a new row is inserted.
 */
export function useRealtimeSubscription<T extends { [key: string]: any }>(
    tableName: string,
    filter: string,
    onInsert: RealtimeCallback<T>
) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        let channel: RealtimeChannel;

        const setupSubscription = () => {
            channel = supabase
                .channel(`public:${tableName}:${filter}`)
                .on<T>(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: tableName, filter },
                    (payload) => {
                        onInsert(payload.new);
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [tableName, filter, onInsert, supabase]);
}