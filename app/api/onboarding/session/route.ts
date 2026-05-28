// import { auth } from "@/app/(auth)/auth";
import { createOnboardingSession } from "@/db/onboarding-queries";

export async function POST(request: Request) {
    // const session = await auth();
    // if (!session?.user?.id) {
    //     return new Response("Unauthorized", { status: 401 });
    // }
    // For demo, allow all requests
    const session = { user: { id: "demo-user" } };

    const {
        department,
        roleLevel,
        employeeName,
    }: { department: string; roleLevel: string; employeeName?: string } =
        await request.json();

    if (!department || !roleLevel) {
        return new Response("department and roleLevel are required", { status: 400 });
    }

    const onboardingSession = await createOnboardingSession({
        userId: session.user.id,
        department,
        roleLevel,
        employeeName,
    });

    return Response.json({ sessionId: onboardingSession.id });
}
