import { convertToCoreMessages, Message, streamText } from "ai";

import { geminiProModel } from "@/ai";
import { buildSystemPrompt } from "@/ai/onboarding/system-prompt";
import { buildOnboardingTools } from "@/ai/onboarding/tools";
import { dispatchWebhook } from "@/ai/onboarding/webhook";
import { auth } from "@/app/(auth)/auth";
import {
    getOnboardingSessionById,
    updateOnboardingSession,
} from "@/db/onboarding-queries";
import { saveChat } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
    const {
        id,
        messages,
        sessionId,
    }: {
        id: string;
        messages: Array<Message>;
        sessionId: string;
    } = await request.json();

    const session = await auth();
    if (!session || !session.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const onboardingSession = await getOnboardingSessionById({ id: sessionId });
    if (!onboardingSession) {
        return new Response("Onboarding session not found", { status: 404 });
    }

    // Only the session owner may chat
    if (onboardingSession.userId !== session.user.id) {
        return new Response("Forbidden", { status: 403 });
    }

    const { department, roleLevel, employeeName } = onboardingSession;

    const coreMessages = convertToCoreMessages(messages).filter(
        (message) => message.content.length > 0,
    );

    // Fire onboarding.started on first message (chat not yet linked to session)
    const isFirstMessage = !onboardingSession.chatId && coreMessages.length === 1;
    if (isFirstMessage) {
        dispatchWebhook({
            sessionId,
            eventType: "onboarding.started",
            userId: session.user.id,
            department,
            roleLevel: roleLevel,
            employeeName: employeeName ?? undefined,
        });
    }

    const tools = buildOnboardingTools({
        sessionId,
        userId: session.user.id,
        department,
        roleLevel: roleLevel,
        employeeName: employeeName ?? undefined,
    });

    const chatId = id ?? generateUUID();

    const result = await streamText({
        model: geminiProModel,
        system: buildSystemPrompt({
            department,
            roleLevel: roleLevel,
            employeeName: employeeName ?? undefined,
        }),
        messages: coreMessages,
        tools,
        maxSteps: 10,
        onFinish: async ({ responseMessages }) => {
            if (session.user?.id) {
                await saveChat({
                    id: chatId,
                    messages: [...coreMessages, ...responseMessages],
                    userId: session.user.id,
                });

                // Link chat to session on first message
                if (!onboardingSession.chatId) {
                    await updateOnboardingSession({ id: sessionId, chatId });
                }
            }
        },
    });

    return result.toDataStreamResponse({});
}
