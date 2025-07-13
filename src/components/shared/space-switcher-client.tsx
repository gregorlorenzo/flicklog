'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Space } from '@prisma/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectSeparator,
} from '@/components/ui/select';
import { PlusCircle, Users, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpaceSwitcherClientProps {
    currentSpace: Space;
    spaces: Space[];
    isLoading?: boolean;
}

const getSpaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'personal':
            return <Lock className="h-3.5 w-3.5 text-muted-foreground" />;
        case 'shared':
            return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
        case 'public':
            return <Globe className="h-3.5 w-3.5 text-muted-foreground" />;
        default:
            return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
    }
};



export function SpaceSwitcherClient({
    currentSpace,
    spaces,
    isLoading = false,
}: SpaceSwitcherClientProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleSwitch = (spaceId: string) => {
        if (spaceId === 'create-new') {
            router.push(`/spaces/new?from=/spaces/${currentSpace.id}`);
            return;
        }

        const selectedSpace = spaces.find(space => space.id === spaceId);
        if (selectedSpace && selectedSpace.id !== currentSpace.id) {
            router.push(`/spaces/${spaceId}`);
        }
        setIsOpen(false);
    };

    const sortedSpaces = [...spaces].sort((a, b) => {
        if (a.id === currentSpace.id) return -1;
        if (b.id === currentSpace.id) return 1;
        return 0;
    });

    return (
        <Select
            onValueChange={handleSwitch}
            defaultValue={currentSpace.id}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={isLoading}
        >
            <SelectTrigger
                className={cn(
                    "w-[240px] justify-start font-medium transition-all duration-200",
                    "hover:bg-accent/50 focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "border-border/60 hover:border-border",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}
                aria-label={`Current space: ${currentSpace.name}. Click to switch spaces.`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {getSpaceTypeIcon(currentSpace.type)}
                    <SelectValue placeholder="Select a space">
                        <span className="truncate">{currentSpace.name}</span>
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent
                className="w-[240px] p-1"
                align="start"
                sideOffset={4}
            >
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Your Spaces
                </div>
                {sortedSpaces.map((space) => {
                    const isSelected = currentSpace.id === space.id;

                    return (
                        <SelectItem
                            key={space.id}
                            value={space.id}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                                "hover:bg-accent/80 focus:bg-accent/80 transition-colors",
                                "group relative min-h-[40px]",
                                isSelected && "bg-accent/40 font-medium"
                            )}
                            aria-selected={isSelected}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {getSpaceTypeIcon(space.type)}
                                <span className="truncate text-sm">{space.name}</span>
                            </div>
                        </SelectItem>
                    );
                })}

                <SelectSeparator className="my-2" />

                <SelectItem
                    value="create-new"
                    className={cn(
                        "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                        "hover:bg-accent/80 focus:bg-accent/80 transition-colors",
                        "text-sm font-medium text-primary hover:text-primary/90"
                    )}
                    aria-label="Create new space"
                >
                    <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Create New Space</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}