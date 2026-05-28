import { auth } from "@/app/(auth)/auth";
import {
    getOnboardingSessionById,
    getProgressBySession,
    getStepsByDepartmentAndRole,
    upsertOnboardingProgress,
    updateOnboardingSession,
} from "@/db/onboarding-queries";

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
        return new Response("sessionId is required", { status: 400 });
    }

    const onboardingSession = await getOnboardingSessionById({ id: sessionId });
    if (!onboardingSession) {
        return new Response("Session not found", { status: 404 });
    }
    if (onboardingSession.userId !== session.user.id) {
        return new Response("Forbidden", { status: 403 });
    }

    const [steps, progress] = await Promise.all([
        getStepsByDepartmentAndRole({
            department: onboardingSession.department,
            roleLevel: onboardingSession.roleLevel,
        }),
        getProgressBySession({ sessionId }),
    ]);

    const completedStepIds = new Set(progress.map((p) => p.stepId));
    const enrichedSteps = steps.map((s) => ({
        ...s,
        completed: completedStepIds.has(s.id),
    }));

    return Response.json({
        session: onboardingSession,
        steps: enrichedSteps,
        totalSteps: steps.length,
        completedCount: completedStepIds.size,
    });
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const {
        sessionId,
        stepId,
        notes,
    }: { sessionId: string; stepId: string; notes?: string } =
        await request.json();

    if (!sessionId || !stepId) {
        return new Response("sessionId and stepId are required", { status: 400 });
    }

    const onboardingSession = await getOnboardingSessionById({ id: sessionId });
    if (!onboardingSession) {
        return new Response("Session not found", { status: 404 });
    }
    if (onboardingSession.userId !== session.user.id) {
        return new Response("Forbidden", { status: 403 });
    }

    await upsertOnboardingProgress({ sessionId, stepId, notes });

    // Check if all required steps are complete — if so, mark session done
    const [steps, progress] = await Promise.all([
        getStepsByDepartmentAndRole({
            department: onboardingSession.department,
            roleLevel: onboardingSession.roleLevel,
        }),
        getProgressBySession({ sessionId }),
    ]);

    const requiredStepIds = new Set(
        steps.filter((s) => s.isRequired).map((s) => s.id),
    );
    const completedStepIds = new Set(progress.map((p) => p.stepId));
    const allRequiredDone = [...requiredStepIds].every((id) =>
        completedStepIds.has(id),
    );

    if (allRequiredDone && onboardingSession.status !== "completed") {
        await updateOnboardingSession({
            id: sessionId,
            status: "completed",
            completedAt: new Date(),
        });
    }

    return Response.json({ success: true, allRequiredDone });
}
