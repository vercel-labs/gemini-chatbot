import { redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { SetupForm } from "@/components/onboarding/setup-form";
import { getOnboardingSessionsByUserId } from "@/db/onboarding-queries";

export default async function OnboardingPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // If the user already has an in-progress session, redirect to it
    const sessions = await getOnboardingSessionsByUserId({
        userId: session.user.id,
    });
    const activeSession = sessions.find((s) => s.status === "in_progress");
    if (activeSession) {
        redirect(`/onboarding/${activeSession.id}`);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-dvh bg-background px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        E.U.Z Helper
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        E.U.Z Energy Construction — Onboarding System
                    </p>
                </div>
                <SetupForm />
            </div>
        </div>
    );
}
