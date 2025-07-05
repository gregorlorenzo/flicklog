import { z } from 'zod';

export const logEntrySchema = z.object({
    tmdbId: z.string().min(1, { message: 'A movie or TV show must be selected.' }),
    tmdbType: z.enum(['movie', 'tv'], { required_error: 'Media type is required.' }),
    rating: z.coerce.number().min(0.5, 'Rating is required').max(5),
    watchedOn: z.date({ required_error: 'Please select the date you watched this.' }),
    quickTake: z.string().optional(),
    deeperThoughts: z.string().optional(),
    spaceId: z.string().uuid().optional(),
});

export type LogEntryFormValues = z.infer<typeof logEntrySchema>;

export const completeRatingSchema = z.object({
    rating: z
        .number()
        .min(0.5, 'Rating is required.')
        .max(5, 'Rating cannot exceed 5.'),
    watchedOn: z.date({
        required_error: 'Please select the date you watched this.',
    }),
    quickTake: z.string().max(280, 'Quick take is too long.').optional(),
    deeperThoughts: z.string().optional(),
});

export type CompleteRatingFormValues = z.infer<typeof completeRatingSchema>;