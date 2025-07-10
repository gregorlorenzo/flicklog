'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedSearchResult } from '@/actions/tmdb-actions';
import { OnboardingTmdbSearch } from './onboarding-tmdb-search';
import { OnboardingStarRating } from './onboarding-star-rating';
import { completeOnboarding } from '@/actions/onboarding-actions';
import { toast } from 'sonner';

interface OnboardingWizardProps { }

type OnboardingSelection = {
    item: UnifiedSearchResult | null;
    rating: number;
};

export function OnboardingWizard({ }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [loved, setLoved] = useState<OnboardingSelection>({ item: null, rating: 5 });
    const [okay, setOkay] = useState<OnboardingSelection>({ item: null, rating: 3 });
    const [disliked, setDisliked] = useState<OnboardingSelection>({ item: null, rating: 1 });
    const [isPending, startTransition] = useTransition();
    const router = useRouter();


    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const getStepState = (currentStep: number) => {
        if (currentStep === 1) return { selection: loved, setSelection: setLoved };
        if (currentStep === 2) return { selection: okay, setSelection: setOkay };
        return { selection: disliked, setSelection: setDisliked };
    };

    const { selection, setSelection } = getStepState(step);

    const handleSelect = (item: UnifiedSearchResult) => {
        setSelection((prev) => ({ ...prev, item }));
    };

    const handleClear = () => {
        setSelection((prev) => ({ ...prev, item: null }));
    };

    const handleRatingChange = (rating: number) => {
        setSelection((prev) => ({ ...prev, rating }));
    };

    const handleFinish = () => {
        if (!loved.item || !okay.item || !disliked.item) {
            toast.error("Please make a selection for all three steps.");
            return;
        }

        startTransition(async () => {
            const result = await completeOnboarding({
                loved: { item: loved.item!, rating: loved.rating },
                okay: { item: okay.item!, rating: okay.rating },
                disliked: { item: disliked.item!, rating: disliked.rating },
            });

            if (!result.success) {
                toast.error(result.error);
            }
        });
    };

    const isNextDisabled = !selection.item || selection.rating === 0;

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Welcome to Flicklog!</h1>
            <p className="mb-8 text-lg text-muted-foreground">Let's get your library started.</p>

            <div className="w-full max-w-xl rounded-lg border bg-card p-6 md:p-8 shadow-lg">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold md:text-2xl">Step 1: A Film You Loved</h2>
                        <p className="mt-2 text-muted-foreground">Search for a movie you'd rate 4.5 or 5 stars.</p>
                        <OnboardingTmdbSearch onSelect={handleSelect} onClear={handleClear} selectedItem={selection.item} />
                        {selection.item && (
                            <div className="mt-4 flex flex-col items-center">
                                <OnboardingStarRating value={selection.rating} onChange={handleRatingChange} min={4.5} max={5} />
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button onClick={nextStep} disabled={isNextDisabled} className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold md:text-2xl">Step 2: A Film That Was... Okay</h2>
                        <p className="mt-2 text-muted-foreground">Now, find a movie that was perfectly fine.</p>
                        <OnboardingTmdbSearch onSelect={handleSelect} onClear={handleClear} selectedItem={selection.item} />
                        {selection.item && (
                            <div className="mt-4 flex flex-col items-center">
                                <OnboardingStarRating value={selection.rating} onChange={handleRatingChange} min={2.5} max={3.5} />
                            </div>
                        )}
                        <div className="mt-6 flex justify-between">
                            <button onClick={prevStep} className="rounded bg-secondary px-4 py-2 text-secondary-foreground">Back</button>
                            <button onClick={nextStep} disabled={isNextDisabled} className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold md:text-2xl">Step 3: Not For You</h2>
                        <p className="mt-2 text-muted-foreground">Finally, a movie you didn't enjoy.</p>
                        <OnboardingTmdbSearch onSelect={handleSelect} onClear={handleClear} selectedItem={selection.item} />
                        {selection.item && (
                            <div className="mt-4 flex flex-col items-center">
                                <OnboardingStarRating value={selection.rating} onChange={handleRatingChange} min={1} max={2} />
                            </div>
                        )}
                        <div className="mt-6 flex justify-between">
                            <button onClick={prevStep} className="rounded bg-secondary px-4 py-2 text-secondary-foreground">Back</button>
                            <button onClick={handleFinish} disabled={isNextDisabled || isPending} className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
                                {isPending ? 'Saving...' : 'Finish Onboarding'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}