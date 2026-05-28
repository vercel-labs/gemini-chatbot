"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { Checklist } from "@/components/onboarding/checklist";

interface EuzChatProps {
    chatId: string;
    sessionId: string;
    department: string;
    roleLevel: string;
    employeeName?: string;
    sessionStatus: "in_progress" | "completed";
}

export function EuzChat({
    chatId,
    sessionId,
    department,
    roleLevel,
    employeeName,
    sessionStatus,
}: EuzChatProps) {
    const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
        useChat({
            id: chatId,
            api: "/onboarding/api/chat",
            body: { id: chatId, sessionId },
            maxSteps: 10,
        });

    const [messagesContainerRef, messagesEndRef] =
        useScrollToBottom<HTMLDivElement>();

    const [attachments, setAttachments] = useState<Array<Attachment>>([]);

    return (
        <div className="flex flex-row h-dvh bg-background overflow-hidden">
            {/* ── Sidebar: Checklist ── */}
            <aside className="hidden md:flex flex-col w-72 shrink-0 border-r bg-card">
                <div className="px-4 py-3 border-b">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Onboarding Checklist
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {department} · {roleLevel}
                    </p>
                </div>
                <Checklist sessionId={sessionId} />
            </aside>

            {/* ── Main Chat Area ── */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                            E.U.Z Helper
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {employeeName
                                ? `Onboarding: ${employeeName}`
                                : "Onboarding Assistant"}{" "}
                            ·{" "}
                            {sessionStatus === "completed" ? (
                                <span className="text-primary">Completed</span>
                            ) : (
                                <span className="text-amber-500">In Progress</span>
                            )}
                        </span>
                    </div>
                </header>

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex flex-col gap-4 flex-1 overflow-y-auto p-4"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-16">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary">E</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">
                                    Welcome{employeeName ? `, ${employeeName}` : ""}.
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                                    I am E.U.Z Helper, your onboarding assistant. Type a message
                                    to begin your {department} onboarding.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <PreviewMessage
                            key={message.id}
                            chatId={chatId}
                            role={message.role}
                            content={message.content}
                            attachments={message.experimental_attachments}
                            toolInvocations={message.toolInvocations}
                        />
                    ))}

                    <div
                        ref={messagesEndRef}
                        className="shrink-0 min-w-[24px] min-h-[24px]"
                    />
                </div>

                {/* Input */}
                <form className="flex flex-row gap-2 relative items-end px-4 pb-4 md:pb-6 pt-2 shrink-0">
                    <MultimodalInput
                        input={input}
                        setInput={setInput}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        stop={stop}
                        attachments={attachments}
                        setAttachments={setAttachments}
                        messages={messages}
                        append={append}
                    />
                </form>
            </div>
        </div>
    );
}
