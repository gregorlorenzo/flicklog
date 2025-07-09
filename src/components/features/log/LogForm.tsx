'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { createLogEntry } from '@/actions/log-actions';
import { LogEntryFormValues, logEntrySchema } from '@/lib/schemas/log-schema';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { StarRating } from '@/components/shared/StarRating';
import { TmdbSearch } from './TmdbSearch';

interface LogFormProps {
    spaceId: string;
}

export function LogForm({ spaceId }: LogFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<LogEntryFormValues>({
        resolver: zodResolver(logEntrySchema),
        defaultValues: {
            tmdbId: '',
            tmdbType: 'movie',
            watchedOn: new Date(),
            rating: 0,
            quickTake: '',
            deeperThoughts: '',
        },
    });

    function onSubmit(values: LogEntryFormValues) {
        startTransition(async () => {
            const result = await createLogEntry(spaceId, values);

            if (result && !result.success) {
                if (result.fieldErrors) {
                    for (const [field, errors] of Object.entries(result.fieldErrors)) {
                        form.setError(field as keyof LogEntryFormValues, {
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
                    name="tmdbId"
                    render={() => (
                        <FormItem>
                            <FormLabel>Movie / TV Show</FormLabel>
                            <FormControl>
                                <TmdbSearch />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Rating</FormLabel>
                            <FormControl>
                                <StarRating value={field.value} onChange={field.onChange} />
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
                            <FormLabel>Watched On</FormLabel>
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
                                <Input placeholder="A brief, public-facing summary or hot take..." {...field} />
                            </FormControl>
                            <FormDescription>
                                This short summary may be used for social integrations.
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
                                    placeholder="Your detailed, private notes, inside jokes, or a full review..."
                                    className="resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                These notes are just for you and members of this space.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Log Entry
                </Button>
            </form>
        </Form>
    );
}