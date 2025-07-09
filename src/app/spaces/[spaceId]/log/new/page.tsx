import { LogForm } from '@/components/features/log/LogForm';

export default async function NewLogInSpacePage({
    params,
}: {
    params: Promise<{ spaceId: string }>;
}) {
    const { spaceId } = await params;

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Log a New Entry</h1>
                <p className="text-muted-foreground">
                    Find a movie or TV show and record your thoughts.
                </p>
            </header>
            <LogForm spaceId={spaceId} />
        </div>
    );
}