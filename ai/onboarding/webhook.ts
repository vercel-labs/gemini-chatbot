import "server-only";

import { Resend } from "resend";

import {
    createWebhookEvent,
    updateWebhookEvent,
} from "@/db/onboarding-queries";

export type OnboardingEventType =
    | "onboarding.started"
    | "onboarding.step_completed"
    | "onboarding.completed";

export interface WebhookPayload {
    eventType: OnboardingEventType;
    sessionId: string;
    userId: string;
    department: string;
    roleLevel: string;
    employeeName?: string;
    timestamp: string;
    data: Record<string, unknown>;
}

// ─── Retry Helper ─────────────────────────────────────────────────────────────

async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === retries - 1) throw err;
            await new Promise((resolve) =>
                setTimeout(resolve, 1000 * Math.pow(2, attempt)),
            );
        }
    }
    throw new Error("Max retries exceeded");
}

// ─── Target Dispatchers ───────────────────────────────────────────────────────

async function sendToHR(payload: WebhookPayload): Promise<void> {
    const url = process.env.WEBHOOK_HR_URL;
    if (!url || !url.startsWith("https://")) return;
    await withRetry(() =>
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),
    );
}

async function sendToSlack(payload: WebhookPayload): Promise<void> {
    const url = process.env.WEBHOOK_SLACK_URL;
    if (!url || !url.startsWith("https://")) return;
    const text = formatSlackMessage(payload);
    await withRetry(() =>
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        }),
    );
}

async function sendEmail(payload: WebhookPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.NOTIFICATION_EMAIL_TO;
    if (!apiKey || !to) return;

    const resend = new Resend(apiKey);
    await withRetry(() =>
        resend.emails.send({
            from: "onboarding@euz.com",
            to,
            subject: `E.U.Z Onboarding Event: ${payload.eventType}`,
            text: [
                `Event     : ${payload.eventType}`,
                `Employee  : ${payload.employeeName ?? "Unknown"}`,
                `Department: ${payload.department}`,
                `Role      : ${payload.roleLevel}`,
                `Session   : ${payload.sessionId}`,
                `Timestamp : ${payload.timestamp}`,
                "",
                "Payload:",
                JSON.stringify(payload.data, null, 2),
            ].join("\n"),
        }),
    );
}

async function sendToHRIS(payload: WebhookPayload): Promise<void> {
    const url = process.env.WEBHOOK_HRIS_URL;
    const apiKey = process.env.WEBHOOK_HRIS_API_KEY;
    if (!url || !url.startsWith("https://")) return;
    await withRetry(() =>
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify(payload),
        }),
    );
}

function formatSlackMessage(payload: WebhookPayload): string {
    const icons: Record<OnboardingEventType, string> = {
        "onboarding.started": "🟢",
        "onboarding.step_completed": "✅",
        "onboarding.completed": "🎉",
    };
    const icon = icons[payload.eventType] ?? "📋";
    return [
        `${icon} *E.U.Z Onboarding — ${payload.eventType}*`,
        `• Employee : ${payload.employeeName ?? "Unknown"}`,
        `• Dept     : ${payload.department}`,
        `• Role     : ${payload.roleLevel}`,
        `• Session  : \`${payload.sessionId}\``,
        `• Time     : ${payload.timestamp}`,
    ].join("\n");
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

/**
 * Dispatches a webhook event to all configured targets.
 * Fire-and-forget — does NOT block the calling context.
 * Logs event status to the WebhookEvent table.
 */
export function dispatchWebhook({
    sessionId,
    eventType,
    userId,
    department,
    roleLevel,
    employeeName,
    data,
}: {
    sessionId: string;
    eventType: OnboardingEventType;
    userId: string;
    department: string;
    roleLevel: string;
    employeeName?: string;
    data?: Record<string, unknown>;
}): void {
    const payload: WebhookPayload = {
        eventType,
        sessionId,
        userId,
        department,
        roleLevel,
        employeeName,
        timestamp: new Date().toISOString(),
        data: data ?? {},
    };

    // Intentionally not awaited — fire-and-forget
    (async () => {
        let eventId: string | undefined;
        try {
            eventId = await createWebhookEvent({
                sessionId,
                eventType,
                payload: payload as unknown as Record<string, unknown>,
            });

            const results = await Promise.allSettled([
                sendToHR(payload),
                sendToSlack(payload),
                sendEmail(payload),
                sendToHRIS(payload),
            ]);

            const allSuccess = results.every((r) => r.status === "fulfilled");

            if (eventId) {
                await updateWebhookEvent({
                    id: eventId,
                    status: allSuccess ? "delivered" : "failed",
                });
            }
        } catch (err) {
            console.error(
                `[Webhook] Dispatch error — eventType: ${eventType}, sessionId: ${sessionId}`,
                err,
            );
            if (eventId) {
                await updateWebhookEvent({ id: eventId, status: "failed" }).catch(
                    () => { },
                );
            }
        }
    })();
}
