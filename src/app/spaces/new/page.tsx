import { CreateSpaceForm } from '@/components/features/space/create-space-form';

/**
 * The page for creating a new Shared Space.
 * This is a server component that renders the CreateSpaceForm.
 */
export default function NewSpacePage() {
    return (
        <div className="container py-8">
            <div className="space-y-2">
                <h1 className="font-heading text-3xl font-bold md:text-4xl">
                    Create a New Shared Space
                </h1>
                <p className="text-muted-foreground text-lg">
                    A Shared Space is a collaborative library where you and your friends
                    can log movies together. Give it a name to get started.
                </p>
            </div>

            <div className="mt-8">
                <CreateSpaceForm />
            </div>
        </div>
    );
}