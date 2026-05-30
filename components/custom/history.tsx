"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import useSWR from "swr";

import type { Chat } from "@/db/schema";
import { cn, fetcher } from "@/lib/utils";

import { MenuIcon, PencilEditIcon, TrashIcon } from "./icons";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export const History = () => {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const deletingRef = useRef<Set<string>>(new Set());

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Chat[]>("/api/history", fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  useEffect(() => {
    setIsHistoryVisible(false);
    mutate();
  }, [pathname, mutate]);

  useEffect(() => {
    router.prefetch("/");
    for (const chat of history ?? []) {
      router.prefetch(`/chat/${chat.id}`);
    }
  }, [history, router]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const filtered = history?.filter((h) => !deletingRef.current.has(h.id));

  const handleNew = () => {
    setIsHistoryVisible(false);
    if (pathname === "/") {
      router.refresh();
      return;
    }
    router.replace("/");
    router.refresh();
  };

  const handleDelete = async (chatId: string) => {
    const currentId = Array.isArray(id) ? id[0] : id;
    const isActive = chatId === currentId;
    deletingRef.current.add(chatId);

    mutate(
      (prev) => prev?.filter((h) => h.id !== chatId),
      { revalidate: false },
    );

    setIsHistoryVisible(false);

    if (isActive) {
      router.replace("/");
    }

    try {
      const res = await fetch(`/api/chat?id=${chatId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      deletingRef.current.delete(chatId);
      mutate();
    }
  };

  const startRename = (chatId: string, currentTitle: string) => {
    setEditingId(chatId);
    setEditValue(currentTitle || "");
  };

  const saveRename = async () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }

    mutate(
      (prev) =>
        prev?.map((h) =>
          h.id === editingId ? { ...h, title: editValue.trim() } : h,
        ),
      { revalidate: false },
    );

    const savedId = editingId;
    setEditingId(null);

    try {
      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId, title: editValue.trim() }),
      });
    } catch {
      toast.error("Failed to rename");
      mutate();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="p-1.5 h-fit"
        onClick={() => setIsHistoryVisible(true)}
      >
        <MenuIcon />
      </Button>

      <Sheet open={isHistoryVisible} onOpenChange={setIsHistoryVisible}>
        <SheetContent side="left" className="!p-0 !gap-0 w-72 bg-background border-r border-border flex flex-col [&>button.absolute]:hidden">
          <SheetHeader>
            <VisuallyHidden.Root>
              <SheetTitle>History</SheetTitle>
              <SheetDescription>{filtered?.length ?? 0} chats</SheetDescription>
            </VisuallyHidden.Root>
          </SheetHeader>

          <div className="p-3 pb-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleNew}
              className="flex-1 flex items-center justify-between rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              New chat
              <PencilEditIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryVisible(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 3L6 8l5 5" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3">
            <div className="px-2 pb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Recent
            </div>

            {!isLoading && filtered?.length === 0 && (
              <div className="text-muted-foreground text-sm text-center py-12">
                No chats yet
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col gap-1 px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {filtered?.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                  chat.id === id
                    ? "bg-muted"
                    : "hover:bg-muted/50",
                )}
              >
                {editingId === chat.id ? (
                  <input
                    ref={editRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 text-sm py-0.5 px-1 bg-transparent outline-none border-b border-primary"
                  />
                ) : (
                  <Link
                    href={`/chat/${chat.id}`}
                    prefetch
                    onClick={() => setIsHistoryVisible(false)}
                    className="flex-1 text-sm truncate text-foreground/80"
                  >
                    {chat.title || "Untitled"}
                  </Link>
                )}

                {editingId !== chat.id && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startRename(chat.id, chat.title || "")}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <PencilEditIcon size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(chat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <TrashIcon />
                    </button>
                    {chat.id === id && (
                      <div className="size-1.5 rounded-full bg-primary ml-0.5" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border p-2 flex flex-col gap-1">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
              >
                {theme === "dark" ? (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
