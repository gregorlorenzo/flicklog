'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import {
    profileSchema,
    type ProfileFormValues,
} from '@/lib/schemas/profile-schema';
import type { ActionResult } from '@/lib/types';
import type { Profile } from '@prisma/client';

/**
 * Updates a user's profile information.
 * ...
 */
export async function updateProfile(
    data: ProfileFormValues
): Promise<ActionResult<Profile>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Authentication required.' };
    }

    const validationResult = profileSchema.safeParse(data);
    if (!validationResult.success) {
        return {
            success: false,
            error: 'Invalid input provided.',
            fieldErrors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { username, display_name, avatar_url } = validationResult.data;

    try {
        const existingProfile = await prisma.profile.findFirst({
            where: {
                username: {
                    equals: username.toLowerCase(),
                    mode: 'insensitive',
                },
                NOT: {
                    user_id: user.id,
                },
            },
        });

        if (existingProfile) {
            return {
                success: false,
                error: 'Please correct the error below.',
                fieldErrors: { username: ['This username is already taken.'] },
            };
        }

        const updatedProfile = await prisma.profile.update({
            where: {
                user_id: user.id,
            },
            data: {
                username: username.toLowerCase(),
                display_name: display_name || null,
                avatar_url: avatar_url || null,
            },
        });

        revalidatePath('/account/profile');
        return { success: true, data: updatedProfile };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}