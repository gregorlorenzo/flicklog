import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    children?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    children,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/50 p-12 text-center',
                className
            )}
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold font-heading">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}