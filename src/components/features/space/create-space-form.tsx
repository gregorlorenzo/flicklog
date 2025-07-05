'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

/**
 * A client component form for creating a new Shared Space.
 * Handles form state, validation, and calls the `createSpace` server action.
 */
export function CreateSpaceForm() {
    const router = useRouter();

    const form = useForm<CreateSpaceInput>({
        resolver: zodResolver(createSpaceSchema),
        defaultValues: {
            name: '',
        },
    });

    async function onSubmit(values: CreateSpaceInput) {
        const toastId = toast.loading('Creating your new space...');

        const result = await createSpace(values);

        if (result.success) {
            toast.success(`Space "${result.data.name}" has been created!`, {
                id: toastId,
            });
        } else {
            if (result.fieldErrors) {
                for (const [field, errors] of Object.entries(result.fieldErrors)) {
                    form.setError(field as keyof CreateSpaceInput, {
                        type: 'server',
                        message: errors.join(', '),
                    });
                }
                toast.error('Please correct the errors in the form.', { id: toastId });
            } else {
                toast.error(result.error, { id: toastId });
            }
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
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