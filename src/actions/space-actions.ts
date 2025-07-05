'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import {
    createSpaceSchema,
    type CreateSpaceInput,
    inviteMemberSchema,
    type InviteMemberInput,
} from '@/lib/schemas/space-schemas';
import type { ActionResult } from '@/lib/types';
import type { Space } from '@prisma/client';

/**
 * Creates a new SHARED space and makes the creator an ADMIN.
 * This action is transactional.
 *
 * @param data - The validated space creation data.
 * @returns ActionResult with the created space or an error message.
 *
 * @throws Will return error if user is not authenticated.
 * @throws Will return fieldErrors for invalid input data.
 */
export async function createSpace(
    data: CreateSpaceInput
): Promise<ActionResult<Space>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Authentication required.' };
    }

    const validationResult = createSpaceSchema.safeParse(data);
    if (!validationResult.success) {
        return {
            success: false,
            error: 'Invalid input provided.',
            fieldErrors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { name } = validationResult.data;

    let newSpace: Space;
    try {
        newSpace = await prisma.$transaction(async (tx) => {
            const space = await tx.space.create({
                data: {
                    name,
                    type: 'SHARED',
                    owner_id: user.id,
                },
            });

            await tx.spaceMember.create({
                data: {
                    space_id: space.id,
                    user_id: user.id,
                    role: 'ADMIN',
                },
            });

            return space;
        });
    } catch (error) {
        console.error('Failed to create space:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }

    revalidatePath(`/spaces/${newSpace.id}`);
    revalidatePath('/spaces');

    redirect(`/spaces/${newSpace.id}`);
}

/**
 * Invites a user to a shared space by their username.
 *
 * @param spaceId - The ID of the space to invite the user to.
 * @param data - The invite form data, containing the username.
 * @returns ActionResult indicating success or failure.
 *
 * @throws Will return error if inviter is not authenticated or not an ADMIN.
 * @throws Will return error if invited user does not exist or is already a member.
 */
export async function inviteMember(
    spaceId: string,
    data: InviteMemberInput
): Promise<ActionResult<true>> {
    const supabase = await createClient();
    const {
        data: { user: inviter },
    } = await supabase.auth.getUser();

    if (!inviter) {
        return { success: false, error: 'Authentication required.' };
    }

    const validationResult = inviteMemberSchema.safeParse(data);
    if (!validationResult.success) {
        return {
            success: false,
            error: 'Invalid username provided.',
            fieldErrors: validationResult.error.flatten().fieldErrors,
        };
    }
    const { username } = validationResult.data;

    const inviterMembership = await prisma.spaceMember.findUnique({
        where: {
            user_id_space_id: {
                user_id: inviter.id,
                space_id: spaceId,
            },
        },
    });

    if (inviterMembership?.role !== 'ADMIN') {
        return { success: false, error: 'You must be an admin to invite members.' };
    }

    try {
        const inviteeProfile = await prisma.profile.findUnique({
            where: { username: username.toLowerCase() },
        });

        if (!inviteeProfile) {
            return { success: false, error: `User "@${username}" not found.` };
        }

        if (inviteeProfile.user_id === inviter.id) {
            return { success: false, error: 'You cannot invite yourself.' };
        }

        const existingMembership = await prisma.spaceMember.findFirst({
            where: {
                space_id: spaceId,
                user_id: inviteeProfile.user_id,
            },
        });

        if (existingMembership) {
            return {
                success: false,
                error: `User "@${username}" is already a member of this space.`,
            };
        }

        await prisma.spaceMember.create({
            data: {
                space_id: spaceId,
                user_id: inviteeProfile.user_id,
                role: 'MEMBER',
            },
        });

        revalidatePath(`/spaces/${spaceId}/settings`);

        return { success: true, data: true };
    } catch (error) {
        console.error('Failed to invite member:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}

/**
 * Removes a member from a shared space.
 *
 * @param spaceId - The ID of the space.
 * @param userIdToRemove - The ID of the user to be removed.
 * @returns ActionResult indicating success or failure.
 *
 * @throws Will return error if remover is not an ADMIN.
 * @throws Will return error on attempts to remove the owner, another admin, or self.
 */
export async function removeMember(
    spaceId: string,
    userIdToRemove: string
): Promise<ActionResult<true>> {
    const supabase = await createClient();
    const {
        data: { user: remover },
    } = await supabase.auth.getUser();

    if (!remover) {
        return { success: false, error: 'Authentication required.' };
    }

    if (remover.id === userIdToRemove) {
        return { success: false, error: 'You cannot remove yourself from a space.' };
    }

    try {
        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            include: {
                members: {
                    where: {
                        user_id: { in: [remover.id, userIdToRemove] },
                    },
                },
            },
        });

        if (!space) {
            return { success: false, error: 'Space not found.' };
        }

        const removerMembership = space.members.find(
            (m) => m.user_id === remover.id
        );
        if (removerMembership?.role !== 'ADMIN') {
            return { success: false, error: 'You must be an admin to remove members.' };
        }

        if (userIdToRemove === space.owner_id) {
            return { success: false, error: 'The owner of the space cannot be removed.' };
        }

        const memberToRemove = space.members.find(
            (m) => m.user_id === userIdToRemove
        );

        if (!memberToRemove) {
            return { success: false, error: 'The specified user is not a member of this space.' };
        }

        if (memberToRemove.role === 'ADMIN') {
            return { success: false, error: 'Admins cannot remove other admins.' };
        }

        await prisma.spaceMember.delete({
            where: {
                user_id_space_id: {
                    user_id: userIdToRemove,
                    space_id: spaceId,
                },
            },
        });

        revalidatePath(`/spaces/${spaceId}/settings`);

        return { success: true, data: true };
    } catch (error) {
        console.error('Failed to remove member:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}