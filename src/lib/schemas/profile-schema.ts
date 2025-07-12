import * as z from 'zod';

export const profileSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters long.')
        .max(20, 'Username must be 20 characters or less.')
        .regex(
            /^[a-zA-Z0-9_]+$/,
            'Username can only contain letters, numbers, and underscores.'
        ),
    display_name: z
        .string()
        .min(2, 'Display name must be at least 2 characters long.')
        .max(50, 'Display name must be 50 characters or less.')
        .optional()
        .or(z.literal('')),
    avatar_url: z
        .string()
        .url('Must be a valid URL.')
        .optional()
        .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;