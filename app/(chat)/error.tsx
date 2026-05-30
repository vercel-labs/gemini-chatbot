"use client";

import { useRouter } from "next/navigation";

export default function Error({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-dvh bg-background items-center justify-center gap-4">
      <p className="text-muted-foreground text-sm">Something went wrong</p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-80 transition-opacity"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm hover:opacity-80 transition-opacity"
        >
          New chat
        </button>
      </div>
    </div>
  );
}
