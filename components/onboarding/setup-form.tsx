"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEPARTMENTS = [
    "Executive / C-Suite",
    "Engineering & Design",
    "Project Management",
    "Health, Safety & Environment (HSE)",
    "Procurement & Supply Chain",
    "Finance & Accounting",
    "Human Resources",
    "IT & Digital",
    "Field Operations / Construction",
    "Legal & Compliance",
    "Facilities / Cleaners & Support Staff",
] as const;

const ROLE_LEVELS = [
    "C-Level (CEO, CTO, CFO, COO)",
    "Senior Manager / Manager",
    "Supervisor / Team Lead",
    "Engineer / Specialist / Analyst",
    "Technician / Operator",
    "Administrative / Support Staff",
    "Cleaner / Facility Staff",
] as const;

export function SetupForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [department, setDepartment] = useState<string>("");
    const [roleLevel, setRoleLevel] = useState<string>("");
    const [employeeName, setEmployeeName] = useState<string>("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!department || !roleLevel) {
            toast.error("Please select a department and role level.");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/onboarding/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ department, roleLevel, employeeName }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    toast.error(text || "Failed to create onboarding session.");
                    return;
                }

                const { sessionId } = await res.json();
                router.push(`/onboarding/${sessionId}`);
            } catch {
                toast.error("An unexpected error occurred. Please try again.");
            }
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-lg border bg-card p-6 shadow-sm"
        >
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="employeeName" className="text-sm font-medium">
                    Full Name
                </Label>
                <Input
                    id="employeeName"
                    name="employeeName"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="e.g. John Adeyemi"
                    className="bg-muted border-none"
                    autoComplete="name"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-destructive">*</span>
                </Label>
                <select
                    id="department"
                    name="department"
                    title="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="" disabled>
                        Select department
                    </option>
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="roleLevel" className="text-sm font-medium">
                    Role Level <span className="text-destructive">*</span>
                </Label>
                <select
                    id="roleLevel"
                    name="roleLevel"
                    title="Role level"
                    value={roleLevel}
                    onChange={(e) => setRoleLevel(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="" disabled>
                        Select role level
                    </option>
                    {ROLE_LEVELS.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>

            <Button type="submit" disabled={isPending} className="mt-2 w-full">
                {isPending ? "Starting onboarding…" : "Begin Onboarding"}
            </Button>
        </form>
    );
}
