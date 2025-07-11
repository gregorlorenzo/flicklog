'use client';

import { useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import {
    completeRatingSchema,
    type CompleteRatingFormValues,
} from '@/lib/schemas/log-schema';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { submitPendingRating } from '@/actions/log-actions';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/shared/StarRating';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface CompleteRatingFormProps {
    logEntryId: string;
}

/**
 * A client form for completing a pending rating.
 */
export function CompleteRatingForm({ logEntryId }: CompleteRatingFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<CompleteRatingFormValues>({
        resolver: zodResolver(completeRatingSchema),
        defaultValues: {
            rating: 0,
            watchedOn: new Date(),
            quickTake: '',
            deeperThoughts: '',
        },
    });

    function onSubmit(values: CompleteRatingFormValues) {
        startTransition(async () => { 
            const result = await submitPendingRating(logEntryId, values);

            if (result && !result.success) {
                if (result.fieldErrors) {
                    for (const [field, errors] of Object.entries(result.fieldErrors)) {
                        form.setError(field as keyof CompleteRatingFormValues, {
                            type: 'server',
                            message: errors.join(', '),
                        });
                    }
                    toast.error('Please correct the errors in the form.');
                } else {
                    toast.error(result.error);
                }
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Rating</FormLabel>
                            <FormControl>
                                <StarRating
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="watchedOn"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date Watched</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'w-[240px] pl-3 text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, 'PPP')
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date('1900-01-01')
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="quickTake"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quick Take</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="A short summary or hot take..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                This is a short, public-facing summary.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="deeperThoughts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deeper Thoughts</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Longer, more private notes and inside jokes..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                These notes are just for you and your space members.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Rating
                </Button>
            </form>
        </Form>
    );
}