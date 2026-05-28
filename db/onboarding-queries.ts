import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getPostgresUrl } from "@/lib/db-url";
import {
    onboardingProgress,
    onboardingSession,
    onboardingStep,
    webhookEvent,
} from "./onboarding-schema";

const client = postgres(getPostgresUrl());
const db = drizzle(client);

// ─── Onboarding Steps ────────────────────────────────────────────────────────

export async function getStepsByDepartmentAndRole({
    department,
    roleLevel,
}: {
    department: string;
    roleLevel: string;
}) {
    try {
        return await db
            .select()
            .from(onboardingStep)
            .where(
                and(
                    eq(onboardingStep.department, department),
                    // roleLevel NULL means step applies to all roles in the dept
                    eq(onboardingStep.roleLevel, roleLevel),
                ),
            )
            .orderBy(asc(onboardingStep.stepOrder));
    } catch (error) {
        console.error("Failed to get onboarding steps");
        throw error;
    }
}

export async function insertOnboardingStep(step: {
    department: string;
    roleLevel?: string | null;
    stepOrder: number;
    title: string;
    description: string;
    category: string;
    isRequired?: boolean;
}) {
    try {
        const [inserted] = await db
            .insert(onboardingStep)
            .values({
                department: step.department,
                roleLevel: step.roleLevel ?? null,
                stepOrder: step.stepOrder,
                title: step.title,
                description: step.description,
                category: step.category,
                isRequired: step.isRequired ?? true,
            })
            .returning();
        return inserted;
    } catch (error) {
        console.error("Failed to insert onboarding step");
        throw error;
    }
}

// ─── Onboarding Sessions ─────────────────────────────────────────────────────

export async function createOnboardingSession({
    userId,
    department,
    roleLevel,
    employeeName,
}: {
    userId: string;
    department: string;
    roleLevel: string;
    employeeName?: string;
}) {
    try {
        const [session] = await db
            .insert(onboardingSession)
            .values({
                userId,
                department,
                roleLevel,
                employeeName: employeeName ?? null,
            })
            .returning();
        return session;
    } catch (error) {
        console.error("Failed to create onboarding session");
        throw error;
    }
}

export async function getOnboardingSessionById({ id }: { id: string }) {
    try {
        const [session] = await db
            .select()
            .from(onboardingSession)
            .where(eq(onboardingSession.id, id));
        return session;
    } catch (error) {
        console.error("Failed to get onboarding session by id");
        throw error;
    }
}

export async function getOnboardingSessionsByUserId({ userId }: { userId: string }) {
    try {
        return await db
            .select()
            .from(onboardingSession)
            .where(eq(onboardingSession.userId, userId));
    } catch (error) {
        console.error("Failed to get onboarding sessions by userId");
        throw error;
    }
}

export async function updateOnboardingSession({
    id,
    chatId,
    status,
    completedAt,
}: {
    id: string;
    chatId?: string;
    status?: "in_progress" | "completed";
    completedAt?: Date;
}) {
    try {
        const updateValues: Partial<{
            chatId: string;
            status: "in_progress" | "completed";
            completedAt: Date;
        }> = {};
        if (chatId !== undefined) updateValues.chatId = chatId;
        if (status !== undefined) updateValues.status = status;
        if (completedAt !== undefined) updateValues.completedAt = completedAt;

        return await db
            .update(onboardingSession)
            .set(updateValues)
            .where(eq(onboardingSession.id, id));
    } catch (error) {
        console.error("Failed to update onboarding session");
        throw error;
    }
}

// ─── Onboarding Progress ─────────────────────────────────────────────────────

export async function getProgressBySession({ sessionId }: { sessionId: string }) {
    try {
        return await db
            .select()
            .from(onboardingProgress)
            .where(eq(onboardingProgress.sessionId, sessionId));
    } catch (error) {
        console.error("Failed to get progress by session");
        throw error;
    }
}

export async function upsertOnboardingProgress({
    sessionId,
    stepId,
    notes,
}: {
    sessionId: string;
    stepId: string;
    notes?: string;
}) {
    try {
        const existing = await db
            .select()
            .from(onboardingProgress)
            .where(
                and(
                    eq(onboardingProgress.sessionId, sessionId),
                    eq(onboardingProgress.stepId, stepId),
                ),
            );

        if (existing.length > 0) {
            return await db
                .update(onboardingProgress)
                .set({
                    completedAt: new Date(),
                    notes: notes ?? null,
                })
                .where(
                    and(
                        eq(onboardingProgress.sessionId, sessionId),
                        eq(onboardingProgress.stepId, stepId),
                    ),
                );
        }

        return await db.insert(onboardingProgress).values({
            sessionId,
            stepId,
            completedAt: new Date(),
            notes: notes ?? null,
        });
    } catch (error) {
        console.error("Failed to upsert onboarding progress");
        throw error;
    }
}

// ─── Webhook Events ──────────────────────────────────────────────────────────

export async function createWebhookEvent({
    sessionId,
    eventType,
    payload,
}: {
    sessionId: string;
    eventType: string;
    payload: Record<string, unknown>;
}) {
    try {
        const [event] = await db
            .insert(webhookEvent)
            .values({
                sessionId,
                eventType,
                payload,
                status: "pending",
            })
            .returning();
        return event.id;
    } catch (error) {
        console.error("Failed to create webhook event");
        throw error;
    }
}

export async function updateWebhookEvent({
    id,
    status,
}: {
    id: string;
    status: "pending" | "delivered" | "failed";
}) {
    try {
        return await db
            .update(webhookEvent)
            .set({
                status,
                deliveredAt: status === "delivered" ? new Date() : undefined,
            })
            .where(eq(webhookEvent.id, id));
    } catch (error) {
        console.error("Failed to update webhook event");
        throw error;
    }
}
