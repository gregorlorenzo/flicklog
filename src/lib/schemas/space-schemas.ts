import { z } from 'zod';

/**
 * Schema for creating a new space.
 * Validates that the name is provided and meets length requirements.
 */
export const createSpaceSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'Space name must be at least 3 characters long.' })
        .max(50, { message: 'Space name cannot exceed 50 characters.' }),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;

/**
 * Schema for inviting a member to a space.
 * Validates that the username is provided.
 */
export const inviteMemberSchema = z.object({
    username: z
        .string()
        .min(3, { message: 'Username must be at least 3 characters.' }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;