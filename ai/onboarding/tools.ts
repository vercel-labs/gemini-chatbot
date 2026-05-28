import "server-only";

import { z } from "zod";

import { retrieveContext } from "@/ai/onboarding/rag";
import { dispatchWebhook, OnboardingEventType } from "@/ai/onboarding/webhook";
import {
    getProgressBySession,
    getStepsByDepartmentAndRole,
    upsertOnboardingProgress,
} from "@/db/onboarding-queries";

/**
 * Returns the 5 tool definitions scoped to a specific onboarding session.
 * All closures capture session context so tools can operate without
 * passing state through the AI message payload.
 */
export function buildOnboardingTools({
    sessionId,
    userId,
    department,
    roleLevel,
    employeeName,
}: {
    sessionId: string;
    userId: string;
    department: string;
    roleLevel: string;
    employeeName?: string;
}) {
    return {
        /**
         * Semantic search across the E.U.Z knowledge base.
         * Always called before answering policy / procedural questions.
         */
        searchKnowledge: {
            description:
                "Search the E.U.Z knowledge base for company policies, procedures, technical standards, and role-specific guides. Call this before answering any policy or procedural question.",
            parameters: z.object({
                query: z
                    .string()
                    .describe(
                        "The precise question or topic to look up in the knowledge base",
                    ),
            }),
            execute: async ({ query }: { query: string }) => {
                const context = await retrieveContext({
                    query,
                    department,
                    topK: 5,
                });
                return { context };
            },
        },

        /**
         * Retrieves the ordered onboarding checklist for the employee's
         * department and role level, along with current completion progress.
         */
        getOnboardingChecklist: {
            description:
                "Retrieve the onboarding checklist (ordered steps) for the current employee, along with their completion progress. Call this at the start of every session.",
            parameters: z.object({}),
            execute: async () => {
                const [steps, progress] = await Promise.all([
                    getStepsByDepartmentAndRole({ department, roleLevel }),
                    getProgressBySession({ sessionId }),
                ]);
                const completedStepIds = new Set(progress.map((p) => p.stepId));
                const enrichedSteps = steps.map((s) => ({
                    ...s,
                    completed: completedStepIds.has(s.id),
                }));
                return { steps: enrichedSteps, totalSteps: steps.length, completedCount: completedStepIds.size };
            },
        },

        /**
         * Marks a specific onboarding step as complete for this session.
         * Automatically fires a step-completed webhook event.
         */
        markStepComplete: {
            description:
                "Mark a specific onboarding checklist step as complete. Only call this after the employee explicitly confirms they have completed the step.",
            parameters: z.object({
                stepId: z.string().describe("The UUID of the onboarding step to mark complete"),
                notes: z
                    .string()
                    .optional()
                    .describe("Optional notes or confirmation from the employee"),
            }),
            execute: async ({
                stepId,
                notes,
            }: {
                stepId: string;
                notes?: string;
            }) => {
                await upsertOnboardingProgress({ sessionId, stepId, notes });
                dispatchWebhook({
                    sessionId,
                    eventType: "onboarding.step_completed",
                    userId,
                    department,
                    roleLevel,
                    employeeName,
                    data: { stepId, notes },
                });
                return { success: true, stepId };
            },
        },

        /**
         * Triggers a named lifecycle webhook event (e.g. onboarding.completed).
         */
        triggerWebhook: {
            description:
                "Fire a lifecycle webhook event. Use 'onboarding.completed' when the employee has finished all required checklist steps.",
            parameters: z.object({
                eventType: z
                    .enum([
                        "onboarding.started",
                        "onboarding.step_completed",
                        "onboarding.completed",
                    ])
                    .describe("The lifecycle event type to dispatch"),
                note: z
                    .string()
                    .optional()
                    .describe("Optional context note to include in the webhook payload"),
            }),
            execute: async ({
                eventType,
                note,
            }: {
                eventType: OnboardingEventType;
                note?: string;
            }) => {
                dispatchWebhook({
                    sessionId,
                    eventType,
                    userId,
                    department,
                    roleLevel,
                    employeeName,
                    data: { note },
                });
                return { dispatched: true, eventType };
            },
        },

        /**
         * Targeted policy retrieval by topic keyword.
         * Useful when the employee asks about a specific policy area.
         */
        getCompanyPolicy: {
            description:
                "Retrieve a specific E.U.Z company policy or procedure by topic. Use when the employee asks about a named policy, standard, or compliance requirement.",
            parameters: z.object({
                topic: z
                    .string()
                    .describe(
                        "The specific policy topic or procedure name (e.g. 'permit-to-work', 'data classification', 'PPE requirements')",
                    ),
            }),
            execute: async ({ topic }: { topic: string }) => {
                const context = await retrieveContext({
                    query: `E.U.Z company policy: ${topic}`,
                    department,
                    topK: 3,
                });
                return { topic, context };
            },
        },
    };
}
