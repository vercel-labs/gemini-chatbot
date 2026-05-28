"use client";
import { Navbar } from "@/components/custom/navbar";
import { usePathname } from "next/navigation";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
