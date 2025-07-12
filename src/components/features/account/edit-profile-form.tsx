'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { updateProfile } from '@/actions/profile-actions';
import {
    profileSchema,
    type ProfileFormValues,
} from '@/lib/schemas/profile-schema';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import type { Profile } from '@prisma/client';

interface EditProfileFormProps {
    profile: Profile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: profile.username || '',
            display_name: profile.display_name || '',
            avatar_url: profile.avatar_url || '',
        },
    });

    function onSubmit(values: ProfileFormValues) {
        startTransition(async () => {
            const result = await updateProfile(values);

            if (result.success) {
                toast.success('Profile updated successfully!');
            } else {
                if (result.fieldErrors) {
                    for (const [field, errors] of Object.entries(result.fieldErrors)) {
                        form.setError(field as keyof ProfileFormValues, {
                            type: 'server',
                            message: errors.join(', '),
                        });
                    }
                } else {
                    toast.error(result.error || 'An unknown error occurred.');
                }
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="your_unique_username" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your unique @-handle.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the name that will be displayed to others.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                                A direct link to your profile picture.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}