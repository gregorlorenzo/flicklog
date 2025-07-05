'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import {
    logEntrySchema,
    type LogEntryFormValues,
    completeRatingSchema,
    type CompleteRatingFormValues,
} from '@/lib/schemas/log-schema';
import type { ActionResult } from '@/lib/types';

/**
 * Creates a new log entry in a given space.
 * If the space is SHARED, it also creates PendingRating records
 * for all other members of the space. This is a transactional action.
 *
 * @param spaceId The ID of the space to log the entry in.
 * @param values The validated form values for the log entry.
 * @returns ActionResult indicating success or failure. On success, it redirects.
 */
export async function createLogEntry(
    spaceId: string,
    values: LogEntryFormValues
): Promise<ActionResult<true>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Authentication required.' };
    }

    const validatedFields = logEntrySchema.safeParse(values);
    if (!validatedFields.success) {
        return {
            success: false,
            error: 'Invalid form data provided.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    const { tmdbId, tmdbType, rating, watchedOn, quickTake, deeperThoughts } =
        validatedFields.data;

    try {
        const spaceWithMembers = await prisma.space.findFirst({
            where: {
                id: spaceId,
                members: {
                    some: {
                        user_id: user.id,
                    },
                },
            },
            include: {
                members: true,
            },
        });

        if (!spaceWithMembers) {
            return {
                success: false,
                error: 'Permission denied or space not found.',
            };
        }

        await prisma.$transaction(async (tx) => {
            const logEntry = await tx.logEntry.upsert({
                where: {
                    space_id_tmdb_id_tmdb_type: {
                        space_id: spaceId,
                        tmdb_id: tmdbId,
                        tmdb_type: tmdbType,
                    },
                },
                update: {},
                create: {
                    space_id: spaceId,
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

            if (spaceWithMembers.type === 'SHARED') {
                const otherMembers = spaceWithMembers.members.filter(
                    (member) => member.user_id !== user.id
                );

                if (otherMembers.length > 0) {
                    await tx.pendingRating.createMany({
                        data: otherMembers.map((member) => ({
                            log_entry_id: logEntry.id,
                            user_id: member.user_id,
                        })),
                        skipDuplicates: true,
                    });
                }
            }
        });
    } catch (error) {
        console.error('Database Error:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma Error Code:', error.code);
        }
        return {
            success: false,
            error: 'Failed to create log entry due to a database error.',
        };
    }

    revalidatePath(`/spaces/${spaceId}`);
    redirect(`/spaces/${spaceId}`);
}

/**
 * Submits a rating for a pending entry.
 * This action is transactional: it creates the Rating and Comments,
 * then deletes the corresponding PendingRating record.
 *
 * @param logEntryId The ID of the log entry being rated.
 * @param values The validated form values for the rating.
 * @returns ActionResult indicating success or failure. On success, it redirects.
 */
export async function submitPendingRating(
    logEntryId: string,
    values: CompleteRatingFormValues
): Promise<ActionResult<true>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Authentication required.' };
    }

    const validatedFields = completeRatingSchema.safeParse(values);
    if (!validatedFields.success) {
        return {
            success: false,
            error: 'Invalid form data provided.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }
    const { rating, watchedOn, quickTake, deeperThoughts } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const pendingRating = await tx.pendingRating.findUnique({
                where: {
                    log_entry_id_user_id: {
                        log_entry_id: logEntryId,
                        user_id: user.id,
                    },
                },
                include: {
                    log_entry: true,
                }
            });

            if (!pendingRating) {
                throw new Error('No pending rating found for this user and entry. You may have already submitted your rating.');
            }

            const ratingRecord = await tx.rating.create({
                data: {
                    log_entry_id: logEntryId,
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

            await tx.pendingRating.delete({
                where: {
                    log_entry_id_user_id: {
                        log_entry_id: logEntryId,
                        user_id: user.id,
                    },
                },
            });

            return pendingRating.log_entry.space_id;
        }).then(spaceId => {
            revalidatePath(`/spaces/${spaceId}`);
            redirect(`/spaces/${spaceId}`);
        });

    } catch (error: any) {
        console.error('Failed to submit pending rating:', error);
        return { success: false, error: error.message || 'An unexpected database error occurred.' };
    }

    return { success: true, data: true };
}