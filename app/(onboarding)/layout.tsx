import { redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Navbar } from "@/components/custom/navbar";
import { usePathname } from "next/navigation";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    // Only render Navbar if not on /login or /register
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const showNavbar = !pathname.includes("/login") && !pathname.includes("/register");
    return (
        <>
            {showNavbar && <Navbar />}
            {children}
        </>
    );
}
