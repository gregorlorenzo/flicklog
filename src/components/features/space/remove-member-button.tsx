'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { removeMember } from '@/actions/space-actions';

interface RemoveMemberButtonProps {
    spaceId: string;
    memberToRemove: {
        id: string;
        name: string | null;
    };
}

/**
 * A client component button that triggers a confirmation dialog
 * to remove a member from a space.
 */
export function RemoveMemberButton({
    spaceId,
    memberToRemove,
}: RemoveMemberButtonProps) {
    const [isPending, setIsPending] = useState(false);

    async function handleRemove() {
        setIsPending(true);
        const result = await removeMember(spaceId, memberToRemove.id);

        if (result.success) {
            toast.success(
                `Successfully removed ${memberToRemove.name ?? 'the user'} from the space.`
            );
        } else {
            toast.error(result.error);
        }
        setIsPending(false);
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Remove member</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove{' '}
                        <span className="font-semibold">
                            {memberToRemove.name ?? 'this user'}
                        </span>{' '}
                        from the space. They will lose access to all its content.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemove} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}