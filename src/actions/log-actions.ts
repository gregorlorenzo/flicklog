'use server';

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logEntrySchema, LogEntryFormValues } from '@/lib/schemas/log-schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface ActionResult {
    success: boolean;
    message: string;
}

export async function createLogEntry(
    values: LogEntryFormValues
): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Authentication required.' };
    }

    const validatedFields = logEntrySchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            success: false,
            message: `Invalid form data: ${validatedFields.error.flatten().formErrors.join(', ')}`,
        };
    }
    const { tmdbId, tmdbType, rating, watchedOn, quickTake, deeperThoughts } = validatedFields.data;

    try {
        const personalSpace = await prisma.space.findFirst({
            where: {
                owner_id: user.id,
                type: 'PERSONAL',
            },
        });

        if (!personalSpace) {
            return { success: false, message: 'Could not find a personal space for this user.' };
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const logEntry = await tx.logEntry.upsert({
                where: {
                    space_id_tmdb_id_tmdb_type: {
                        space_id: personalSpace.id,
                        tmdb_id: tmdbId,
                        tmdb_type: tmdbType,
                    }
                },
                update: {},
                create: {
                    space_id: personalSpace.id,
                    tmdb_id: tmdbId,
                    tmdb_type: tmdbType,
                },
            });

            const ratingRecord = await tx.rating.create({
                data: {
                    log_entry_id: logEntry.id,
                    user_id: user.id,
                    value: rating,
                    watched_on: watchedOn,
                },
            });

            if (quickTake) {
                await tx.comment.create({
                    data: {
                        rating_id: ratingRecord.id,
                        user_id: user.id,
                        type: 'QUICK_TAKE',
                        content: quickTake,
                    },
                });
            }
            if (deeperThoughts) {
                await tx.comment.create({
                    data: {
                        rating_id: ratingRecord.id,
                        user_id: user.id,
                        type: 'DEEPER_THOUGHTS',
                        content: deeperThoughts,
                    },
                });
            }
        });
    } catch (error) {
        console.error('Database Error:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma Error Code:', error.code);
        }
        return { success: false, message: 'Failed to create log entry in the database.' };
    }

    revalidatePath('/');
    redirect('/');
}