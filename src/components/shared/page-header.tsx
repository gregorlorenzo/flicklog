import Link from 'next/link';
import * as React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
    href: string;
    label: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
}

export function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="mb-8">
            <Breadcrumb className="mb-2">
                <BreadcrumbList>
                    {breadcrumbs.map((item, index) => (
                        <React.Fragment key={item.href}>
                            <BreadcrumbItem>
                                {index === breadcrumbs.length - 1 ? (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold font-heading">{title}</h1>
            {description && (
                <p className="mt-1 text-muted-foreground">{description}</p>
            )}
        </div>
    );
}