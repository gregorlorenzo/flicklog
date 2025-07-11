'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    discordWebhookSchema,
    type DiscordWebhookFormValues,
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
import { saveDiscordWebhook } from '@/actions/space-actions';

interface DiscordWebhookFormProps {
    spaceId: string;
    currentWebhookUrl: string | null;
}

export function DiscordWebhookForm({
    spaceId,
    currentWebhookUrl,
}: DiscordWebhookFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<DiscordWebhookFormValues>({
        resolver: zodResolver(discordWebhookSchema),
        defaultValues: {
            webhookUrl: currentWebhookUrl ?? '',
        },
    });

    function onSubmit(values: DiscordWebhookFormValues) {
        startTransition(async () => {
            const result = await saveDiscordWebhook(spaceId, values.webhookUrl);
            if (result.success) {
                toast.success('Discord webhook URL saved!');
                form.reset({ webhookUrl: values.webhookUrl });
            } else {
                toast.error(result.error);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="webhookUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Webhook URL</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="https://discord.com/api/webhooks/..."
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Paste the URL from your Discord channel&apos;s integration settings.
                            </FormDescription>
                            <FormDescription>
                                <Link
                                    href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground underline hover:text-foreground"
                                >
                                    Learn how to create a webhook.
                                </Link>
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save'}
                </Button>
            </form>
        </Form>
    );
}