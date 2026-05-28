import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { EuzChat } from "@/components/onboarding/euz-chat";
import { getOnboardingSessionById } from "@/db/onboarding-queries";
import { generateUUID } from "@/lib/utils";

export default async function OnboardingSessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = await params;

    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const onboardingSession = await getOnboardingSessionById({ id: sessionId });
    if (!onboardingSession) notFound();
    if (onboardingSession.userId !== session.user.id) notFound();

    const chatId = onboardingSession.chatId ?? generateUUID();

    return (
        <EuzChat
            chatId={chatId}
            sessionId={sessionId}
            department={onboardingSession.department}
            roleLevel={onboardingSession.roleLevel}
            employeeName={onboardingSession.employeeName ?? undefined}
            sessionStatus={onboardingSession.status}
        />
    );
}
