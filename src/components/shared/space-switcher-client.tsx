'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Space } from '@prisma/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectSeparator,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react'; 

interface SpaceSwitcherClientProps {
    currentSpace: Space;
    spaces: Space[];
}

export function SpaceSwitcherClient({
    currentSpace,
    spaces,
}: SpaceSwitcherClientProps) {
    const router = useRouter();

    const handleSwitch = (spaceId: string) => {
        if (spaceId === 'create-new') {
            router.push('/spaces/new');
            return;
        }
        router.push(`/spaces/${spaceId}`);
    };

    return (
        <Select onValueChange={handleSwitch} defaultValue={currentSpace.id}>
            <SelectTrigger className="w-[200px] justify-start">
                <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{currentSpace.name}</span>
                </div>
            </SelectTrigger>
            <SelectContent>
                {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                        {space.name}
                    </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="create-new" className="text-sm">
                    <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        <span>Create New Space</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}