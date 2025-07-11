import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InviteMemberForm } from '@/components/features/space/invite-member-form';
import { RemoveMemberButton } from '@/components/features/space/remove-member-button';
import { DiscordWebhookForm } from '@/components/features/space/discord-webhook-form';

type SpaceWithMembersAndProfiles = Prisma.SpaceGetPayload<{
    include: {
        members: {
            include: {
                user: true;
            };
        };
    };
}>;

/**
 * Fetches the space and its members, including their full profile information.
 */
async function getSpaceWithMembers(
    spaceId: string
): Promise<SpaceWithMembersAndProfiles | null> {
    const space = await prisma.space.findUnique({
        where: { id: spaceId },
        include: {
            members: {
                orderBy: {
                    user: {
                        display_name: 'asc',
                    },
                },
                include: {
                    user: true,
                },
            },
        },
    });
    return space;
}

/**
 * A helper function to get the initials from a name for the Avatar fallback.
 */
function getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Renders the settings page for a specific shared space.
 */
export default async function SpaceSettingsPage({
    params,
}: {
    params: Promise<{ spaceId: string }>;
}) {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { spaceId } = await params;

    const space = await getSpaceWithMembers(spaceId);

    if (!space || !currentUser) {
        return notFound();
    }

    const currentUserMembership = space.members.find(
        (m) => m.user_id === currentUser.id
    );
    const isCurrentUserAdmin = currentUserMembership?.role === 'ADMIN';

    return (
        <div className="container py-8">
            <div className="space-y-2">
                <h1 className="font-heading text-3xl font-bold md:text-4xl">
                    Space Settings
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage your shared space &quot;{space.name}&quot;.
                </p>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Members</CardTitle>
                            <CardDescription>
                                The following users are members of this space.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {space.members.map(({ user: profile, role }) => {
                                    if (!profile) return null;

                                    const canBeRemoved =
                                        isCurrentUserAdmin &&
                                        profile.user_id !== currentUser.id &&
                                        profile.user_id !== space.owner_id &&
                                        role !== 'ADMIN';

                                    return (
                                        <li
                                            key={profile.user_id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={profile.avatar_url ?? undefined}
                                                        alt={profile.display_name ?? 'User Avatar'}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(profile.display_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{profile.display_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        @{profile.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
                                                    {role}
                                                </Badge>
                                                {canBeRemoved && (
                                                    <RemoveMemberButton
                                                        spaceId={space.id}
                                                        memberToRemove={{
                                                            id: profile.user_id,
                                                            name: profile.display_name,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invite Members</CardTitle>
                            <CardDescription>
                                Add new members to this space by their username.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InviteMemberForm spaceId={space.id} />
                        </CardContent>
                    </Card>

                    {isCurrentUserAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Discord Integration</CardTitle>
                                <CardDescription>
                                    Automatically post new log entries to a Discord channel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DiscordWebhookForm
                                    spaceId={space.id}
                                    currentWebhookUrl={space.discord_webhook_url}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}