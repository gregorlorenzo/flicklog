'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const onboardingSelectionSchema = z.object({
    item: z.object({
        id: z.number(),
        type: z.enum(['movie', 'tv']),
    }),
    rating: z.number().min(0).max(5),
});

const completeOnboardingSchema = z.object({
    loved: onboardingSelectionSchema,
    okay: onboardingSelectionSchema,
    disliked: onboardingSelectionSchema,
});

export type OnboardingData = z.infer<typeof completeOnboardingSchema>;

/**
 * Processes the user's three onboarding selections. In a single transaction,
 * it creates the log entries and ratings in the user's personal space,
 * then marks their profile as having completed onboarding.
 *
 * @param data The user's selections for "loved", "okay", and "disliked".
 * @returns ActionResult indicating success or failure. Redirects on success.
 */
export async function completeOnboarding(
    data: OnboardingData
): Promise<ActionResult<true>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Authentication required.' };
    }

    const validatedFields = completeOnboardingSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { loved, okay, disliked } = validatedFields.data;
    const selections = [loved, okay, disliked];

    try {
        const personalSpace = await prisma.space.findFirst({
            where: {
                owner_id: user.id,
                type: 'PERSONAL',
            },
        });

        if (!personalSpace) {
            return { success: false, error: 'Personal space not found for user.' };
        }

        await prisma.$transaction(async (tx) => {
            for (const selection of selections) {
                const logEntry = await tx.logEntry.create({
                    data: {
                        space_id: personalSpace.id,
                        tmdb_id: selection.item.id.toString(),
                        tmdb_type: selection.item.type,
                    },
                });

                await tx.rating.create({
                    data: {
                        log_entry_id: logEntry.id,
                        user_id: user.id,
                        value: selection.rating,
                        watched_on: new Date(),
                    },
                });
            }

            await tx.profile.update({
                where: { user_id: user.id },
                data: { has_completed_onboarding: true },
            });
        });
    } catch (error) {
        console.error('Onboarding Database Error:', error);
        return {
            success: false,
            error: 'Failed to save onboarding selections due to a database error.',
        };
    }

    revalidatePath('/');
    redirect('/');
}