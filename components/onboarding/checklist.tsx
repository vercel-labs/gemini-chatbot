"use client";

import { CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    category: string;
    stepOrder: number;
    isRequired: boolean;
    completed: boolean;
}

interface ChecklistData {
    steps: OnboardingStep[];
    totalSteps: number;
    completedCount: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Checklist({ sessionId }: { sessionId: string }) {
    const { data, isLoading } = useSWR<ChecklistData>(
        `/onboarding/api/progress?sessionId=${sessionId}`,
        fetcher,
        { refreshInterval: 5000 },
    );

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(),
    );

    function toggleCategory(category: string) {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    }

    if (isLoading || !data) {
        return (
            <div className="flex flex-col gap-2 p-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    const { steps, totalSteps, completedCount } = data;
    const progressPct = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

    // Group steps by category
    const grouped: Record<string, OnboardingStep[]> = {};
    for (const step of steps) {
        if (!grouped[step.category]) grouped[step.category] = [];
        grouped[step.category].push(step);
    }

    return (
        <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
            {/* Progress bar */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Onboarding Progress</span>
                    <span>
                        {completedCount} / {totalSteps}
                    </span>
                </div>
                <progress
                    value={progressPct}
                    max={100}
                    className="h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-500 [&::-moz-progress-bar]:bg-primary"
                    aria-label="Onboarding progress"
                />
            </div>

            {/* Steps grouped by category */}
            {Object.entries(grouped).map(([category, categorySteps]) => {
                const isExpanded = expandedCategories.has(category);
                const catCompleted = categorySteps.filter((s) => s.completed).length;

                return (
                    <div key={category} className="flex flex-col gap-1">
                        <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="flex items-center justify-between w-full text-left p-1 rounded hover:bg-muted/50 transition-colors"
                        >
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {category}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {catCompleted}/{categorySteps.length}
                                </span>
                                {isExpanded ? (
                                    <ChevronDown className="size-3 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="size-3 text-muted-foreground" />
                                )}
                            </div>
                        </button>

                        {isExpanded &&
                            categorySteps.map((step) => (
                                <div
                                    key={step.id}
                                    className="flex items-start gap-2 px-2 py-1.5 rounded text-sm"
                                >
                                    {step.completed ? (
                                        <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                    ) : (
                                        <Circle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex flex-col">
                                        <span
                                            className={
                                                step.completed
                                                    ? "text-muted-foreground line-through"
                                                    : "text-foreground"
                                            }
                                        >
                                            {step.title}
                                        </span>
                                        {!step.isRequired && (
                                            <span className="text-xs text-muted-foreground">
                                                Optional
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                );
            })}

            {completedCount === totalSteps && totalSteps > 0 && (
                <div className="rounded-md bg-primary/10 border border-primary/20 p-3 text-sm text-primary text-center">
                    Onboarding complete. Welcome to E.U.Z.
                </div>
            )}
        </div>
    );
}
