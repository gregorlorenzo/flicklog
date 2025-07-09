'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTransition } from 'react';

import {
    createSpaceSchema,
    type CreateSpaceInput,
} from '@/lib/schemas/space-schemas';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createSpace } from '@/actions/space-actions';

export function CreateSpaceForm() {
    const [isPending, startTransition] = useTransition();

    const form = useForm<CreateSpaceInput>({
        resolver: zodResolver(createSpaceSchema),
        defaultValues: {
            name: '',
        },
    });

    function onSubmit(values: CreateSpaceInput) {
        startTransition(async () => {
            const result = await createSpace(values);

            if (result && !result.success) {
                if (result.fieldErrors) {
                    for (const [field, errors] of Object.entries(result.fieldErrors)) {
                        form.setError(field as keyof CreateSpaceInput, {
                            type: 'server',
                            message: errors.join(', '),
                        });
                    }
                } else {
                    toast.error(result.error);
                }
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Space Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Friday Night Movie Club"
                                    {...field}
                                    className="max-w-md"
                                />
                            </FormControl>
                            <FormDescription>
                                This will be the name of your shared library.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Space'
                    )}
                </Button>
            </form>
        </Form>
    );
}