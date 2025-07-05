'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    inviteMemberSchema,
    type InviteMemberInput,
} from '@/lib/schemas/space-schemas';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { inviteMember } from '@/actions/space-actions';

interface InviteMemberFormProps {
    spaceId: string;
}

/**
 * A client form for inviting a new member to a space by username.
 */
export function InviteMemberForm({ spaceId }: InviteMemberFormProps) {
    const form = useForm<InviteMemberInput>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            username: '',
        },
    });

    async function onSubmit(values: InviteMemberInput) {
        const result = await inviteMember(spaceId, values);

        if (result.success) {
            toast.success(`Invitation sent successfully!`);
            form.reset();
        } else {
            if (result.fieldErrors) {
                for (const [field, errors] of Object.entries(result.fieldErrors)) {
                    form.setError(field as keyof InviteMemberInput, {
                        type: 'server',
                        message: errors.join(', '),
                    });
                }
            } else {
                toast.error(result.error);
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="@username" {...field} />
                            </FormControl>
                            <FormMessage className="mt-1" />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Invite
                </Button>
            </form>
        </Form>
    );
}